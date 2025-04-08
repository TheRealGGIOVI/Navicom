namespace NavicomInformatica.DTO
{
    public class CarritoMergeDTO
    {   
        public long CarritoId { get; set; }
        public List<ProductoMerge> Productos { get; set; }
    }

    public class ProductoMerge
    {
        public long ProductoId { get; set; }
        public int Cantidad { get; set; }
    }
}
