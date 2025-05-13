using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NavicomInformatica.Models
{
    public class ProductoImagen
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string FileName { get; set; } = string.Empty;

        [NotMapped] // Para compatibilidad con mapeos antiguos
        public string Img_Name
        {
            get => FileName;
            set => FileName = value;
        }

        public long ProductoId { get; set; }
        public Producto Producto { get; set; }
    }
}