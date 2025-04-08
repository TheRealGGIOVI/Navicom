namespace NavicomInformatica.DTO
{
    public class ProductSearchDTO
    {
        public string SearchText { get; set; } // Texto de búsqueda
        public string SortBy { get; set; } // "price-asc", "price-desc", "name-asc", "name-desc"
        public string Category { get; set; } // Categoría para filtrar
        public int Page { get; set; } = 1; // Página (por defecto 1)
        public int Limit { get; set; } = 10; // Límite por página (por defecto 10)
    }
}