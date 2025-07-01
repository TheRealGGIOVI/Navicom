using NavicomInformatica.Data;
using NavicomInformatica.Models;
using NavicomInformatica.Interfaces;
using Microsoft.EntityFrameworkCore;
using NavicomInformatica.DTO;

namespace NavicomInformatica.Repositories
{
    public class ProductRepository : IProductoRepository
    {
        private readonly DataBaseContext _context;

        public ProductRepository(DataBaseContext context)
        {
            _context = context;
        }

        public async Task<ICollection<Producto>> GetProductsAsync()
        {
            return await _context.Products
                .Include(p => p.Imagenes)
                .OrderBy(u => u.Id)
                .ToListAsync();
        }

        public async Task<ICollection<Producto>> GetProductsAsync(int offset, int limit)
        {
            return await _context.Products
                .Include(p => p.Imagenes)
                .OrderBy(u => u.Id)
                .Skip(offset)
                .Take(limit)
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
                Console.WriteLine(ex.InnerException?.Message);
                throw;
            }
        }

        public async Task<string> StoreImageAsync(IFormFile file, string brand, string model, int imageNumber)
        {
            // Reemplazar caracteres no válidos en el nombre del archivo
            brand = brand.Replace(" ", "_").Replace("/", "_").Replace("\\", "_");
            model = model.Replace(" ", "_").Replace("/", "_").Replace("\\", "_");

            string fileExtension = Path.GetExtension(file.FileName);
            string fileName = $"{brand}_{model}_{imageNumber}{fileExtension}"; // Ejemplo: HP_EliteBook_1.jpg

            string imagesFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");

            // Asegurarnos de que la carpeta exista
            if (!Directory.Exists(imagesFolder))
            {
                Directory.CreateDirectory(imagesFolder);
            }

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
                Details = productDto.Details,
                Category = productDto.Category,
                Imagenes = new List<ProductoImagen>()
            };

            if (productDto.Files != null && productDto.Files.Any())
            {
                try
                {
                    int imageNumber = 1;
                    foreach (var file in productDto.Files)
                    {
                        if (file != null)
                        {
                            var fileName = await StoreImageAsync(file, productDto.Brand, productDto.Model, imageNumber);
                            product.Imagenes.Add(new ProductoImagen { Img_Name = fileName });
                            imageNumber++;
                        }
                    }
                }
                catch (Exception ex)
                {
                    throw new Exception("Error al guardar las imágenes: " + ex.Message);
                }
            }

