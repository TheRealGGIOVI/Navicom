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
            try
            {
                if (!_dbContext.Users.Any())
                {
                    string passwordHashedChristian = _passwordHasher.Hash("Christian123");
                    string passwordHashedJuanjo = _passwordHasher.Hash("Juanjo123");

                    // Crear los usuarios sin asignarles un Carrito todavía
                    User[] users = [
                        new User { Nombre = "Christian", Apellidos = "lara", Email = "Christian123@gmail.com", Rol="admin" },
                        new User { Nombre = "Juanjo", Apellidos = "buenavista", Email = "Juanjo123@gmail.com", Rol="admin" },
                    ];

                    users[0].Password = passwordHashedChristian;
                    users[1].Password = passwordHashedJuanjo;

                    // Insertar los usuarios y guardar los cambios para generar sus Id
                    _dbContext.Users.AddRange(users);
                    _dbContext.SaveChanges();

                    // Ahora que los usuarios tienen un Id, crear los carritos
                    Carrito[] carritos = [
                        new Carrito { UserId = users[0].Id, TotalPrice = 0.0 },
                new Carrito { UserId = users[1].Id, TotalPrice = 0.0 },
            ];

                    // Insertar los carritos
                    _dbContext.Carritos.AddRange(carritos);
                    _dbContext.SaveChanges();

                    // Opcional: Si quieres que los usuarios tengan una referencia al Carrito
                    users[0].Carrito = carritos[0];
                    users[1].Carrito = carritos[1];
                    _dbContext.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error al ejecutar el seeder", ex);
            }
        }

    }
}

