using Stripe;
using Stripe.Checkout;


namespace NavicomInformatica.Models
{
    public class SuccessViewModel
    {
        public string SessionId { get; set; }
        public string CustomerEmail { get; set; }
        public long AmountTotal { get; set; }
        public string Currency { get; set; }
        public SessionCollectedInformationShippingDetails ShippingDetails { get; set; }

        public IList<LineItem> LineItems { get; set; }

    }

}