            await _context.Products.AddAsync(product);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
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
                Console.WriteLine(ex.InnerException?.Message);
                throw;
            }
        }

        public async Task<Producto> GetProductByIdAsync(long id)
        {
            return await _context.Products
                .Include(p => p.Imagenes)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<Producto> GetProductByModel(string model)
        {
            return await _context.Products
                .Include(p => p.Imagenes)
                .FirstOrDefaultAsync(u => u.Model == model);
        }

        public async Task<int> GetTotalProductCountAsync()
        {
            return await _context.Products.CountAsync();
        }

        public async Task UpdateStockAsync(long ProductId, int stockRestar)
        {
            var productVariado = await _context.Products.FirstOrDefaultAsync(p => p.Id == ProductId);

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
                Console.WriteLine(ex.InnerException?.Message);
                throw;
            }
        }

        public async Task DeleteProductAsync(long id)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (product != null)
            {
                product.IsActive = false;
                _context.Products.Update(product);
                await _context.SaveChangesAsync();
            }
        }

        public async Task ReactivateProductAsync(long id)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (product != null)
            {
                product.IsActive = true;
                _context.Products.Update(product);
                await _context.SaveChangesAsync();
            }
        }


        public async Task UpdateAllAsync(ProductDTO product)
        {
            var productVariado = await _context.Products
                .Include(p => p.Imagenes)
                .FirstOrDefaultAsync(p => p.Id == product.Id);

            if (productVariado == null)
            {
                throw new KeyNotFoundException("La variación del producto no existe.");
            }

            if (product.Stock < 0)
            {
                throw new ArgumentException("No se puede poner menos de 0 de stock.");
            }

            if (product.Precio < 0 || product.Discount_Price < 0)
            {
                throw new ArgumentException("El Precio no puede ser negativo.");
            }

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

            if (!string.IsNullOrWhiteSpace(product.Category) && product.Category != "string")
            {
                productVariado.Category = product.Category.Trim();
            }

            if (product.Files != null && product.Files.Any())
            {
                try
                {
                    // Determinar el número de imágenes existentes para continuar la numeración
                    int imageNumber = productVariado.Imagenes.Count + 1;
                    foreach (var file in product.Files)
                    {
                        if (file != null)
                        {
                            var fileName = await StoreImageAsync(file, productVariado.Brand, productVariado.Model, imageNumber);
                            productVariado.Imagenes.Add(new ProductoImagen { Img_Name = fileName });
                            imageNumber++;
                        }
                    }
                }
                catch (Exception ex)
                {
                    throw new InvalidOperationException("Error al guardar las imágenes.", ex);
                }
            }

            _context.Products.Update(productVariado);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine(ex.InnerException?.Message);
                throw;
            }
        }

        // Método para ordenar por precio
        public async Task<IEnumerable<Producto>> SortByPriceAsync(string sortOrder, int offset, int limit)
        {
            var query = _context.Products
                .Include(p => p.Imagenes)
                .AsQueryable();

            if (sortOrder?.ToLower() == "asc")
            {
                query = query.OrderBy(p => p.Precio);
            }
            else
            {
                query = query.OrderByDescending(p => p.Precio);
            }

            query = query.Skip(offset).Take(limit);

            return await query.ToListAsync();
        }

        // Método para ordenar alfabéticamente
        public async Task<IEnumerable<Producto>> SortAlphabeticallyAsync(string sortOrder, int offset, int limit)
        {
            var query = _context.Products
                .Include(p => p.Imagenes)
                .AsQueryable();

            if (sortOrder?.ToLower() == "asc")
            {
                query = query.OrderBy(p => p.Brand.ToLower()).ThenBy(p => p.Model.ToLower());
            }
            else
            {
                query = query.OrderByDescending(p => p.Brand.ToLower()).ThenByDescending(p => p.Model.ToLower());
            }

            query = query.Skip(offset).Take(limit);

            return await query.ToListAsync();
        }

        // Método para filtrar por categoría
        public async Task<IEnumerable<Producto>> FilterByCategoryAsync(string category, int offset, int limit)
        {
            var query = _context.Products
                .Include(p => p.Imagenes)
                .AsQueryable();

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(p => p.Category.ToLower() == category.ToLower());
            }

            query = query.OrderBy(p => p.Id).Skip(offset).Take(limit);

            return await query.ToListAsync();
        }

        // Método para buscar por texto
        public async Task<IEnumerable<Producto>> SearchByTextAsync(string searchText, int offset, int limit)
        {
            var query = _context.Products
                .Include(p => p.Imagenes)
                .AsQueryable();

            if (!string.IsNullOrEmpty(searchText))
            {
                var searchLower = searchText.ToLower();
                query = query.Where(p => p.Brand.ToLower().Contains(searchLower) ||
                                         p.Model.ToLower().Contains(searchLower));
            }

            query = query.OrderBy(p => p.Id).Skip(offset).Take(limit);

            return await query.ToListAsync();
        }

        // Métodos para contar productos (usados para paginación)
        public async Task<int> GetTotalProductCountForCategoryAsync(string category)
        {
            var query = _context.Products.AsQueryable();

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(p => p.Category.ToLower() == category.ToLower());
            }

            return await query.CountAsync();
        }

        public async Task<int> GetTotalProductCountForSearchAsync(string searchText)
        {
            var query = _context.Products.AsQueryable();

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