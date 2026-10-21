using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Stripe.Checkout;
using NavicomInformatica.Models;
using Stripe;
using Microsoft.AspNetCore.Authorization;


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
            try
            {
                var secretKey = _stripe.SecretKey;
                if (string.IsNullOrWhiteSpace(secretKey))
                {
                    secretKey = Environment.GetEnvironmentVariable("Stripe__SecretKey")
                             ?? Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY");
                }

                if (string.IsNullOrWhiteSpace(secretKey) || secretKey.Contains("placeholder") || secretKey.Contains("temporal"))
                {
                    return BadRequest(new
                    {
                        error = "Clave de Stripe no configurada",
                        message = "Para tramitar pagos con tarjeta necesitas configurar una clave secreta válida en Vercel (Stripe__SecretKey=sk_test_...)."
                    });
                }

                StripeConfiguration.ApiKey = secretKey;

                var domain = !string.IsNullOrWhiteSpace(dto.Origin)
                    ? dto.Origin.TrimEnd('/')
                    : !string.IsNullOrWhiteSpace(_stripe.Domain)
                        ? _stripe.Domain.TrimEnd('/')
                        : Request.Headers.ContainsKey("Origin")
                            ? Request.Headers["Origin"].ToString().TrimEnd('/')
                            : $"{Request.Scheme}://{Request.Host}";

                var lineItems = dto.Items.Select(p =>
                {
                    var productData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = p.ProductName,
                        Description = p.Description
                    };

                    if (!string.IsNullOrWhiteSpace(p.ImageUrl) &&
                        Uri.TryCreate(p.ImageUrl, UriKind.Absolute, out var parsedUri) &&
                        (parsedUri.Scheme == Uri.UriSchemeHttp || parsedUri.Scheme == Uri.UriSchemeHttps) &&
                        !p.ImageUrl.Contains("localhost"))
                    {
                        productData.Images = new List<string> { p.ImageUrl };
                    }

                    return new SessionLineItemOptions
                    {
                        Quantity = p.Quantity,
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "eur",
                            UnitAmount = p.UnitAmountCents,
                            ProductData = productData
                        }
                    };
                }).ToList();

                var options = new SessionCreateOptions
                {
                    Mode = "payment",
                    SuccessUrl = $"{domain}/success?session_id={{CHECKOUT_SESSION_ID}}",
                    CancelUrl = $"{domain}/cancel",
                    LineItems = lineItems,
                    ShippingAddressCollection = new SessionShippingAddressCollectionOptions
                    {
                        AllowedCountries = new List<string> { "ES" }
                    }
                };

                var session = new SessionService().Create(options);
                return Ok(new { sessionId = session.Id });
            }
            catch (StripeException ex)
            {
                return BadRequest(new
                {
                    error = "Error de Stripe",
                    message = ex.StripeError?.Message ?? ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    error = "Error interno al crear sesión de pago",
                    message = ex.Message
                });
            }
        }


        [HttpGet("success")]
        public async Task<IActionResult> Success([FromQuery] string sessionId)
        {
            var secretKey = _stripe.SecretKey;
            if (string.IsNullOrWhiteSpace(secretKey))
            {
                secretKey = Environment.GetEnvironmentVariable("Stripe__SecretKey")
                         ?? Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY");
            }
            if (!string.IsNullOrWhiteSpace(secretKey))
            {
                StripeConfiguration.ApiKey = secretKey;
            }

            var sessionService = new SessionService();
            var session = await sessionService.GetAsync(sessionId, new SessionGetOptions
            {
                Expand = new List<string> { "customer_details" }
            });
            var lineItems = await sessionService.ListLineItemsAsync(sessionId, new SessionLineItemListOptions
            {
                Limit = 100,
                Expand = new List<string> { "data.price.product" }
            });
            var result = new
            {
                session.Id,
                session.AmountTotal,
                session.Currency,
                customerEmail = session.CustomerDetails?.Email,
                items = lineItems.Data.Select(li =>
                {
                    var product = li.Price?.Product as Product;
                    return new
                    {
                        id = li.Id,
                        quantity = li.Quantity,
                        productName = product?.Name ?? li.Description,
                        unitAmount = li.Price?.UnitAmount,
                        currency = li.Price?.Currency,
                        imageUrl = product?.Images?.FirstOrDefault(),
                        description = product?.Description
                    };
                })
            };

            return Ok(result);
        }
    }

    public class CreateSessionDto
    {
        public string? Origin { get; set; }
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
