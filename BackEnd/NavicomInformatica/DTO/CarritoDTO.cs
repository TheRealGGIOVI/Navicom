﻿namespace NavicomInformatica.DTO
{
    public class CarritoDTO
    {
        public int CarritoId { get; set; }
        public int UserId { get; set; }
        public List<CarritoItemDTO> Items { get; set; }
        public int Total { get; set; }
    }

    public class CarritoItemDTO
    {
        public int ProductoId { get; set; }
        public string NombreProducto { get; set; }
        public int Cantidad { get; set; }
        public int Subtotal { get; set; }

        public string UrlImagen { get; set; }

        public int Precio { get; set; }
    }
}
