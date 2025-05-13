using NavicomInformatica.Data;
using NavicomInformatica.Models;
using NavicomInformatica.Interfaces;
using Microsoft.EntityFrameworkCore;
using NavicomInformatica.DTO;
using System;

namespace NavicomInformatica.Repositories
{
    public class ProductRepository : IProductoRepository
    {
        private readonly DataBaseContext _context;
        private readonly IWebHostEnvironment _env;
        private IWebHostEnvironment? env;

        public ProductRepository(DataBaseContext context)
        {
            _context = context;
            _env = env;
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

        public async Task UpdateAllAsync(ProductDTO productDto)
        {
            var productoExistente = await _context.Products
                .Include(p => p.Imagenes)
                .FirstOrDefaultAsync(p => p.Id == productDto.Id);

            if (productoExistente == null)
                throw new Exception("Producto no encontrado");

            productoExistente.Brand = productDto.Brand;
            productoExistente.Model = productDto.Model;
            productoExistente.Precio = productDto.Precio ?? 0;
            productoExistente.Stock = productDto.Stock ?? 0;
            productoExistente.Description = productDto.Description;
            productoExistente.Details = productDto.Details;
            productoExistente.Category = productDto.Category;

            if (productDto.Files != null && productDto.Files.Any())
            {
                foreach (var img in productoExistente.Imagenes)
                {
                    var path = Path.Combine(_env.WebRootPath, "images", img.FileName);
                    if (File.Exists(path))
                    {
                        File.Delete(path);
                    }
                }

                _context.ProductoImagenes.RemoveRange(productoExistente.Imagenes);

                var nuevasImagenes = new List<ProductoImagen>();
                foreach (var file in productDto.Files)
                {
                    var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                    var filePath = Path.Combine(_env.WebRootPath, "images", fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    nuevasImagenes.Add(new ProductoImagen
                    {
                        FileName = fileName,
                        ProductoId = productoExistente.Id
                    });
                }

                productoExistente.Imagenes = nuevasImagenes;
            }

            _context.Products.Update(productoExistente);
            await _context.SaveChangesAsync();
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
            var product = await _context.Products
                .Include(p => p.Imagenes)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product != null)
            {
                _context.ProductoImagenes.RemoveRange(product.Imagenes);
                _context.Products.Remove(product);
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
        }

        public async Task AddProductAsync(ProductDTO productDto)
        {
            var nuevoProducto = new Producto
            {
                Brand = productDto.Brand,
                Model = productDto.Model,
                Precio = productDto.Precio ?? 0,
                Discount_Price = productDto.Discount_Price ?? 0,
                Stock = productDto.Stock ?? 0,
                Description = productDto.Description,
                Details = productDto.Details,
                Category = productDto.Category
            };

            _context.Products.Add(nuevoProducto);
            await _context.SaveChangesAsync();

            if (productDto.Files != null && productDto.Files.Any())
            {
                var imagenes = new List<ProductoImagen>();
                foreach (var file in productDto.Files)
                {
                    var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                    var filePath = Path.Combine(_env.WebRootPath, "images", fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    imagenes.Add(new ProductoImagen
                    {
                        FileName = fileName,
                        ProductoId = nuevoProducto.Id
                    });
                }

                _context.ProductoImagenes.AddRange(imagenes);
                await _context.SaveChangesAsync();
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