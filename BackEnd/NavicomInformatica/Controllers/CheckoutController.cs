using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Stripe.Checkout;

namespace NavicomInformatica.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
                LineItems = lineItems
            };

            var session = new SessionService().Create(options);
            return Ok(new { sessionId = session.Id });
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
