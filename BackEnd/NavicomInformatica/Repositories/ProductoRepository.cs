using NavicomInformatica.Data;
using NavicomInformatica.DTO;
using NavicomInformatica.Models;
using NavicomInformatica.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace NavicomInformatica.Repositories
{
    public class ProductRepository : IProductoRepository
    {
        private readonly DataBaseContext _context;

        public ProductRepository(DataBaseContext context)
        {
            _context = context;
        }

        // Devuelve todos los productos sin paginación
        public async Task<ICollection<Producto>> GetProductsAsync()
        {
            return await _context.Products.OrderBy(u => u.Id).ToListAsync();
        }

        // Devuelve productos según el offset y el límite
        public async Task<ICollection<Producto>> GetProductsAsync(int offset, int limit)
        {
            // Aplica la paginación a la consulta
            return await _context.Products
                .OrderBy(u => u.Id)
                .Skip(offset)         // Salta el número de elementos determinado por el offset
                .Take(limit)          // Toma el número de elementos determinado por el límite
                .ToListAsync();
        }

        private void SaveChanges()
        {
            try
            {
                _context.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                // Registrar la excepción interna para obtener más detalles
                Console.WriteLine(ex.InnerException?.Message);
                throw;
            }
        }

        public async Task<string> StoreImageAsync(IFormFile file, string modelName)
        {
            string fileExtension = Path.GetExtension(file.FileName);
            string fileName = modelName + fileExtension;

            string imagesFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");

            string filePath = Path.Combine(imagesFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return fileName;
        }

        public async Task AddProductAsync(ProductDTO productDto)
        {
            var existingProduct = await _context.Products
                .FirstOrDefaultAsync(p => p.Model == productDto.Model);

            if (existingProduct != null)
            {
                throw new Exception("A product with this model already exists.");
            }

            var product = new Producto
            {
                Brand = productDto.Brand,
                Model = productDto.Model,
                Precio = productDto.Precio,
                Discount_Price = productDto.Discount_Price,
                Stock = productDto.Stock,
                Description = productDto.Description,
                Details = productDto.Details
            };

            if (productDto.File != null)
            {
                try
                {
                    product.Img_Name = await StoreImageAsync(productDto.File, productDto.Model);
                }
                catch (Exception ex)
                {
                    throw new Exception("Error al guardar la imagen: " + ex.Message);
                }
            }

            await _context.Products.AddAsync(product);

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

        public async Task AddProductsAsync(IEnumerable<Producto> products)
        {
            _context.Products.AddRange(products);
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

        public async Task<Producto> GetProductByIdAsync(long id)
        {
            return await _context.Products.FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<Producto> GetProductByModel(string model)
        {
            return await _context.Products.FirstOrDefaultAsync(u => u.Model == model);
        }

        public async Task<int> GetTotalProductCountAsync()
        {
            return await _context.Products.CountAsync();
        }

        public async Task<ICollection<Producto>> AscPriceProduct()
        {
            var productos = await _context.Products.ToListAsync();
            return productos.OrderBy(p => p.Precio).ToList();
        }

        public async Task<ICollection<Producto>> DescPriceProduct()
        {
            var productos = await _context.Products.ToListAsync();
            return productos.OrderByDescending(p => p.Precio).ToList();
        }

        public async Task UpdateStockAsync(long ProductId, int stockRestar)
        {
            var productVariado = _context.Products.FirstOrDefault(p => p.Id == ProductId);

            if (productVariado == null)
            {
                throw new Exception("La variación del producto no existe.");
            }

            if (productVariado.Stock < stockRestar)
            {
                throw new Exception("No hay suficiente stock disponible.");
            }

            productVariado.Stock -= stockRestar;

            try
            {
                _context.SaveChanges();
            }
            catch (DbUpdateException ex)
            {
                // Registrar la excepción interna para obtener más detalles
                Console.WriteLine(ex.InnerException?.Message);
                throw;
            }
        }

        public async Task DeleteProductAsync(long id)
        {
            var product = await _context.Set<Producto>().FindAsync(id);
            if (product != null)
            {
                _context.Set<Producto>().Remove(product);
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

        public async Task UpdateAllAsync(ProductDTO product)
        {
            // Obtener el producto de la base de datos
            var productVariado = await _context.Products.FirstOrDefaultAsync(p => p.Id == product.Id);

            if (productVariado == null)
            {
                throw new KeyNotFoundException("La variación del producto no existe.");
            }

            // Validaciones iniciales
            if (product.Stock < 0)
            {
                throw new ArgumentException("No se puede poner menos de 0 de stock.");
            }

            if (product.Precio < 0 || product.Discount_Price < 0)
            {
                throw new ArgumentException("El Precio no puede ser negativo.");
            }

            // Actualización de campos si los valores son válidos
            if (!string.IsNullOrWhiteSpace(product.Brand) && product.Brand != "string")
            {
                productVariado.Brand = product.Brand.Trim();
            }

            if (!string.IsNullOrWhiteSpace(product.Model) && product.Model != "string")
            {
                productVariado.Model = product.Model.Trim();
            }

            if (product.Precio > 0)
            {
                productVariado.Precio = product.Precio;
            }

            if (product.Discount_Price >= 0)
            {
                productVariado.Discount_Price = product.Discount_Price;
            }

            if (product.Stock > 0)
            {
                productVariado.Stock = product.Stock;
            }

            if (!string.IsNullOrWhiteSpace(product.Description) && product.Description != "string")
            {
                productVariado.Description = product.Description.Trim();
            }

            if (!string.IsNullOrWhiteSpace(product.Details) && product.Details != "string")
            {
                productVariado.Details = product.Details.Trim();
            }

            // Procesar y almacenar imagen 
            if (product.File != null)
            {
                try
                {
                    var modelImage = !string.IsNullOrWhiteSpace(product.Model) && product.Model != "string"
                        ? product.Model
                        : productVariado.Model;

                    productVariado.Img_Name = await StoreImageAsync(product.File, modelImage);
                }
                catch (Exception ex)
                {
                    throw new InvalidOperationException("Error al guardar la imagen.", ex);
                }
            }
            else if (!string.IsNullOrWhiteSpace(product.Img_Name) && product.Img_Name != "string")
            {
                productVariado.Img_Name = product.Img_Name.Trim();
            }

            // Guardar cambios en la base de datos
            _context.Products.Update(productVariado);
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

        public async Task<IEnumerable<Producto>> SearchProductsAsync(string searchText, string sortBy, string category, int offset, int limit)
        {
            var query = _context.Products.AsQueryable();

            // Filtrar por categoría
            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(p => p.Category == category);
            }

            // Buscar por texto en Brand y Model
            if (!string.IsNullOrEmpty(searchText))
            {
                var searchLower = searchText.ToLower();
                query = query.Where(p => p.Brand.ToLower().Contains(searchLower) ||
                                         p.Model.ToLower().Contains(searchLower));
            }

            // Ordenar
            switch (sortBy?.ToLower())
            {
                case "price-asc":
                    query = query.OrderBy(p => p.Precio);
                    break;
                case "price-desc":
                    query = query.OrderByDescending(p => p.Precio);
                    break;
                case "alpha-asc":
                    query = query.OrderBy(p => p.Brand).ThenBy(p => p.Model);
                    break;
                case "alpha-desc":
                    query = query.OrderByDescending(p => p.Brand).ThenByDescending(p => p.Model);
                    break;
                default:
                    query = query.OrderBy(p => p.Id); // Orden por defecto
                    break;
            }

            // Paginación
            query = query.Skip(offset).Take(limit);

            return await query.ToListAsync();
        }

        // Contar productos con filtros aplicados
        public async Task<int> GetTotalProductCountAsync(string searchText, string category)
        {
            var query = _context.Products.AsQueryable();

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(p => p.Category == category);
            }

            if (!string.IsNullOrEmpty(searchText))
            {
                var searchLower = searchText.ToLower();
                query = query.Where(p => p.Brand.ToLower().Contains(searchLower) ||
                                         p.Model.ToLower().Contains(searchLower));
            }

            return await query.CountAsync();
        }
    }
}
