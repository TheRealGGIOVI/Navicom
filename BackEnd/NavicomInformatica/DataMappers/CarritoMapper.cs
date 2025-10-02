using NavicomInformatica.DTO;
using NavicomInformatica.Models;

namespace NavicomInformatica.DataMappers
{
    public class CarritoMapper
    {
        public CarritoDTO CarritoToDTO(Carrito carrito)
        {
            return new CarritoDTO
            {
                UserId = carrito.UserId,
                CarritoProducto = carrito.Productos.Select(cp => new CarritoProductoDTO
                {
                    ProductoId = cp.ProductoId,
                    Cantidad = cp.Cantidad ?? 0
                }).ToList()
            };
        }

        public Carrito DTOToCarrito(CarritoDTO carritoDTO)
        {
            return new Carrito
            {
                UserId = carritoDTO.UserId,
                Productos = carritoDTO.CarritoProducto.Select(c => new CarritoItem
                {
                    ProductoId = c.ProductoId,
                    Cantidad = c.Cantidad,
                }).ToList()
            };
        }
    }
}
