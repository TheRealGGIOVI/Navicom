using NavicomInformatica.DTO;
using NavicomInformatica.Models;

namespace NavicomInformatica.Interfaces
{
    public interface IProductoRepository
    {
        Task<ICollection<Producto>> GetProductsAsync();
        Task<ICollection<Producto>> GetProductsAsync(int offset, int limit);
        Task<Producto> GetProductByIdAsync(long id);
        Task AddProductAsync(ProductDTO product);
        Task AddProductsAsync(IEnumerable<Producto> products);
        Task<Producto> GetProductByModel(string model);
        Task<int> GetTotalProductCountAsync();
        Task<ICollection<Producto>> AscPriceProduct();
        Task<ICollection<Producto>> DescPriceProduct();
       
        Task UpdateStockAsync(long ProductId, int stockRestar);
        Task UpdateAllAsync(ProductDTO product);
        Task<string> StoreImageAsync(IFormFile file, string modelName);
        Task DeleteProductAsync(long id);
    }
}
