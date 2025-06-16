//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using NavicomInformatica.Data;
//using NavicomInformatica.DTO;
//using NavicomInformatica.Models;

//namespace NavicomInformatica.Controllers;

//[Route("api/[controller]")]
//[ApiController]
//public class OrdersController : ControllerBase
//{
//    private readonly DataBaseContext _db;
//    public OrdersController(DataBaseContext db) => _db = db;

//    [HttpPost("makeorder")]
//    public async Task<IActionResult> MakeOrder([FromBody] MakeOrderDTO dto)
//    {
//        if (!long.TryParse(dto.UserId, out var userIdParsed))
//            return BadRequest("UserId no válido");

//        var user = await _db.Users
//            .Include(u => u.Carrito!)
//                .ThenInclude(c => c.Productos!)
//            .FirstOrDefaultAsync(u => u.Id == userIdParsed);


//        if (user == null || user.Carrito == null || user.Carrito.Productos == null || !user.Carrito.Productos.Any())
//            return BadRequest("Carrito vacío o usuario no válido.");

//        var carrito = user.Carrito;

//        // Verificamos que no exista ya una orden con ese SessionId (por si acaso)
//        if (await _db.Orders.AnyAsync(o => o.Id == dto.SessionId))
//            return Conflict("Ya existe una orden con esta sesión.");

//        var order = new Order
//        {
//            Id = dto.SessionId,
//            UserId = user.Id,
//            TotalAmount = (decimal)carrito.TotalPrice,
//            Currency = "eur",
//            CreatedAt = DateTime.UtcNow,
//            Items = new List<OrderItem>()
//        };

//        foreach (var item in carrito.Productos)
//        {
//            var producto = await _db.Products.FindAsync(item.ProductoId);
//            if (producto == null)
//                return NotFound($"Producto con ID {item.ProductoId} no encontrado.");

//            if (producto.Stock < item.Cantidad)
//                return BadRequest($"Stock insuficiente para {producto.Brand} {producto.Model}.");

//            producto.Stock -= item.Cantidad;

//            order.Items.Add(new OrderItem
//            {
//                ProductoId = producto.Id,
//                Cantidad = item.Cantidad.Value,
//                PrecioUnitario = (decimal)(item.PrecioTotalProducto ?? 0) / (item.Cantidad ?? 1)

//            });
//        }

//        // Guardar orden y limpiar carrito
//        _db.Orders.Add(order);
//        _db.CarritoItems.RemoveRange(carrito.Productos);
//        carrito.TotalPrice = 0;

//        await _db.SaveChangesAsync();

//        return Ok(new { message = "Pedido realizado con éxito", orderId = order.Id });
//    }

//    [HttpGet("user/{userId}")]
//    public async Task<IActionResult> GetOrdersByUser(long userId)
//    {
//        var orders = await _db.Orders
//            .Where(o => o.UserId == userId)
//            .Include(o => o.Items!)
//                .ThenInclude(oi => oi.Producto)
//                    .ThenInclude(p => p.Imagenes)
//            .OrderByDescending(o => o.CreatedAt)
//            .ToListAsync();

//        if (orders == null || !orders.Any())
//            return NotFound("Este usuario no tiene pedidos.");

//        var result = orders.Select(order => new OrderSummaryDto
//        {
//            OrderId = order.Id,
//            CreatedAt = order.CreatedAt,
//            TotalAmount = order.TotalAmount,
//            Currency = order.Currency,
//            Items = order.Items.Select(item => new OrderItemDto
//            {
//                ProductName = item.Producto?.Brand + " " + item.Producto?.Model,
//                Quantity = item.Cantidad,
//                PrecioUnitario = item.PrecioUnitario,
//                ImageUrl = item.Producto?.Imagenes?.FirstOrDefault()?.Img_Name
//            }).ToList()
//        });

//        return Ok(result);
//    }
//}
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

        if (user == null || user.Carrito == null || user.Carrito.Productos == null || !user.Carrito.Productos.Any())
            return BadRequest("Carrito vacío o usuario no válido.");

        var carrito = user.Carrito;

        if (await _db.Orders.AnyAsync(o => o.Id == dto.SessionId))
            return Conflict("Ya existe una orden con esta sesión.");

        var order = new Order
        {
            Id = dto.SessionId,
            UserId = user.Id,
            Currency = "eur",
            CreatedAt = DateTime.UtcNow,
            Items = new List<OrderItem>()
        };

        decimal total = 0;

        foreach (var item in carrito.Productos)
        {
            var producto = await _db.Products.FindAsync(item.ProductoId);
            if (producto == null)
                return NotFound($"Producto con ID {item.ProductoId} no encontrado.");

            if (producto.Stock < item.Cantidad)
                return BadRequest($"Stock insuficiente para {producto.Brand} {producto.Model}.");

            producto.Stock -= item.Cantidad;

            decimal precioUnitario = (decimal)(item.PrecioTotalProducto ?? 0) / (item.Cantidad ?? 1);
            total += precioUnitario * item.Cantidad.Value;

            order.Items.Add(new OrderItem
            {
                ProductoId = producto.Id,
                Cantidad = item.Cantidad.Value,
                PrecioUnitario = precioUnitario
            });
        }

        order.TotalAmount = total;

        // Guardar orden y limpiar carrito
        _db.Orders.Add(order);
        _db.CarritoItems.RemoveRange(carrito.Productos);
        carrito.TotalPrice = 0;

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
            return NotFound("Este usuario no tiene pedidos.");

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
