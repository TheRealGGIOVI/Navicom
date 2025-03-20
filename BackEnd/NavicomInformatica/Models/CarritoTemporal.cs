﻿namespace NavicomInformatica.Models
{
    public class CarritoTemporal
    {
        public List<CarritoItem> Items { get; set; } = new List<CarritoItem>();

        public double Total => Items?.Sum(item => item.Subtotal) ?? 0;
    }
}
