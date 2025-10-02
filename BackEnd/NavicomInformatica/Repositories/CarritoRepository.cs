using Microsoft.EntityFrameworkCore;
using NavicomInformatica.Models;
using NavicomInformatica.Interfaces;
using NavicomInformatica.Data;
using NavicomInformatica.DTO;

namespace NavicomInformatica.Repositories
{
    public class CarritoRepository : ICarritoRepository
    {
        private readonly DataBaseContext _context;


        public CarritoRepository(DataBaseContext context)
        {
            _context = context;
        }

        public async Task AddCartToUserAsync(Carrito carrito)
        {
            _context.Carritos.Add(carrito);
            await _context.SaveChangesAsync();
        }

        public async Task AddToCartAsync(CarritoItem productoCarrito)
        {
            var carritoProductDTO = new CarritoProductoDTO
            {
                CarritoId = productoCarrito.CarritoId,
                ProductoId = productoCarrito.ProductoId,
                Cantidad = productoCarrito.Cantidad ?? 0
            };

            var carrito = await _context.Carritos
                .Include(c => c.Productos)
                .FirstOrDefaultAsync(c => c.Id == carritoProductDTO.CarritoId);

            if (carrito == null)
            {
                throw new Exception($"Carrito con ID {carritoProductDTO.CarritoId} no encontrado.");
            }

            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == carritoProductDTO.ProductoId);

            if (product == null)
            {
                throw new Exception($"Producto con ID {carritoProductDTO.ProductoId} no encontrado.");
            }

            if (carritoProductDTO.Cantidad > product.Stock)
            {
                throw new Exception("No hay suficiente stock disponible.");
            }

            var existingProduct = carrito.Productos
                .FirstOrDefault(cp => cp.ProductoId == carritoProductDTO.ProductoId);

            if (existingProduct != null)
            {
                if (existingProduct.Cantidad + carritoProductDTO.Cantidad > product.Stock)
                {
                    throw new Exception("No hay suficiente stock disponible para esta cantidad.");
                }
                existingProduct.Cantidad += carritoProductDTO.Cantidad;
            }
            else
            {
                var newCartProduct = new CarritoItem
                {
                    CarritoId = carrito.Id,
                    ProductoId = carritoProductDTO.ProductoId,
                    Cantidad = carritoProductDTO.Cantidad,
                };

                carrito.Productos.Add(newCartProduct);
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException dbEx)
            {
                throw new Exception($"Error al guardar los cambios en la base de datos: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
        }

        public async Task<Carrito> GetCartByIdAsync(long carritoId)
        {
            return await _context.Carritos
            .Include(c => c.Productos)
            .ThenInclude(cp => cp.Producto)
            .ThenInclude(p => p.Imagenes)
            .FirstOrDefaultAsync(c => c.Id == carritoId);
        }

        public async Task RemoveAllProductsFromCartAsync(long carritoId)
        {
            var cartProduct = await _context.CarritoItems
                                        .Where(cp => cp.CarritoId == carritoId)
                                        .ToListAsync();

            _context.CarritoItems.RemoveRange(cartProduct);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveProductFromCartAsync(long carritoId, long productoId)
        {
            var cartProduct = await _context.CarritoItems
                                        .FirstOrDefaultAsync(cp => cp.CarritoId == carritoId && cp.ProductoId == productoId);

            _context.CarritoItems.Remove(cartProduct);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task UpdateProductAsync(CarritoProductoDTO carritoProductoDTO)
        {
            var cartProduct = await _context.CarritoItems
            .Include(cp => cp.Producto)
            .FirstOrDefaultAsync(cp => cp.CarritoId == carritoProductoDTO.CarritoId && cp.ProductoId == carritoProductoDTO.ProductoId);

            if (cartProduct == null)
            {
                throw new Exception("Producto no encontrado en el carrito");
            }

            if (carritoProductoDTO.Cantidad > cartProduct.Producto.Stock)
            {
                throw new Exception("No hay suficiente stock para la cantidad solicitada");
            }

            if (carritoProductoDTO.Cantidad <= 0)
            {
                throw new Exception("La cantidad debe ser mayor a 0");
            }
            cartProduct.Cantidad = carritoProductoDTO.Cantidad;

            cartProduct.PrecioTotalProducto = cartProduct.Cantidad * (cartProduct.Producto.Precio ?? 0.0);

            var cart = await _context.Carritos
                .Include(c => c.Productos)
                .FirstOrDefaultAsync(c => c.Id == carritoProductoDTO.CarritoId);

            if (cart == null)
            {
                throw new Exception("El carrito no encontrado");
            }

            cart.TotalPrice = cart.Productos.Sum(cp => cp.PrecioTotalProducto ?? 0.0);

            await _context.SaveChangesAsync();
        }

        public async Task MergeCartAsync(CarritoMergeDTO carritoMerge)
        {
            var carrito = await _context.Carritos
                .Include(c => c.Productos)
                .ThenInclude(p => p.Producto)
                .FirstOrDefaultAsync(c => c.Id == carritoMerge.CarritoId);

            if (carrito == null)
                throw new Exception($"Carrito con ID {carritoMerge.CarritoId} no encontrado.");

            foreach (var producto in carritoMerge.Productos)
            {
                var productoDB = await _context.Products.FirstOrDefaultAsync(p => p.Id == producto.ProductoId);
                if (productoDB == null)
                    throw new Exception($"Producto con ID {producto.ProductoId} no encontrado.");

                int stockDisponible = productoDB.Stock ?? 0;
                int cantidadNueva = producto.Cantidad;

                if (cantidadNueva <= 0)
                    continue;

                var existente = carrito.Productos.FirstOrDefault(p => p.ProductoId == producto.ProductoId);

                if (existente != null)
                {
                    int cantidadExistente = existente.Cantidad ?? 0;
                    int nuevaCantidad = cantidadExistente + cantidadNueva;
                    existente.Cantidad = Math.Min(nuevaCantidad, stockDisponible);
                }
                else
                {
                    carrito.Productos.Add(new CarritoItem
                    {
                        CarritoId = carrito.Id,
                        ProductoId = producto.ProductoId,
                        Cantidad = Math.Min(cantidadNueva, stockDisponible),
                    });
                }
            }

            carrito.TotalPrice = carrito.Productos.Sum(p =>
            {
                var precio = p.Producto?.Precio ?? 0.0;
                var cantidad = p.Cantidad ?? 0;
                return precio * cantidad;
            });

            await _context.SaveChangesAsync();
        }

    }
}
