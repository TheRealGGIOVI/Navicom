using NavicomInformatica.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class CarritoItem
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int CarritoId { get; set; }

    [ForeignKey("CarritoId")]
    public Carrito Carrito { get; set; }

    [Required]
    public int idProducto { get; set; }

    [ForeignKey("idProducto")]
    public Producto Producto { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser al menos 1")]
    public int Cantidad { get; set; }

    [NotMapped]
    public double Subtotal { get; set; }

    public bool Comprado { get; set; }
}
