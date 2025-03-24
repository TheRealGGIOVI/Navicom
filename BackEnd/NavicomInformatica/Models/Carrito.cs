using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;


namespace NavicomInformatica.Models
{

    public class Carrito
    {
        public int CarritoId { get; set; }
        public int IdUsuario { get; set; }
        public string Estado { get; set; }
        public DateTime FechaCreacion { get; set; }
        public ICollection<CarritoItem> Items { get; set; }
    }

}
