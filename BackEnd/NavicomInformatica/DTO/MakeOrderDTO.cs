namespace NavicomInformatica.DTO
{
    public class MakeOrderDTO
    {
        public string UserId { get; set; } = null!;
        public string SessionId { get; set; } = null!;
        public List<PedidoProductoDTO> Items { get; set; }
    }

    public class PedidoProductoDTO
    {
        public string Nombre { get; set; }
        public decimal PrecioUnitario { get; set; }
        public int Cantidad { get; set; }
    }
}
