using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;


namespace NavicomInformatica.Models
{

    public class Carrito
    {
        [Key]
        public long Id { get; set; }

        [ForeignKey("User")]
        public long UserId { get; set; }
        public User User { get; set; }
        public ICollection<CarritoItem> Productos { get; set; } = new List<CarritoItem>();
        public double TotalPrice { get; set; }
    }

}
