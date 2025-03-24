using Microsoft.EntityFrameworkCore;
using NavicomInformatica.Models;
using NavicomInformatica.Interfaces;
using NavicomInformatica.Data;

namespace NavicomInformatica.Repositories
{
    public class CarritoRepository : ICarritoRepository
    {
        private readonly DataBaseContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;


        public CarritoRepository(DataBaseContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Carrito> ObtenerCarritoPorUsuarioIdAsync(int idUsuario)
        {
            return await _context.Carritos
                .Include(c => c.Items)
                .ThenInclude(item => item.Producto)
                .FirstOrDefaultAsync(c => c.IdUsuario == idUsuario);
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

        public async Task AddCarritoItemAsync(int usuarioId, int idProducto, int cantidad)
        {
            // Obtener o crear un carrito
            var carrito = await _context.Carritos.FirstOrDefaultAsync(c => c.IdUsuario == usuarioId);
            if (carrito == null)
            {
                carrito = new Carrito { IdUsuario = usuarioId, Estado = "Activo" };
                _context.Carritos.Add(carrito);
                await _context.SaveChangesAsync();
            }

            // Verificar que el producto exista
            var producto = await _context.Products.FindAsync(idProducto);
            if (producto == null)
            {
                throw new Exception($"El producto con ID {idProducto} no existe.");
            }

            // Agregar el CarritoItem
            var item = new CarritoItem
            {
                CarritoId = carrito.CarritoId,
                idProducto = idProducto,
                Cantidad = cantidad
            };
            _context.CarritoItems.Add(item);
            await _context.SaveChangesAsync();
        }




        public async Task SincronizarCarritoAlAutenticarAsync(int idUsuarioAutenticado)
        {
            // Obtener el ID del carrito temporal desde la cookie
            var carritoIdCookie = _httpContextAccessor.HttpContext.Request.Cookies["CarritoId"];

            if (string.IsNullOrEmpty(carritoIdCookie) || !int.TryParse(carritoIdCookie, out int carritoIdTemporal))
            {
                // No hay carrito temporal que sincronizar
                return;
            }

            // Buscar el carrito temporal en la base de datos
            var carritoTemporal = await _context.Carritos
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.CarritoId == carritoIdTemporal && c.IdUsuario == 0 && c.Estado == "Temporal");

            if (carritoTemporal == null)
            {
                // El carrito temporal no existe
                return;
            }

            // Obtener o crear el carrito del usuario autenticado
            var carritoUsuario = await ObtenerOCrearCarritoPorUsuarioIdAsync(idUsuarioAutenticado);

            // Fusionar los ítems del carrito temporal con el carrito del usuario
            foreach (var itemTemporal in carritoTemporal.Items)
            {
                var itemExistente = carritoUsuario.Items.FirstOrDefault(i => i.idProducto == itemTemporal.idProducto);
                if (itemExistente != null)
                {
                    // Si el producto ya está en el carrito, sumar la cantidad
                    itemExistente.Cantidad += itemTemporal.Cantidad;
                }
                else
                {
                    // Si no existe, agregar el ítem al carrito del usuario
                    var nuevoItem = new CarritoItem
                    {
                        idProducto = itemTemporal.idProducto,
                        Cantidad = itemTemporal.Cantidad,
                        CarritoId = carritoUsuario.CarritoId
                    };
                    carritoUsuario.Items.Add(nuevoItem);
                }
            }

            // Eliminar el carrito temporal
            _context.Carritos.Remove(carritoTemporal);

            // Guardar los cambios en la base de datos
            await _context.SaveChangesAsync();

            // Eliminar la cookie del carrito temporal
            _httpContextAccessor.HttpContext.Response.Cookies.Delete("CarritoId");
        }

        public async Task DeleteCarritoItemAsync(int id)
        {
            var carritoItem = await _context.CarritoItems.FindAsync(id);
            if (carritoItem != null)
            {
                _context.CarritoItems.Remove(carritoItem);
                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateException ex)
                {
                    // Registrar la excepción interna para obtener más detalles
                    Console.WriteLine(ex.InnerException?.Message);
                    throw;
                }
            }
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
                .AnyAsync(c => c.IdUsuario == idUsuario && c.Items.Any(item => item.idProducto == idProductos && item.Comprado));
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
            // Intentar obtener el carrito existente del usuario
            var carritoExistente = await _context.Carritos
                .Include(c => c.Items) // Incluir los ítems del carrito si los necesitas
                .FirstOrDefaultAsync(c => c.IdUsuario == idUsuario && c.Estado == "Activo");

            if (carritoExistente != null)
            {
                return carritoExistente; // Devolver el carrito existente si lo encontramos
            }

            // Si no existe un carrito activo, crear uno nuevo
            var nuevoCarrito = new Carrito
            {
                IdUsuario = idUsuario,
                Estado = "Activo",
                FechaCreacion = DateTime.UtcNow,
                Items = new List<CarritoItem>() // Inicializar la lista de ítems
            };

            // Agregar el nuevo carrito al contexto
            _context.Carritos.Add(nuevoCarrito);
            await _context.SaveChangesAsync();

            return nuevoCarrito; // Devolver el carrito recién creado
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

        public async Task<Carrito> ObtenerOCrearCarritoParaUsuarioNoAutenticadoAsync()
        {
            // Obtener el identificador de la cookie del carrito
            var carritoIdCookie = _httpContextAccessor.HttpContext.Request.Cookies["CarritoId"];

            Carrito carrito;

            if (string.IsNullOrEmpty(carritoIdCookie) || !int.TryParse(carritoIdCookie, out int carritoId))
            {
                // Si no hay cookie o no es válida, crear un nuevo carrito
                carrito = new Carrito
                {
                    IdUsuario = 0, // Indica que es un carrito temporal para usuario no autenticado
                    Estado = "Temporal",
                    FechaCreacion = DateTime.UtcNow,
                    Items = new List<CarritoItem>()
                };

                // Guarda el carrito en la base de datos
                _context.Carritos.Add(carrito);
                await _context.SaveChangesAsync();

                // Establecer una cookie con el ID del carrito
                _httpContextAccessor.HttpContext.Response.Cookies.Append("CarritoId", carrito.CarritoId.ToString(), new CookieOptions
                {
                    Expires = DateTimeOffset.UtcNow.AddDays(30), // La cookie expira en 30 días
                    HttpOnly = true, // Para mayor seguridad, no accesible desde JavaScript
                    Secure = true, // Solo enviar en HTTPS
                    SameSite = SameSiteMode.Strict // Prevenir CSRF
                });
            }
            else
            {
                // Si hay una cookie válida, obtener el carrito de la base de datos
                carrito = await _context.Carritos
                    .Include(c => c.Items)
                    .FirstOrDefaultAsync(c => c.CarritoId == carritoId && c.IdUsuario == 0 && c.Estado == "Temporal");

                if (carrito == null)
                {
                    // Si no se encuentra el carrito, crear uno nuevo
                    carrito = new Carrito
                    {
                        IdUsuario = 0,
                        Estado = "Temporal",
                        FechaCreacion = DateTime.UtcNow,
                        Items = new List<CarritoItem>()
                    };

                    // Guarda el carrito en la base de datos
                    _context.Carritos.Add(carrito);
                    await _context.SaveChangesAsync();

                    // Actualizar la cookie con el nuevo ID del carrito
                    _httpContextAccessor.HttpContext.Response.Cookies.Append("CarritoId", carrito.CarritoId.ToString(), new CookieOptions
                    {
                        Expires = DateTimeOffset.UtcNow.AddDays(30),
                        HttpOnly = true,
                        Secure = true,
                        SameSite = SameSiteMode.Strict
                    });
                }
            }

            return carrito;
        }
    }
}
