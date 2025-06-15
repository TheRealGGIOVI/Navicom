using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NavicomInformatica.Models;

public class OrderItem
{
    [Key]
    public int Id { get; set; }

    public string OrderId { get; set; }

    [ForeignKey("OrderId")]
    public Order Order { get; set; }

    public long ProductoId { get; set; }

    [ForeignKey("ProductoId")]
    public Producto Producto { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }
}