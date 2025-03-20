using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;


namespace NavicomInformatica.Models
{
   
  public class Carrito
  {
      [Key]
      public int CarritoId { get; set; }

      [Required]
      public int UserId { get; set; }

      public ICollection<CarritoItem> Items { get; set; } = new List<CarritoItem>();

      [NotMapped]
      public double Total => Items?.Sum(item => item.Subtotal) ?? 0;
  }
    
}
