namespace NavicomInformatica.DTO
{
    public class OrderSummaryDto
    {
        public string OrderId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public decimal TotalAmount { get; set; }
        public string Currency { get; set; } = "eur";
        public List<OrderItemDto> Items { get; set; } = new();
    }
    public class OrderItemDto
    {
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal PrecioUnitario { get; set; }
        public string? ImageUrl { get; set; }
    }
}
