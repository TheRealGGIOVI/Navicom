using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NavicomInformatica.DataMappers;
using NavicomInformatica.DTO;
using NavicomInformatica.Interfaces;
using NavicomInformatica.Models;

namespace NavicomInformatica.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CarritoController : ControllerBase
    {
        private readonly ICarritoRepository _carritoRepository;
        private readonly IProductoRepository _productoRepository;
        private readonly CarritoMapper _carritoMapper;

        public CarritoController(
            ICarritoRepository carritoRepository,
            IProductoRepository productoRepository,
            CarritoMapper carritoMapper)
        {
            _carritoRepository = carritoRepository;
            _productoRepository = productoRepository;
            _carritoMapper = carritoMapper;
        }

        [HttpGet("GetCart/{cartId}")]
        public async Task<IActionResult> GetCartById(long cartId)
        {
            var cart = await _carritoRepository.GetCartByIdAsync(cartId);

            if (cart == null)
            {
                return NotFound("Carrito no encontrado.");
            }

            var cartDTO = new
            {
                CartId = cart.Id,
                cart.UserId,
                CartProducts = cart.Productos.Select(cp => new
                {
                    ProductId = cp.ProductoId,
                    ProductName = cp.Producto.Model,
                    ProductPrice = cp.Producto.Precio,
                    ProductImage = cp.Producto.Img_Name,
                    Quantity = cp.Cantidad,
                    TotalPriceObject = cp.Producto.Precio * cp.Cantidad
                }).ToList(),
                TotalPrice = cart.Productos
                    .Sum(cp => cp.Producto.Precio * cp.Cantidad)
            };

            return Ok(cartDTO);
        }

        [HttpPost("AddToCart")]
        public async Task<IActionResult> AddToCart([FromBody] CarritoProductoDTO carritoProductoDTO)
        {
            try
            {
                if (carritoProductoDTO == null || carritoProductoDTO.Cantidad <= 0)
                {
                    return BadRequest(new { message = "Datos inválidos: el DTO no puede ser nulo y la cantidad debe ser mayor a 0." });
                }

                var carritoItem = new CarritoItem
                {
                    CarritoId = carritoProductoDTO.CarritoId,
                    ProductoId = carritoProductoDTO.ProductoId,
                    Cantidad = carritoProductoDTO.Cantidad
                };

                await _carritoRepository.AddToCartAsync(carritoItem);
                return Ok(new { message = "Producto añadido al carrito exitosamente" });
            }
            catch (DbUpdateException dbEx)
            {
                // Capturar errores específicos de Entity Framework
                return BadRequest(new { message = "Error al guardar en la base de datos.", details = dbEx.InnerException?.Message ?? dbEx.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error al añadir el producto al carrito.", details = ex.Message });
            }
        }

        [HttpDelete("RemoveFromCart/{cartId}/{productId}")]
        public async Task<IActionResult> RemoveFromCart(long cartId, long productId)
        {
            try
            {
                var cart = await _carritoRepository.GetCartByIdAsync(cartId);
                if (cart == null)
                {
                    return NotFound("Carrito no encontrado.");
                }

                await _carritoRepository.RemoveProductFromCartAsync(cartId, productId);
                return Ok(new { message = "Producto eliminado del carrito exitosamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("ClearCart/{cartId}")]
        public async Task<IActionResult> ClearCart(long cartId)
        {
            try
            {
                var cart = await _carritoRepository.GetCartByIdAsync(cartId);
                if (cart == null)
                {
                    return NotFound("Carrito no encontrado.");
                }

                await _carritoRepository.RemoveAllProductsFromCartAsync(cartId);
                return Ok(new { message = "Carrito vaciado exitosamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("UpdateQuantity")]
        public async Task<IActionResult> UpdateQuantity([FromBody] CarritoProductoDTO carritoProductoDTO)
        {
            try
            {
                var cart = await _carritoRepository.GetCartByIdAsync(carritoProductoDTO.CarritoId);
                if (cart == null)
                {
                    return NotFound("Carrito no encontrado.");
                }

                await _carritoRepository.UpdateProductAsync(carritoProductoDTO);
                return Ok(new { message = "Cantidad actualizada exitosamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("MergeCart")]
        public async Task<IActionResult> MergeCart([FromBody] CarritoMergeDTO carritoMerge)
        {
            try
            {
                if (carritoMerge == null || carritoMerge.Productos == null || !carritoMerge.Productos.Any())
                {
                    return BadRequest(new { message = "Datos inválidos: el carrito o la lista de productos es nula o vacía." });
                }

                await _carritoRepository.MergeCartAsync(carritoMerge);

                return Ok(new { message = "Carrito actualizado exitosamente con los productos proporcionados." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error durante la fusión del carrito.", details = ex.Message });
            }
        }

    }
}