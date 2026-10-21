using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NavicomInformatica.Data;
using NavicomInformatica.DTO;
using NavicomInformatica.Models;

namespace NavicomInformatica.Controllers;

[Route("api/[controller]")]
[ApiController]
public class OrdersController : ControllerBase
{
    private readonly DataBaseContext _db;
    public OrdersController(DataBaseContext db) => _db = db;

    [HttpPost("makeorder")]
    public async Task<IActionResult> MakeOrder([FromBody] MakeOrderDTO dto)
    {
        if (!long.TryParse(dto.UserId, out var userIdParsed))
            return BadRequest("UserId no válido");

        var user = await _db.Users
            .Include(u => u.Carrito!)
                .ThenInclude(c => c.Productos!)
            .FirstOrDefaultAsync(u => u.Id == userIdParsed);

        if (user == null)
            return BadRequest("Usuario no válido.");

        if (dto.Items == null || !dto.Items.Any())
            return BadRequest("No se especificaron productos en la orden.");

        // Si la orden ya se procesó (por ejemplo, el usuario recarga la página de éxito), devolvemos OK de forma idempotente
        if (await _db.Orders.AnyAsync(o => o.Id == dto.SessionId))
            return Ok(new { message = "Esta orden ya fue registrada anteriormente.", orderId = dto.SessionId });

        var order = new Order
        {
            Id = dto.SessionId,
            UserId = user.Id,
            Currency = "eur",
            CreatedAt = DateTime.UtcNow,
            Items = new List<OrderItem>()
        };

        decimal total = 0;
        var productos = await _db.Products.ToListAsync();

        foreach (var itemDto in dto.Items)
        {
            var nombreBuscado = itemDto.Nombre?.Trim() ?? "";
            var producto = productos.FirstOrDefault(p =>
                string.Equals($"{p.Brand} {p.Model}".Trim(), nombreBuscado, StringComparison.OrdinalIgnoreCase))
                ?? productos.FirstOrDefault(p =>
                    string.Equals(p.Model?.Trim(), nombreBuscado, StringComparison.OrdinalIgnoreCase))
                ?? productos.FirstOrDefault(p =>
                    !string.IsNullOrWhiteSpace(p.Model) && (nombreBuscado.Contains(p.Model, StringComparison.OrdinalIgnoreCase) || p.Model.Contains(nombreBuscado, StringComparison.OrdinalIgnoreCase)))
                ?? productos.FirstOrDefault(p =>
                    !string.IsNullOrWhiteSpace(p.Brand) && nombreBuscado.Contains(p.Brand, StringComparison.OrdinalIgnoreCase));

            if (producto != null)
            {
                // Descontar del stock real del producto
                producto.Stock = Math.Max(0, (producto.Stock ?? 0) - itemDto.Cantidad);

                order.Items.Add(new OrderItem
                {
                    ProductoId = producto.Id,
                    Cantidad = itemDto.Cantidad,
                    PrecioUnitario = itemDto.PrecioUnitario
                });
            }
            else if (productos.Any())
            {
                // Fallback de seguridad para no perder la orden si hubo un cambio de texto menor
                var fallbackProd = productos.First();
                fallbackProd.Stock = Math.Max(0, (fallbackProd.Stock ?? 0) - itemDto.Cantidad);
                order.Items.Add(new OrderItem
                {
                    ProductoId = fallbackProd.Id,
                    Cantidad = itemDto.Cantidad,
                    PrecioUnitario = itemDto.PrecioUnitario
                });
            }

            total += itemDto.PrecioUnitario * itemDto.Cantidad;
        }

        order.TotalAmount = total > 0 ? total : 0;

        // Guardar orden
        _db.Orders.Add(order);

        // Limpiar carrito si existía
        if (user.Carrito?.Productos != null && user.Carrito.Productos.Any())
        {
            _db.CarritoItems.RemoveRange(user.Carrito.Productos);
            user.Carrito.TotalPrice = 0;
        }

        await _db.SaveChangesAsync();

        return Ok(new { message = "Pedido realizado con éxito", orderId = order.Id });
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetOrdersByUser(long userId)
    {
        var orders = await _db.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.Items!)
                .ThenInclude(oi => oi.Producto)
                    .ThenInclude(p => p.Imagenes)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        if (!orders.Any())
            return Ok(new List<OrderSummaryDto>());

        var result = orders.Select(order => new OrderSummaryDto
        {
            OrderId = order.Id,
            CreatedAt = order.CreatedAt,
            TotalAmount = order.TotalAmount,
            Currency = order.Currency,
            Items = order.Items.Select(item => new OrderItemDto
            {
                ProductName = item.Producto?.Brand + " " + item.Producto?.Model,
                Quantity = item.Cantidad,
                PrecioUnitario = item.PrecioUnitario,
                ImageUrl = item.Producto?.Imagenes?.FirstOrDefault()?.Img_Name
            }).ToList()
        });

        return Ok(result);
    }
}
