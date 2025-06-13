using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Stripe.Checkout;
using NavicomInformatica.Models;

namespace NavicomInformatica.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    
    public class CheckoutController : ControllerBase
    {
        private readonly StripeSettings _stripe;
        public CheckoutController(IOptions<StripeSettings> stripe) => _stripe = stripe.Value;

        [HttpPost("create-session")]
        public IActionResult CreateSession([FromBody] CreateSessionDto dto)
        {
            var lineItems = dto.Items.Select(p => new SessionLineItemOptions
            {
                Quantity = p.Quantity,
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "eur",
                    UnitAmount = p.UnitAmountCents,
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = p.ProductName,
                        Description = p.Description,
                        Images = new List<string> { p.ImageUrl }
                    }
                }
            }).ToList();

            var options = new SessionCreateOptions
            {
                Mode = "payment",
                SuccessUrl = $"{_stripe.Domain}/success?session_id={{CHECKOUT_SESSION_ID}}",
                CancelUrl = $"{_stripe.Domain}/cancel",
                LineItems = lineItems,
                ShippingAddressCollection = new SessionShippingAddressCollectionOptions
                {
                    AllowedCountries = new List<string>
                    {
                        "ES",
                    }
                }
            };

            var session = new SessionService().Create(options);
            return Ok(new { sessionId = session.Id });
        }


        [HttpGet("success")]
        public async Task<IActionResult> Success([FromQuery] string sessionId)
        {
            var sessionService = new SessionService();
            var session = await sessionService.GetAsync(sessionId, new SessionGetOptions
            {
                Expand = new List<string> { "customer_details" }
            });

            // Listamos las líneas sin expandir nada
            var lineItems = await sessionService.ListLineItemsAsync(sessionId, new SessionLineItemListOptions
            {
                Limit = 100
            });

            // 3) Guardar en la base de datos (si no existe aún)
            //if (!await _db.Orders.AnyAsync(o => o.SessionId == session.Id))
            //{
            //    var order = new Order
            //    {
            //        SessionId = session.Id,
            //        AmountTotal = session.AmountTotal ?? 0,
            //        Currency = session.Currency,
            //        CustomerEmail = session.CustomerDetails?.Email,
            //        CreatedAt = DateTime.UtcNow
            //    };
            //    _db.Orders.Add(order);
            //    await _db.SaveChangesAsync();
            //}

            var result = new
            {
                session.Id,
                session.AmountTotal,
                session.Currency,
                customerEmail = session.CustomerDetails?.Email,
                items = lineItems.Data.Select(li => new {
                    id = li.Id,
                    quantity = li.Quantity,
                    // aquí usamos Description, que será tu ProductData.Name
                    productName = li.Description,
                    unitAmount = li.Price?.UnitAmount,
                    currency = li.Price?.Currency
                })
            };

            return Ok(result);
        }
    }

    public class CreateSessionDto
    {
        public List<CartItemDto> Items { get; set; }
    }

    public class CartItemDto
    {
        public string ProductName { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public int Quantity { get; set; }
        public long UnitAmountCents { get; set; }
    }
}
