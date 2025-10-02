namespace NavicomInformatica.DTO
{
    public class ProductDTO
    {
        public long Id { get; set; }
        public string? Brand { get; set; }
        public string? Model { get; set; }
        public double? Precio { get; set; }
        public double? Discount_Price { get; set; }
        public int? Stock { get; set; }
        public string? Description { get; set; }
        public string? Details { get; set; }
        public string? Category { get; set; }
        public bool IsActive { get; set; } = true;


        // Lista de imágenes
        public List<ProductoImagenDTO> Imagenes { get; set; } = new List<ProductoImagenDTO>();

        // Lista de archivos para subir nuevas imágenes
        public List<IFormFile>? Files { get; set; } = new List<IFormFile>();
    }
}