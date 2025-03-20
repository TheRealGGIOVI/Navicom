using Microsoft.EntityFrameworkCore;
using NavicomInformatica.Models;
using NavicomInformatica.Interfaces;
using NavicomInformatica.Data;

namespace NavicomInformatica.Repositories
{
    public class CarritoRepository : ICarritoRepository
    {
        private readonly DataBaseContext _context;

        public CarritoRepository(DataBaseContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<Carrito> ObtenerCarritoPorUsuarioIdAsync(int idUsuario)
        {
            return await _context.Carritos
                .Include(c => c.Items)
                .ThenInclude(item => item.Producto)
                .FirstOrDefaultAsync(c => c.UserId == idUsuario);
        }

        public async Task AgregarProductoAlCarritoAsync(Carrito carrito, int idProducto, int cantidad)
        {
            if (carrito == null || cantidad <= 0)
                throw new ArgumentException("El carrito es nulo o la cantidad no es válida.");

            var producto = await _context.Products.FindAsync(idProducto);
            if (producto == null)
            {
                throw new InvalidOperationException($"El producto con ID {idProducto} no existe.");
            }

            var item = carrito.Items.FirstOrDefault(i => i.idProducto == idProducto);
            if (item == null)
            {
                var nuevoItem = new CarritoItem
                {
                    idProducto = idProducto,
                    Cantidad = cantidad,
                    CarritoId = carrito.CarritoId
                };

                _context.CarritoItems.Add(nuevoItem);
                carrito.Items.Add(nuevoItem);
            }
            else
            {
                item.Cantidad += cantidad;
            }

            await GuardarCambiosAsync();
        }

        public async Task<bool> EliminarProductoDelCarritoAsync(Carrito carrito, int idProducto)
        {
            if (carrito == null)
                throw new ArgumentNullException(nameof(carrito));

            var item = carrito.Items.FirstOrDefault(i => i.idProducto == idProducto);
            if (item == null) return false;

            carrito.Items.Remove(item);
            await GuardarCambiosAsync();
            return true;
        }

        public async Task VaciarCarritoAsync(Carrito carrito)
        {
            if (carrito == null)
                throw new ArgumentNullException(nameof(carrito));

            carrito.Items.Clear();
            await GuardarCambiosAsync();
        }

        public async Task GuardarCambiosAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<bool> UsuarioHaCompradoProductoAsync(int idUsuario, int idProductos)
        {
            return await _context.Carritos
                .Include(c => c.Items)
                .AnyAsync(c => c.UserId == idUsuario && c.Items.Any(item => item.idProducto == idProductos && item.Comprado));
        }

        public async Task ComprarCarritoAsync(Carrito carrito)
        {
            if (carrito == null)
                throw new ArgumentNullException(nameof(carrito));

            foreach (var item in carrito.Items)
            {
                item.Comprado = true;
            }
            carrito.Items.Clear();
            await GuardarCambiosAsync();
        }

        public async Task<Carrito> ObtenerOCrearCarritoPorUsuarioIdAsync(int idUsuario)
        {
            var carrito = await _context.Carritos
                .Include(c => c.Items)
                .ThenInclude(item => item.Producto)
                .FirstOrDefaultAsync(c => c.UserId == idUsuario);

            if (carrito == null)
            {
                carrito = new Carrito { UserId = idUsuario };
                _context.Carritos.Add(carrito);
                await _context.SaveChangesAsync();
            }

            return carrito;
        }

        public async Task<bool> ActualizarCantidadProductoAsync(Carrito carrito, int idProducto, int nuevaCantidad)
        {
            Console.WriteLine($"Carrito recibido: {carrito.Items.Count} items.");

            var item = carrito.Items.FirstOrDefault(i => i.idProducto == idProducto);
            if (item == null)
            {
                Console.WriteLine("Producto no encontrado en el carrito.");
                return false;
            }

            Console.WriteLine($"Producto encontrado: {item.idProducto}, actualizando la cantidad a {nuevaCantidad}.");
            item.Cantidad = nuevaCantidad;
            _context.CarritoItems.Update(item);
            await _context.SaveChangesAsync();
            return true;
        }


    }
}
