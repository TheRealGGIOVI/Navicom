using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NavicomInformatica.Models;

namespace NavicomInformatica.Data
{
    public class DataBaseContext : DbContext
    {
        private const string DATABASE_PATH = "Navicom.db";

        public DbSet<User>? Users { get; set; }
        public DbSet<Producto>? Products { get; set; }
        public DbSet<ProductoImagen>? ProductoImagenes { get; set; }
        public DbSet<Carrito>? Carritos { get; set; }
        public DbSet<CarritoItem>? CarritoItems { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            optionsBuilder.UseSqlite($"DataSource={baseDir}{DATABASE_PATH}");
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración de User
            modelBuilder.Entity<User>()
                .HasKey(u => u.Id);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Configuración de Producto
            modelBuilder.Entity<Producto>()
                .HasKey(p => p.Id);

            // Configuración de la relación Producto -> ProductoImagen (eliminación en cascada)
            modelBuilder.Entity<Producto>()
                .HasMany(p => p.Imagenes)
                .WithOne(pi => pi.Producto)
                .HasForeignKey(pi => pi.ProductoId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configuración de Carrito
            modelBuilder.Entity<Carrito>()
                .HasKey(c => c.Id);

            modelBuilder.Entity<Carrito>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Carrito>()
                .HasMany(c => c.Productos)
                .WithOne(ci => ci.Carrito)
                .HasForeignKey(ci => ci.CarritoId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configuración de CarritoItem
            modelBuilder.Entity<CarritoItem>()
                .HasKey(ci => ci.Id);

            modelBuilder.Entity<CarritoItem>()
                .HasOne(ci => ci.Producto)
                .WithMany()
                .HasForeignKey(ci => ci.ProductoId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}