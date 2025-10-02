using NavicomInformatica.DTO;
using NavicomInformatica.Models;

namespace NavicomInformatica.DataMappers
{
    public class UserMapper
    {
        public UserDTO userToDTO(User user)
        {
            return new UserDTO
            {
                Id = user.Id,
                Nombre = user.Nombre,
                Email = user.Email,
                Rol = user.Rol
            };
        }

        public IEnumerable<UserDTO> usersToDTO(IEnumerable<User> users)
        {
            return users.Select(userToDTO);
        }

    }
}
