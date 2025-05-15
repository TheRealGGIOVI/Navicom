using NavicomInformatica.DTO;
using NavicomInformatica.Models;

namespace NavicomInformatica.DataMappers
{
    public class ProductoMapper
    {
        private ProductoImagenDTO MapProductoImagenToDTO(ProductoImagen imagen)
        {
            return new ProductoImagenDTO
            {
                Id = imagen.Id,
                Img_Name = imagen.Img_Name
            };
        }

        private List<ProductoImagenDTO> MapProductoImagenesToDTO(List<ProductoImagen> imagenes)
        {
            return imagenes.Select(MapProductoImagenToDTO).ToList();
        }

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
                Description = producto.Description,
                Details = producto.Details,
                Category = producto.Category,
                Imagenes = MapProductoImagenesToDTO(producto.Imagenes) 
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
                Description = productsDTO.Description,
                Details = productsDTO.Details,
                Category = productsDTO.Category,
                Imagenes = new List<ProductoImagen>() 
            };
        }

        public IEnumerable<Producto> DTOsToEntities(IEnumerable<ProductDTO> productsDTO)
        {
            return productsDTO.Select(DTOToEntity);
        }
    }
}