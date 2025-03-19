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
        }
    }
}
