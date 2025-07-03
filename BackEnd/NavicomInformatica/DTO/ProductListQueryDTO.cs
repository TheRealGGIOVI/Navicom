namespace NavicomInformatica.DTO
{
    public class ProductListQueryDTO
    {
        public int Page { get; set; } = 1;
        public int Limit { get; set; } = 10;
        public bool? IsActive { get; set; }
    }
}
