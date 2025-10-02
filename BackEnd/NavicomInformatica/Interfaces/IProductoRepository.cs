using NavicomInformatica.DTO;
using NavicomInformatica.Models;

namespace NavicomInformatica.Interfaces
{
    public interface IProductoRepository
    {
        Task<ICollection<Producto>> GetProductsAsync();
        Task<ICollection<Producto>> GetProductsAsync(int offset, int limit, bool? isActive);
        Task<Producto> GetProductByIdAsync(long id);
        Task AddProductAsync(ProductDTO product);
        Task AddProductsAsync(IEnumerable<Producto> products);
        Task<Producto> GetProductByModel(string model);
        Task<int> GetTotalProductCountAsync(bool? isActive);
        Task UpdateStockAsync(long ProductId, int stockRestar);
        Task UpdateAllAsync(ProductDTO product);
        Task DeleteProductAsync(long id);
        Task ReactivateProductAsync(long id);
        // Nuevos métodos para ordenamiento y filtrado
        Task<IEnumerable<Producto>> SortByPriceAsync(string sortOrder, int offset, int limit, bool? isActive);
        Task<IEnumerable<Producto>> SortAlphabeticallyAsync(string sortOrder, int offset, int limit, bool? isActive);
        Task<IEnumerable<Producto>> FilterByCategoryAsync(string category, int offset, int limit, bool? isActive);
        Task<IEnumerable<Producto>> SearchByTextAsync(string searchText, int offset, int limit, bool? isActive);

        // Métodos para contar productos con filtros aplicados
        Task<int> GetTotalProductCountForCategoryAsync(string category, bool? isActive);
        Task<int> GetTotalProductCountForSearchAsync(string searchText, bool? isActive);
    }
}