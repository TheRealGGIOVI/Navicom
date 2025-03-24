using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NavicomInformatica.DTO;
using NavicomInformatica.Interfaces;
using NavicomInformatica.Models;
using System.Security.Claims;

namespace NavicomInformatica.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CarritoController : ControllerBase
    {
        private readonly ICarritoRepository _carritoRepository;
        private readonly IProductoRepository _productoRepository;
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CarritoController(
            ICarritoRepository carritoRepository,
            IProductoRepository productoRepository,
            IUserRepository userRepository,
            IUnitOfWork unitOfWork)
        {
            _carritoRepository = carritoRepository;
            _productoRepository = productoRepository;
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
        }

        private string GetUserByEmailAsync()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        [HttpGet("ListarCarrito")]
        [AllowAnonymous]
        public async Task<IActionResult> ObtenerCarrito(string correo = null)
        {
            long idUsuario;

            if (!string.IsNullOrEmpty(correo))
            {
                var usuarioPorCorreo = await _userRepository.GetUserByEmailAsync(correo);
                if (usuarioPorCorreo == null)
                    return NotFound(new { error = "Usuario no encontrado con ese correo." });

                idUsuario = usuarioPorCorreo.Id;
            }
            else
            {
                idUsuario = long.Parse(GetUserByEmailAsync());
            }

            var usuario = await _userRepository.GetUserByIdAsync(idUsuario);
            if (usuario == null)
                return NotFound(new { error = "Usuario no encontrado." });

            var carrito = await _carritoRepository.ObtenerCarritoPorUsuarioIdAsync((int)usuario.Id);
            if (carrito == null)
            {
                return NotFound(new { error = "No existe un carrito asociado al usuario." });
            }

            var carritoDto = new CarritoDTO
            {
                CarritoId = carrito.CarritoId,
                UserId = carrito.IdUsuario, // Cambiado de carrito.UserId a carrito.IdUsuario
                Items = carrito.Items.Select(item => new CarritoItemDTO
                {
                    ProductoId = item.idProducto,
                    NombreProducto = item.Producto?.Model ?? "Producto desconocido",
                    Cantidad = item.Cantidad,
                    Subtotal = (int)item.Subtotal,
                    UrlImagen = item.Producto?.Img_Name ?? string.Empty,
                    Precio = (int)(item.Producto?.Precio ?? 0)
                }).ToList(),
                Total = carrito.Items.Sum(item => (int)item.Subtotal) // Cambiado de carrito.Total a carrito.Items.Sum(item => (int)item.Subtotal)
            };

            return Ok(carritoDto);
        }

        [HttpPost("agregar")]
        [AllowAnonymous]
        public async Task<IActionResult> AgregarProductoAlCarrito([FromBody] CarritoItemAgregarDto itemDto)
        {
            try
            {
                var producto = await _productoRepository.GetProductByIdAsync(itemDto.IdProducto);
                if (producto == null)
                {
                    return NotFound(new { error = "El producto especificado no se encuentra disponible." });
                }

                if (producto.Stock < itemDto.Cantidad)
                {
                    return BadRequest(new { error = "No hay suficiente stock para completar la acción.", stockDisponible = producto.Stock });
                }

                Carrito carritoUsuario;

                if (User.Identity.IsAuthenticated)
                {
                    string userEmail = GetUserByEmailAsync();
                    if (string.IsNullOrEmpty(userEmail))
                    {
                        return BadRequest(new { error = "El correo del usuario no puede ser nulo o vacío." });
                    }

                    if (!int.TryParse(userEmail, out int idUsuario))
                    {
                        return BadRequest(new { error = "El ID del usuario no es válido." });
                    }

                    var usuario = await _userRepository.GetUserByIdAsync(idUsuario);
                    if (usuario == null)
                    {
                        return NotFound(new { error = "Usuario no encontrado." });
                    }

                    carritoUsuario = await _carritoRepository.ObtenerOCrearCarritoPorUsuarioIdAsync((int)usuario.Id);
                }
                else
                {
                    // Manejar el carrito para usuarios no autenticados
                    carritoUsuario = await _carritoRepository.ObtenerOCrearCarritoParaUsuarioNoAutenticadoAsync();
                }

                var carritoItem = new CarritoItem
                {
                    CarritoId = carritoUsuario.CarritoId,
                    idProducto = itemDto.IdProducto,
                    Cantidad = itemDto.Cantidad
                };

                // Verificar que el valor de ProductoId no sea nulo
                if (carritoItem.idProducto == 0)
                {
                    return BadRequest(new { error = "El ID del producto no puede ser nulo o cero." });
                }

                await _carritoRepository.AddCarritoItemAsync(carritoItem.CarritoId, carritoItem.idProducto, carritoItem.Cantidad);
                await _unitOfWork.SaveChangesAsync();

                return Ok(new { success = true, message = "El producto se ha añadido al carrito exitosamente." });
                
            }
            catch (DbUpdateException ex)
            {
                // Registrar la excepción interna para obtener más detalles
                Console.WriteLine($"Error: {ex.InnerException?.Message}");
                Console.WriteLine($"Stack Trace: {ex.InnerException?.StackTrace}");
                return StatusCode(500, new { error = "Ocurrió un error inesperado.", detalle = ex.InnerException?.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Ocurrió un error inesperado.", detalle = ex.Message });
            }
        }

        [HttpDelete("eliminar/{idProducto}")]
        public async Task<IActionResult> EliminarProductoDelCarrito(int idProducto)
        {
            int idUsuario = int.Parse(GetUserByEmailAsync());
            var usuario = await _userRepository.GetUserByIdAsync(idUsuario);

            if (usuario == null)
                return NotFound(new { error = "Usuario no encontrado." });

            var carritoUsuario = await _carritoRepository.ObtenerOCrearCarritoPorUsuarioIdAsync((int)usuario.Id);

            var productoEnCarrito = carritoUsuario.Items.FirstOrDefault(p => p.idProducto == idProducto);
            if (productoEnCarrito == null)
            {
                return NotFound(new { error = "El producto no se encuentra en el carrito." });
            }

            bool productoEliminado = await _carritoRepository.EliminarProductoDelCarritoAsync(carritoUsuario, idProducto);

            if (!productoEliminado)
            {
                return NotFound(new { error = "No se pudo eliminar el producto del carrito." });
            }

            return Ok(new { message = "Producto eliminado correctamente del carrito." });
        }

        [HttpDelete("vaciar")]
        public async Task<IActionResult> VaciarCarrito()
        {
            int idUsuario = int.Parse(GetUserByEmailAsync());
            var usuario = await _userRepository.GetUserByIdAsync(idUsuario);

            if (usuario == null)
                return NotFound(new { error = "Usuario no encontrado." });

            var carritoUsuario = await _carritoRepository.ObtenerCarritoPorUsuarioIdAsync((int)usuario.Id);
            if (carritoUsuario == null)
            {
                return NotFound(new { error = "No existe un carrito asociado al usuario." });
            }

            await _carritoRepository.VaciarCarritoAsync(carritoUsuario);
            await _unitOfWork.SaveChangesAsync();

            return Ok(new { success = true, message = "El carrito se ha vaciado correctamente." });
        }

        [HttpPut("ActualizarCantidad")]
        public async Task<IActionResult> ActualizarCantidadProducto([FromBody] CarritoItemActualizarDTO datos)
        {
            Console.WriteLine($"Actualizando cantidad: ProductoId={datos.IdProducto}, NuevaCantidad={datos.NuevaCantidad}");

            int idUsuario = int.Parse(GetUserByEmailAsync());
            var usuario = await _userRepository.GetUserByIdAsync(idUsuario);

            if (usuario == null)
            {
                Console.WriteLine("Usuario no encontrado.");
                return NotFound(new { error = "Usuario no encontrado." });
            }

            var carrito = await _carritoRepository.ObtenerCarritoPorUsuarioIdAsync((int)usuario.Id);
            if (carrito == null)
            {
                Console.WriteLine("Carrito no encontrado.");
                return NotFound(new { error = "Carrito no encontrado." });
            }

            bool actualizado = await _carritoRepository.ActualizarCantidadProductoAsync(carrito, datos.IdProducto, datos.NuevaCantidad);
            if (!actualizado)
            {
                Console.WriteLine("No se pudo actualizar la cantidad.");
                return BadRequest(new { error = "No se pudo actualizar la cantidad." });
            }

            Console.WriteLine("Cantidad actualizada correctamente.");
            return Ok(new { message = "Cantidad actualizada correctamente." });
        }

        [HttpPost("Sincronizar")]
        public async Task<IActionResult> SincronizarCarrito([FromBody] List<CarritoItemAgregarDto> items)
        {
            Console.WriteLine("Datos recibidos en SincronizarCarrito:");
            foreach (var item in items)
            {
                Console.WriteLine($"ProductoId: {item.IdProducto}, Cantidad: {item.Cantidad}");
            }

            int idUsuario = int.Parse(GetUserByEmailAsync());
            var usuario = await _userRepository.GetUserByIdAsync(idUsuario);

            if (usuario == null)
                return NotFound(new { error = "Usuario no encontrado." });

            var carritoUsuario = await _carritoRepository.ObtenerOCrearCarritoPorUsuarioIdAsync((int)usuario.Id);

            try
            {
                foreach (var item in items)
                {
                    var producto = await _productoRepository.GetProductByIdAsync(item.IdProducto);
                    if (producto == null)
                    {
                        return NotFound(new { error = $"El producto con ID {item.IdProducto} no se encuentra disponible." });
                    }

                    if (producto.Stock < item.Cantidad)
                    {
                        return BadRequest(new { error = $"No hay suficiente stock para el producto con ID {item.IdProducto}.", stockDisponible = producto.Stock });
                    }

                    await _carritoRepository.AgregarProductoAlCarritoAsync(carritoUsuario, item.IdProducto, item.Cantidad);
                }

                await _unitOfWork.SaveChangesAsync();

                return Ok(new { success = true, message = "Productos sincronizados correctamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Ha habido un error de sincronización.", detalle = ex.Message });
            }
        }

        [HttpPost("verificar-o-crear")]
        public async Task<IActionResult> VerificarOCrearCarrito()
        {
            int idUsuario = int.Parse(GetUserByEmailAsync());
            var usuario = await _userRepository.GetUserByIdAsync(idUsuario);

            if (usuario == null)
            {
                return NotFound(new { error = "Usuario no encontrado." });
            }

            var carrito = await _carritoRepository.ObtenerOCrearCarritoPorUsuarioIdAsync((int)usuario.Id);

            if (carrito == null)
            {
                return StatusCode(500, new { error = "No se pudo crear el carrito para el usuario." });
            }

            return Ok(new
            {
                success = true,
                message = "Carrito verificado o creado exitosamente.",
                carritoId = carrito.CarritoId
            });
        }
    }
}

