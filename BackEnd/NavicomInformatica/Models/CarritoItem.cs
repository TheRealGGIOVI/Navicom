using NavicomInformatica.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class CarritoItem
{
    [Key]
    public long Id { get; set; }
    public int? Cantidad { get; set; }
    public double? PrecioTotalProducto { get; set; }

    [ForeignKey("Producto")]
    public long ProductoId { get; set; }
    public Producto Producto { get; set; }

    [ForeignKey("Carrito")]
    public long CarritoId { get; set; }
    public Carrito Carrito { get; set; }
}
