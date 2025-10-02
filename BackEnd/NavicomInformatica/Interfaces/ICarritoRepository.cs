using NavicomInformatica.DTO;
using NavicomInformatica.Models;

namespace NavicomInformatica.Interfaces
{
    public interface ICarritoRepository
    {
        Task<Carrito> GetCartByIdAsync(long carritoId);
        Task AddToCartAsync(CarritoItem productoCarrito);
        Task SaveChangesAsync();
        Task AddCartToUserAsync(Carrito carrito);
        Task RemoveProductFromCartAsync(long carritoId, long productoId);
        Task UpdateProductAsync(CarritoProductoDTO carritoProductoDTO);
        Task RemoveAllProductsFromCartAsync(long carritoId);
        Task MergeCartAsync(CarritoMergeDTO carritoMerge);
    }
}
