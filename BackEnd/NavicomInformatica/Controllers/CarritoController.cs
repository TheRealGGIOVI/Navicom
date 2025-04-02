using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NavicomInformatica.DataMappers;
using NavicomInformatica.DTO;
using NavicomInformatica.Interfaces;
using NavicomInformatica.Models;
using System.Security.Claims;

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

        [Authorize(Roles = "admin")]
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
                UserId = cart.UserId,

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
    }
}

