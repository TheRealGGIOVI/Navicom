using Microsoft.EntityFrameworkCore;
using NavicomInformatica.Data;
using NavicomInformatica.Interfaces;
using NavicomInformatica.Models;

namespace NavicomInformatica.Data.Seeder
{
    public class Seeder
    {
        private readonly DataBaseContext _dbContext;
        private readonly IPasswordHasher _passwordHasher;
        public Seeder(DataBaseContext context, IPasswordHasher hashed)
        {
            _dbContext = context;
            _passwordHasher = hashed;
        }

        public void Seed()
        {
            if (_dbContext.Set<User>().Any(u => u.Email == "christian@gmail.com")) return;

            string passwordHashedChristian = _passwordHasher.Hash("Christian123.");
            string passwordHashedKilian = _passwordHasher.Hash("Kilian123.");
            string passwordHashedJosemi = _passwordHasher.Hash("Josemi123.");
            string passwordHashedJuanjo = _passwordHasher.Hash("Juanjo123.");
            string passwordHashedJose = _passwordHasher.Hash("Jose123.");
            string passwordHashedPruebas = _passwordHasher.Hash("Pruebas123.");

            User[] users =
            {
                new User { Nombre = "Christian", Apellidos = "Lara", Email = "christian@gmail.com", Password = passwordHashedChristian, Rol = "admin" },
                new User { Nombre = "Kilian", Apellidos = "Mbappe", Email = "kilian@gmail.com", Password = passwordHashedKilian, Rol = "admin" },
                new User { Nombre = "Josemi", Apellidos = "Toro", Email = "josemi@gmail.com", Password = passwordHashedJosemi, Rol = "admin" },
                new User { Nombre = "Juanjo", Apellidos = "Buenavista", Email = "juanjo@gmail.com", Password = passwordHashedJuanjo, Rol = "admin" },
                new User { Nombre = "José", Apellidos = "Santos", Email = "jose@gmail.com", Password = passwordHashedJose, Rol = "admin" },
                new User { Nombre = "Pruebas", Apellidos = "1234", Email = "pruebas@gmail.com", Password = passwordHashedPruebas, Rol = "none" }
    };

            _dbContext.Set<User>().AddRange(users);
            _dbContext.SaveChanges();
        }

    }
}

