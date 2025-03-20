using System.ComponentModel.DataAnnotations;

namespace NavicomInformatica.DTO
{
    public class CarritoItemAgregarDto
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "El idLibro debe ser un número positivo.")]
        public int IdProducto { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser al menos 1.")]
        public int Cantidad { get; set; }
    }
}
