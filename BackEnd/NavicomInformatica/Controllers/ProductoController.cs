using Microsoft.AspNetCore.Mvc;
using NavicomInformatica.DTO;
using NavicomInformatica.Interfaces;
using NavicomInformatica.Models;
using NavicomInformatica.DataMappers;


namespace NavicomInformatica.Controllers
{
   
    namespace NavicomInformatica.Controllers
    {
        [Route("api/[controller]")]
        [ApiController]
        public class ProductController : ControllerBase
        {

            private readonly IProductoRepository _productRepository;
            private readonly ProductoMapper _mapper;

            public ProductController(IProductoRepository productRepository, ProductoMapper productMapper)
            {
                _productRepository = productRepository;
                _mapper = productMapper;
            }

            [HttpPost("ListOfProducts")]
            public async Task<IActionResult> GetProductsAsync(int page = 1, int limit = 10)
            {

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                try
                {
                    if (page < 1 || limit < 1)
                    {
                        return BadRequest("La página y el límite deben ser mayores que 0.");
                    }

                    int offset = (page - 1) * limit;

                    var products = await _productRepository.GetProductsAsync(offset, limit);

                    if (products == null || !products.Any())
                    {
                        return NotFound("No se encontró ningún producto.");
                    }

                    int totalItems = await _productRepository.GetTotalProductCountAsync();

                    int totalPages = (int)Math.Ceiling(totalItems / (double)limit);

                    IEnumerable<ProductDTO> productsDTO = _mapper.productToDTO(products);

                    var result = new
                    {
                        currentPage = page,
                        totalPages = totalPages,
                        totalItems = totalItems,
                        items = productsDTO
                    };

                    return Ok(result);
                }
                catch (Exception ex)
                {
                    return StatusCode(500, "Internal server error: " + ex.Message);
                }
            }

            [HttpPost("AddProduct")]
            public async Task<IActionResult> AddProductAsync([FromForm] ProductDTO productToAdd)
            {
                if (productToAdd == null)
                {
                    return BadRequest("Producto data is required.");
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                try
                {
                    await _productRepository.AddProductAsync(productToAdd);

                    return Ok(new { message = "Producto registrado con éxito" });
                }
                catch (Exception ex)
                {
                    return StatusCode(500, "Internal server error: " + ex.Message);
                }
            }


            [HttpGet("desc-price")]
            public async Task<IActionResult> GetProductsByAscPrice()
            {
                var productos = await _productRepository.AscPriceProduct();
                return Ok(productos);
            }

            [HttpGet("asc-price")]
            public async Task<IActionResult> GetProductsByDescPrice()
            {
                var productos = await _productRepository.DescPriceProduct();
                return Ok(productos);
            }

            [HttpGet("id")]
            public async Task<IActionResult> GetProductById([FromQuery] long id)
            {
                // Llama al método para obtener el producto
                var product = await _productRepository.GetProductByIdAsync(id);

                if (product == null)
                {
                    // Si no se encuentra el producto, devuelve un 404
                    return NotFound(new { message = "Producto no encontrado" });
                }

                // Devuelve el producto
                return Ok(product);
            }

            [HttpPut("UpdateProduct/{id}")]
            public async Task<IActionResult> UpdateProductAsync(long id, [FromForm] ProductDTO productToAdd)
            {
                if (id != productToAdd.Id)
                {
                    return BadRequest("El ID del producto en la URL no coincide con el ID en el cuerpo de la solicitud.");
                }

                try
                {
                    await _productRepository.UpdateAllAsync(productToAdd);
                    return Ok("Producto actualizado correctamente.");
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            [HttpDelete("DeleteProduct/{id}")]
            public async Task<IActionResult> DeleteProductAsync(long id)
            {
                try
                {
                    var product = await _productRepository.GetProductByIdAsync(id);
                    if (product == null)
                    {
                        return NotFound(new { message = "Producto no encontrado" });
                    }

                    await _productRepository.DeleteProductAsync(id);
                    return Ok(new { message = "Producto eliminado con éxito" });
                }
                catch (Exception ex)
                {
                    return StatusCode(500, "Internal server error: " + ex.Message);
                }
            }

            [HttpPost("SearchProducts")]
            public async Task<IActionResult> SearchProductsAsync([FromBody] ProductSearchDTO searchParams)
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                try
                {
                    int offset = (searchParams.Page - 1) * searchParams.Limit;
                    var products = await _productRepository.SearchProductsAsync(
                        searchParams.SearchText,
                        searchParams.SortBy,
                        searchParams.Category,
                        offset,
                        searchParams.Limit
                    );

                    if (products == null || !products.Any())
                    {
                        return NotFound("No se encontraron productos.");
                    }

                    int totalItems = await _productRepository.GetTotalProductCountAsync(
                        searchParams.SearchText,
                        searchParams.Category
                    );

                    int totalPages = (int)Math.Ceiling(totalItems / (double)searchParams.Limit);

                    var result = new
                    {
                        currentPage = searchParams.Page,
                        totalPages = totalPages,
                        totalItems = totalItems,
                        items = products
                    };

                    return Ok(result);
                }
                catch (Exception ex)
                {
                    return StatusCode(500, "Internal server error: " + ex.Message);
                }
            }
        }
    }
}
