using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace NavicomInformatica.Models
{
    public class Producto
    {
        [Key]
        public long Id { get; set; }
        public string? Brand { get; set; }
        public string? Model { get; set; }
        public double? Precio { get; set; }
        public double? Discount_Price { get; set; }
        public int? Stock { get; set; }
        public string? Description { get; set; }
        public string? Details { get; set; }
        public string? Category { get; set; }

        public List<ProductoImagen> Imagenes { get; set; } = new List<ProductoImagen>();
    }
}