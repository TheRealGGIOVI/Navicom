namespace NavicomInformatica.DTO
{
    public class CarritoProductoDTO
    {
        public long CarritoId { get; set; }
        public long ProductoId { get; set; }
        public int Cantidad { get; set; }
    }

    public class CartProductInCartDTO //DTO para mostrar la información sobre el producto dentro del carrito
    {
        public long ProductoId { get; set; }
        public string ProductName { get; set; }
        public string ProductImage { get; set; }
        public double ProductPrice { get; set; }
        public int Quantity { get; set; }
        public double TotalPriceObject { get; set; }
        
    }
}