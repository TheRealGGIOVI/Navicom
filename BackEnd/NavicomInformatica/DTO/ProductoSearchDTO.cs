namespace NavicomInformatica.DTO
{
    public class ProductSearchDTO
    {
        public string SearchText { get; set; } // Sin [Required]
        public string SortBy { get; set; }     // Sin [Required]
        public string Category { get; set; }   // Sin [Required]
        public int Page { get; set; }
        public int Limit { get; set; }
    }
}