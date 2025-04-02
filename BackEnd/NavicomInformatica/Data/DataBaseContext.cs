using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NavicomInformatica.Models;

namespace NavicomInformatica.Data
{
    public class DataBaseContext : DbContext
    {
        private const string DATABASE_PATH = "Navicom.db";

        public DbSet<User> Users { get; set; }
        public DbSet<Producto> Products { get; set; }
        public DbSet<Carrito> Carritos { get; set; }
        public DbSet<CarritoItem> CarritoItems { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            optionsBuilder.UseSqlite($"DataSource={baseDir}{DATABASE_PATH}");
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
            modelBuilder.Entity<Carrito>()
    .HasKey(c => c.Id);  // Asegura que 'Id' es la clave primaria


            modelBuilder.Entity<Carrito>()
              .HasMany(c => c.Productos)
              .WithOne()
              .HasForeignKey(ci => ci.CarritoId)
              .OnDelete(DeleteBehavior.Cascade);

            


        }
    }
}
