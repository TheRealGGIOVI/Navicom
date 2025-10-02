using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NavicomInformatica.Models
{
    public class ProductoImagen
    {
        [Key]
        public long Id { get; set; }

        [Required]
        public string Img_Name { get; set; } // Nombre del archivo de la imagen

        [ForeignKey("Producto")]
        public long ProductoId { get; set; } // Clave foránea hacia Producto

        public Producto Producto { get; set; } // Relación con el producto
    }
}