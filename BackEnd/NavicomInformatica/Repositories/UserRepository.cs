using Microsoft.EntityFrameworkCore;
using NavicomInformatica.Data;
using NavicomInformatica.Interfaces;
using NavicomInformatica.Models;
namespace NavicomInformatica.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly DataBaseContext _context;
        private readonly IPasswordHasher _passwordHasher;

        public UserRepository(DataBaseContext context, IPasswordHasher hasher)
        {
            _context = context;
            _passwordHasher = hasher;
        }

        public async Task AddUserAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> GetUserByApodoAsync(string apodo)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Nombre == apodo);
        }

        public async Task<User> GetUserByIdAsync(long id)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<ICollection<User>> GetUsersAsync()
        {
            return await _context.Users.OrderBy(u => u.Id).ToListAsync();
        }

        public async Task ActualizarUsuarioAsync(User usuario)
        {
            if (usuario == null)
                throw new ArgumentNullException(nameof(usuario));

            _context.Users.Update(usuario);
            await _context.SaveChangesAsync();
        }

        public async Task<User> ObtenerPorIdAsync(int id)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task EliminarUsuarioAsync(int id)
        {
            var usuario = await ObtenerPorIdAsync(id);
            if (usuario == null)
                throw new InvalidOperationException("El usuario especificado no existe.");

            _context.Users.Remove(usuario);
            await _context.SaveChangesAsync();
        }
        

        public async Task<bool> ExisteUsuarioPorCorreoAsync(string correo)
        {
            if (string.IsNullOrEmpty(correo))
                throw new ArgumentException("El correo no puede ser nulo o vacío.", nameof(correo));

            return await _context.Users.AnyAsync(u => u.Email == correo);
        }

        //public async Task<string> StoreImageAsync(IFormFile file, string apodo)
        //{
        //    string fileExtension = Path.GetExtension(file.FileName);
        //    string fileName = apodo + fileExtension;

        //    string imagesFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");

        //    string filePath = Path.Combine(imagesFolder, fileName);

        //    using (var stream = new FileStream(filePath, FileMode.Create))
        //    {
        //        await file.CopyToAsync(stream);
        //    }

        //    return fileName;
        //}
    }
}
