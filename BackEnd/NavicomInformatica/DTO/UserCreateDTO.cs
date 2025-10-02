using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace NavicomInformatica.DTO
{
    public class UserDTO
    {
        public long Id { get; set; }
        public string? Nombre { get; set; }
        public string Apellidos { get; set; }
        public string? Email { get; set; }
        public string? Rol { get; set; }
    }

    public class UserCreateDTO
    {
        public string? Nombre { get; set; }
        public string Apellidos { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? Rol = "usuario";
    }


}
