using System.ComponentModel.DataAnnotations;

namespace NavicomInformatica.Models;

public class Order
{
    [Key]
    public string Id { get; set; } // Será el session.Id de Stripe

    public long UserId { get; set; }

    public decimal TotalAmount { get; set; }

    public string Currency { get; set; }

    public DateTime CreatedAt { get; set; }

    public ICollection<OrderItem> Items { get; set; }
}
