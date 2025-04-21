using Microsoft.AspNetCore.Mvc;
using NavicomInformatica.DTO;
using NavicomInformatica.Interfaces;
using NavicomInformatica.Models;
using NavicomInformatica.DataMappers;

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
        public async Task<IActionResult> GetProductsAsync([FromForm] int page = 1, [FromForm] int limit = 10)
        {
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

        [HttpGet("id")]
        public async Task<IActionResult> GetProductById([FromQuery] long id)
        {
            try
            {
                var product = await _productRepository.GetProductByIdAsync(id);

                if (product == null)
                {
                    return NotFound(new { message = "Producto no encontrado" });
                }

                var productDTO = _mapper.productToDTO(product);

                return Ok(productDTO);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
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

        // Endpoint para ordenar por precio
        [HttpPost("SortByPrice")]
        public async Task<IActionResult> SortByPriceAsync([FromForm] string sortOrder, [FromForm] int page = 1, [FromForm] int limit = 10)
        {
            try
            {
                if (page < 1 || limit < 1)
                {
                    return BadRequest("La página y el límite deben ser mayores que 0.");
                }

                if (string.IsNullOrEmpty(sortOrder) || (sortOrder.ToLower() != "asc" && sortOrder.ToLower() != "desc"))
                {
                    return BadRequest("El valor de sortOrder debe ser 'asc' o 'desc'.");
                }

                int offset = (page - 1) * limit;

                var products = await _productRepository.SortByPriceAsync(sortOrder, offset, limit);

                if (products == null || !products.Any())
                {
                    return NotFound("No se encontraron productos.");
                }

                int totalItems = await _productRepository.GetTotalProductCountAsync();
                int totalPages = (int)Math.Ceiling(totalItems / (double)limit);

                var productsDTO = _mapper.productToDTO(products);

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

        // Endpoint para ordenar alfabéticamente
        [HttpPost("SortAlphabetically")]
        public async Task<IActionResult> SortAlphabeticallyAsync([FromForm] string sortOrder, [FromForm] int page = 1, [FromForm] int limit = 10)
        {
            try
            {
                if (page < 1 || limit < 1)
                {
                    return BadRequest("La página y el límite deben ser mayores que 0.");
                }

                if (string.IsNullOrEmpty(sortOrder) || (sortOrder.ToLower() != "asc" && sortOrder.ToLower() != "desc"))
                {
                    return BadRequest("El valor de sortOrder debe ser 'asc' o 'desc'.");
                }

                int offset = (page - 1) * limit;

                var products = await _productRepository.SortAlphabeticallyAsync(sortOrder, offset, limit);

                if (products == null || !products.Any())
                {
                    return NotFound("No se encontraron productos.");
                }

                int totalItems = await _productRepository.GetTotalProductCountAsync();
                int totalPages = (int)Math.Ceiling(totalItems / (double)limit);

                var productsDTO = _mapper.productToDTO(products);

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

        // Endpoint para filtrar por categoría
        [HttpPost("FilterByCategory")]
        public async Task<IActionResult> FilterByCategoryAsync([FromForm] string category, [FromForm] int page = 1, [FromForm] int limit = 10)
        {
            try
            {
                if (page < 1 || limit < 1)
                {
                    return BadRequest("La página y el límite deben ser mayores que 0.");
                }

                // Validar categoría (opcional)
                var validCategories = new[] { "Laptops", "MiniPCs", "MonitorsAndAccessories", "" };
                if (!string.IsNullOrEmpty(category) && !validCategories.Contains(category))
                {
                    return BadRequest("Categoría inválida. Opciones válidas: Laptops, MiniPCs, MonitorsAndAccessories.");
                }

                int offset = (page - 1) * limit;

                var products = await _productRepository.FilterByCategoryAsync(category, offset, limit);

                if (products == null || !products.Any())
                {
                    return NotFound("No se encontraron productos.");
                }

                int totalItems = await _productRepository.GetTotalProductCountForCategoryAsync(category);
                int totalPages = (int)Math.Ceiling(totalItems / (double)limit);

                var productsDTO = _mapper.productToDTO(products);

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

        // Endpoint para buscar por texto
        [HttpPost("SearchByText")]
        public async Task<IActionResult> SearchByTextAsync([FromForm] string searchText, [FromForm] int page = 1, [FromForm] int limit = 10)
        {
            try
            {
                if (page < 1 || limit < 1)
                {
                    return BadRequest("La página y el límite deben ser mayores que 0.");
                }

                int offset = (page - 1) * limit;

                var products = await _productRepository.SearchByTextAsync(searchText, offset, limit);

                if (products == null || !products.Any())
                {
                    return NotFound("No se encontraron productos.");
                }

                int totalItems = await _productRepository.GetTotalProductCountForSearchAsync(searchText);
                int totalPages = (int)Math.Ceiling(totalItems / (double)limit);

                var productsDTO = _mapper.productToDTO(products);

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
    }
}