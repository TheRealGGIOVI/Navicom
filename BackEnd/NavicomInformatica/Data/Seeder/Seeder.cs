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
                // Asegurarse de que las migraciones se apliquen
                _dbContext.Database.Migrate(); // Reemplaza EnsureCreated() por Migrate()

                // Verificar si ya hay datos en la base de datos (por ejemplo, usuarios)
                if (!_dbContext.Users.Any())
                {
                    string passwordHashedChristian = _passwordHasher.Hash("Josemi123.");
                    string passwordHashedJuanjo = _passwordHasher.Hash("Giovi123.");

                    // Crear los usuarios sin asignarles un Carrito todavía
                    User[] users = {
                        new User { Nombre = "Josemi", Apellidos = "toro", Email = "josemi@gmail.com", Rol="admin" },
                        new User { Nombre = "Giovanni", Apellidos = "giove", Email = "giovi@gmail.com", Rol="admin" },
                    };

                    users[0].Password = passwordHashedChristian;
                    users[1].Password = passwordHashedJuanjo;

                    // Insertar los usuarios y guardar los cambios para generar sus Id
                    _dbContext.Users.AddRange(users);
                    _dbContext.SaveChanges();

                    // Ahora que los usuarios tienen un Id, crear los carritos
                    Carrito[] carritos = {
                        new Carrito { UserId = users[0].Id, TotalPrice = 0.0 },
                        new Carrito { UserId = users[1].Id, TotalPrice = 0.0 },
                    };

                    // Insertar los carritos
                    _dbContext.Carritos.AddRange(carritos);
                    _dbContext.SaveChanges();

                    // Opcional: Si quieres que los usuarios tengan una referencia al Carrito
                    users[0].Carrito = carritos[0];
                    users[1].Carrito = carritos[1];
                    _dbContext.SaveChanges();
                }

                // Verificar si ya hay productos en la base de datos
                if (!_dbContext.Products.Any())
                {
                    Producto[] productos = {
                    // Laptops (primera sección)
                    new Producto { Brand = "HP", Model = "EliteBook 840 G4", Precio = 386.00, Stock = 7, Img_Name = "HP_EliteBook_840_G4.jpg", Description = "HP EliteBook 840 G4 14\" Core i5-8ª - SSD 256 GB - RAM 16 GB", Details = "Core i5-8ª, SSD 256 GB, RAM 16 GB, 14 pulgadas", Category = "Laptops" },
                    new Producto { Brand = "HP", Model = "ProBook 450 G7", Precio = 599.00, Stock = 10, Img_Name = "HP_ProBook_450_G7.jpg", Description = "HP ProBook 450 G7 15\" Core i5-10ª - SSD 512 GB - RAM 16 GB", Details = "Core i5-10ª, SSD 512 GB, RAM 16 GB, 15 pulgadas", Category = "Laptops" },
                    new Producto { Brand = "Lenovo", Model = "ThinkPad L490 14", Precio = 298.00, Stock = 5, Img_Name = "Lenovo_ThinkPad_L490_14.jpg", Description = "Lenovo ThinkPad L490 14\" Core i5-8ª - SSD 256 GB - RAM 8 GB", Details = "Core i5-8ª, SSD 256 GB, RAM 8 GB, 14 pulgadas", Category = "Laptops" },
                    new Producto { Brand = "Lenovo", Model = "ThinkPad T14G1 14", Precio = 530.00, Stock = 8, Img_Name = "Lenovo_ThinkPad_T14G1_14.jpg", Description = "Lenovo ThinkPad T14G1 14\" Core i5-10ª - SSD 256 GB - RAM 16 GB", Details = "Core i5-10ª, SSD 256 GB, RAM 16 GB, 14 pulgadas", Category = "Laptops" },
                    new Producto { Brand = "Lenovo", Model = "ThinkPad T490 14", Precio = 370.00, Stock = 6, Img_Name = "Lenovo_ThinkPad_T490_14.jpg", Description = "Lenovo ThinkPad T490 14\" Core i5-8ª - SSD 256 GB - RAM 16 GB", Details = "Core i5-8ª, SSD 256 GB, RAM 16 GB, 14 pulgadas", Category = "Laptops" },
                    new Producto { Brand = "Lenovo", Model = "ThinkPad L13 13", Precio = 391.00, Stock = 9, Img_Name = "Lenovo_ThinkPad_L13_13.jpg", Description = "Lenovo ThinkPad L13 13\" Core i5-10ª - SSD 256 GB - RAM 16 GB", Details = "Core i5-10ª, SSD 256 GB, RAM 16 GB, 13 pulgadas", Category = "Laptops" },
                    new Producto { Brand = "HP", Model = "ProBook 450 G8", Precio = 649.00, Stock = 11, Img_Name = "HP_ProBook_450_G8.jpg", Description = "HP ProBook 450 G8 15\" Core i5-11ª - SSD 512 GB - RAM 16 GB", Details = "Core i5-11ª, SSD 512 GB, RAM 16 GB, 15 pulgadas", Category = "Laptops" },
                    new Producto { Brand = "Lenovo", Model = "ThinkPad L14 14", Precio = 391.00, Stock = 7, Img_Name = "Lenovo_ThinkPad_L14_14.jpg", Description = "Lenovo ThinkPad L14 14\" Core i5-10ª - SSD 256 GB - RAM 8 GB", Details = "Core i5-10ª, SSD 256 GB, RAM 8 GB, 14 pulgadas", Category = "Laptops" },
                    new Producto { Brand = "Lenovo", Model = "ThinkPad E595 15.6", Precio = 341.00, Stock = 12, Img_Name = "Lenovo_ThinkPad_E595_15_6.jpg", Description = "Lenovo ThinkPad E595 15.6\" Ryzen 5 3500U - SSD 256 GB - RAM 16 GB", Details = "Ryzen 5 3500U, SSD 256 GB, RAM 16 GB, 15.6 pulgadas", Category = "Laptops" },

                    // Mini-PCs (segunda sección)
                    new Producto { Brand = "Lenovo", Model = "ThinkCentre M920Q", Precio = 199.00, Stock = 8, Img_Name = "Lenovo_ThinkCentre_M920Q.jpg", Description = "Lenovo ThinkCentre M920Q mini-pc 15-8ª Gen - SSD 256 GB - RAM 8 GB", Details = "Core i5-8ª Gen, SSD 256 GB, RAM 8 GB, mini-pc", Category = "MiniPCs" },
                    new Producto { Brand = "HP", Model = "EliteDesk 800 G4", Precio = 235.00, Stock = 6, Img_Name = "HP_EliteDesk_800_G4.jpg", Description = "HP EliteDesk 800 G4 mini-pc Core i5-8ª - SSD 256 GB - RAM 16 GB", Details = "Core i5-8ª, SSD 256 GB, RAM 16 GB, mini-pc", Category = "MiniPCs" },
                    new Producto { Brand = "HP", Model = "EliteDesk 800 G4", Precio = 386.00, Stock = 9, Img_Name = "HP_EliteDesk_800_G4_32GB.jpg", Description = "HP EliteDesk 800 G4 mini-pc Core i7-8ª - SSD 512 GB - RAM 32 GB", Details = "Core i7-8ª, SSD 512 GB, RAM 32 GB, mini-pc", Category = "MiniPCs" },
                    new Producto { Brand = "HP", Model = "ProDesk 600 G5", Precio = 265.00, Stock = 5, Img_Name = "HP_ProDesk_600_G5.jpg", Description = "HP ProDesk 600 G5 mini-pc Core i5-9ª - SSD 512 GB - RAM 16 GB", Details = "Core i5-9ª, SSD 512 GB, RAM 16 GB, mini-pc", Category = "MiniPCs" },
                    new Producto { Brand = "HP", Model = "EliteDesk 800 G2", Precio = 144.00, Stock = 10, Img_Name = "HP_EliteDesk_800_G2.jpg", Description = "HP EliteDesk 800 G2 mini-pc Core i5-6ª - SSD 256 GB - RAM 8 GB", Details = "Core i5-6ª, SSD 256 GB, RAM 8 GB, mini-pc", Category = "MiniPCs" },
                    new Producto { Brand = "HP", Model = "ProDesk 600 G4", Precio = 229.00, Stock = 7, Img_Name = "HP_ProDesk_600_G4.jpg", Description = "HP ProDesk 600 G4 mini-pc Core i5-8ª - SSD 512 GB - RAM 8 GB", Details = "Core i5-8ª, SSD 512 GB, RAM 8 GB, mini-pc", Category = "MiniPCs" },
                    new Producto { Brand = "Lenovo", Model = "ThinkCentre M720Q", Precio = 99.00, Stock = 11, Img_Name = "Lenovo_ThinkCentre_M720Q.jpg", Description = "Lenovo ThinkCentre M720Q mini-pc Pentium - SSD 256 GB - RAM 8 GB", Details = "Pentium, SSD 256 GB, RAM 8 GB, mini-pc", Category = "MiniPCs" },
                    new Producto { Brand = "Apple", Model = "iMac 17.1 (Final 2015)", Precio = 599.00, Stock = 6, Img_Name = "Apple_iMac_17_1.jpg", Description = "Apple iMac 17.1 (Final 2015) All in One 27\" Core i5-6500 - SSD 128 GB - RAM 16 GB", Details = "Core i5-6500, SSD 128 GB, RAM 16 GB, 27 pulgadas, All in One", Category = "MiniPCs" },
                    new Producto { Brand = "HP", Model = "Workstation Z440 Torre", Precio = 348.00, Stock = 8, Img_Name = "HP_Workstation_Z440.jpg", Description = "HP Workstation Z440 Torre Xeon E5-1620 V3 - SSD 480 GB - RAM 32 GB", Details = "Xeon E5-1620 V3, SSD 480 GB, RAM 32 GB, Torre", Category = "MiniPCs" },

                    // Monitores y accesorios (tercera sección)
                    new Producto { Brand = "HP", Model = "E24C", Precio = 60.00, Stock = 9, Img_Name = "HP_E24C.jpg", Description = "Monitor 24\" FHD HP E24C (Altavoces y Webcam) - Feo", Details = "24 pulgadas, FHD, Altavoces, Webcam", Category = "MonitorsAndAccessories" },
                    new Producto { Brand = "Lenovo", Model = "TIO22D", Precio = 98.00, Stock = 5, Img_Name = "Lenovo_TIO22D.jpg", Description = "Monitor 22\" Lenovo TIO22D (Altavoces)", Details = "22 pulgadas, Altavoces", Category = "MonitorsAndAccessories" },
                    new Producto { Brand = "Lenovo", Model = "P24H-10", Precio = 68.00, Stock = 7, Img_Name = "Lenovo_P24H_10.jpg", Description = "Monitor 24\" 2K Lenovo P24H-10 - Feo", Details = "24 pulgadas, 2K", Category = "MonitorsAndAccessories" },
                    new Producto { Brand = "Hanns", Model = "HP225DJB", Precio = 59.00, Stock = 6, Img_Name = "Hanns_HP225DJB.jpg", Description = "Monitor 22\" FHD Hanns HP225DJB", Details = "22 pulgadas, FHD", Category = "MonitorsAndAccessories" },
                    new Producto { Brand = "Hanns", Model = "HP227DJB", Precio = 68.00, Stock = 8, Img_Name = "Hanns_HP227DJB.jpg", Description = "Monitor 22\" FHD Hanns HP227DJB", Details = "22 pulgadas, FHD", Category = "MonitorsAndAccessories" },
                    new Producto { Brand = "Lenovo", Model = "TIO24 GEN3", Precio = 99.00, Stock = 10, Img_Name = "Lenovo_TIO24_GEN3.jpg", Description = "Monitor 24\" Lenovo TIO24 GEN3", Details = "24 pulgadas", Category = "MonitorsAndAccessories" },
                    new Producto { Brand = "HP", Model = "UltraSlim Docking Station", Precio = 35.00, Stock = 11, Img_Name = "HP_UltraSlim_Docking_Station.jpg", Description = "HP 2013 UltraSlim Docking Station HSTNN-IX10", Details = "Docking Station, Compatible con HP", Category = "MonitorsAndAccessories" },
                    new Producto { Brand = "Lenovo", Model = "USB-C Travel HUB", Precio = 29.95, Stock = 12, Img_Name = "Lenovo_USB_C_Travel_HUB.jpg", Description = "Lenovo USB-C Travel HUB L0T0D074-CS-R", Details = "USB-C Hub, Travel", Category = "MonitorsAndAccessories" },
                    new Producto { Brand = "Lenovo", Model = "USB-C Dock Gen2", Precio = 200.00, Stock = 0, Img_Name = "Lenovo_USB_C_Dock_Gen2.jpg", Description = "Lenovo USB-C Dock Gen2 40AN0135EU nueva", Details = "USB-C Dock, Gen2", Category = "MonitorsAndAccessories" }
                };

                    // Insertar los productos
                    _dbContext.Products.AddRange(productos);
                    _dbContext.SaveChanges();

                    // Log para confirmar cuántos productos se insertaron
                    Console.WriteLine($"Se insertaron {productos.Length} productos en la base de datos.");
                }
                else
                {
                    Console.WriteLine("La base de datos ya contiene productos, no se insertaron nuevos datos.");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al ejecutar el seeder: {ex.Message}");
                throw new Exception("Error al ejecutar el seeder", ex);
            }
        }
    }
}