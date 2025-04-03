using NavicomInformatica.DTO;
using NavicomInformatica.Models;

namespace NavicomInformatica.DataMappers
{
    public class ProductoMapper
    {
        public ProductDTO productToDTO(Producto producto)
        {
            return new ProductDTO
            {
                Id = producto.Id,
                Brand = producto.Brand,
                Model = producto.Model,
                Precio = producto.Precio,
                Discount_Price = producto.Discount_Price,
                Stock = producto.Stock,
                Img_Name = producto.Img_Name,
                Description = producto.Description,
                Details = producto.Details
            };
        }

        public IEnumerable<ProductDTO> productToDTO(IEnumerable<Producto> products)
        {
            return products.Select(productToDTO);
        }

        public Producto DTOToEntity(ProductDTO productsDTO)
        {
            return new Producto
            {
                Id = productsDTO.Id,
                Brand = productsDTO.Brand,
                Model = productsDTO.Model,
                Precio = productsDTO.Precio,
                Discount_Price = productsDTO.Discount_Price,
                Stock = productsDTO.Stock,
                Img_Name = productsDTO.Img_Name,
                Description = productsDTO.Description,
                Details = productsDTO.Details
            };
        }

        public IEnumerable<Producto> DTOsToEntities(IEnumerable<ProductDTO> productsDTO)
        {
            return productsDTO.Select(DTOToEntity);
        }
    }
}
