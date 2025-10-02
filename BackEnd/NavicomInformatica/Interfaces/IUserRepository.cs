using NavicomInformatica.Models;

namespace NavicomInformatica.Interfaces
{
    public interface IUserRepository
    {
        Task<ICollection<User>> GetUsersAsync();
        Task<User> GetUserByIdAsync(long id);
        Task<User> GetUserByEmailAsync(string email);
        Task<User> GetUserByApodoAsync(string apodo);
        Task AddUserAsync(User user);
        //Task<string> StoreImageAsync(IFormFile file, string avatarName);
        Task ActualizarUsuarioAsync(User usuario);
        Task EliminarUsuarioAsync(long id);
    }
}
