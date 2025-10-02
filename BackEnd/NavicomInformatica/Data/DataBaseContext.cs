using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NavicomInformatica.Models;

namespace NavicomInformatica.Data
{
    public class DataBaseContext : DbContext
    {
        public DataBaseContext(DbContextOptions<DataBaseContext> options)
            : base(options)
        {
        }
        private const string DATABASE_PATH = "Navicom.db";

        public DbSet<User>? Users { get; set; }
        public DbSet<Producto>? Products { get; set; }
        public DbSet<ProductoImagen>? ProductoImagenes { get; set; }
        public DbSet<Carrito>? Carritos { get; set; }
        public DbSet<CarritoItem>? CarritoItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }


        //protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        //{
        //    string baseDir = AppDomain.CurrentDomain.BaseDirectory;
        //    optionsBuilder.UseSqlite($"DataSource={baseDir}{DATABASE_PATH}");
        //}

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().ToTable("users");
            modelBuilder.Entity<User>().Property(u => u.Id).HasColumnName("id");
            modelBuilder.Entity<User>().Property(u => u.Nombre).HasColumnName("nombre");
            modelBuilder.Entity<User>().Property(u => u.Apellidos).HasColumnName("apellidos");
            modelBuilder.Entity<User>().Property(u => u.Email).HasColumnName("email");
            modelBuilder.Entity<User>().Property(u => u.Password).HasColumnName("password");
            modelBuilder.Entity<User>().Property(u => u.Rol).HasColumnName("rol");

            // 📦 PRODUCTOS
            modelBuilder.Entity<Producto>().ToTable("products");
            modelBuilder.Entity<Producto>().Property(p => p.Id).HasColumnName("id");
            modelBuilder.Entity<Producto>().Property(p => p.Brand).HasColumnName("brand");
            modelBuilder.Entity<Producto>().Property(p => p.Model).HasColumnName("model");
            modelBuilder.Entity<Producto>().Property(p => p.Precio).HasColumnName("precio");
            modelBuilder.Entity<Producto>().Property(p => p.Discount_Price).HasColumnName("discount_price");
            modelBuilder.Entity<Producto>().Property(p => p.Stock).HasColumnName("stock");
            modelBuilder.Entity<Producto>().Property(p => p.Description).HasColumnName("description");
            modelBuilder.Entity<Producto>().Property(p => p.Details).HasColumnName("details");
            modelBuilder.Entity<Producto>().Property(p => p.Category).HasColumnName("category");

            // 🖼️ PRODUCTO IMÁGENES
            modelBuilder.Entity<ProductoImagen>().ToTable("productoimagenes");
            modelBuilder.Entity<ProductoImagen>().Property(pi => pi.Id).HasColumnName("id");
            modelBuilder.Entity<ProductoImagen>().Property(pi => pi.Img_Name).HasColumnName("img_name");
            modelBuilder.Entity<ProductoImagen>().Property(pi => pi.ProductoId).HasColumnName("productoid");

            // 🛒 CARRITOS
            modelBuilder.Entity<Carrito>().ToTable("carritos");
            modelBuilder.Entity<Carrito>().Property(c => c.Id).HasColumnName("id");
            modelBuilder.Entity<Carrito>().Property(c => c.UserId).HasColumnName("userid");
            modelBuilder.Entity<Carrito>().Property(c => c.TotalPrice).HasColumnName("totalprice");

            // 🧾 CARRITO ITEMS
            modelBuilder.Entity<CarritoItem>().ToTable("carritoitems");
            modelBuilder.Entity<CarritoItem>().Property(ci => ci.Id).HasColumnName("id");
            modelBuilder.Entity<CarritoItem>().Property(ci => ci.Cantidad).HasColumnName("cantidad");
            modelBuilder.Entity<CarritoItem>().Property(ci => ci.PrecioTotalProducto).HasColumnName("preciototalproducto");
            modelBuilder.Entity<CarritoItem>().Property(ci => ci.CarritoId).HasColumnName("carritoid");
            modelBuilder.Entity<CarritoItem>().Property(ci => ci.ProductoId).HasColumnName("productoid");
            
            // 🧾 ORDENES
            modelBuilder.Entity<Order>().ToTable("orders");
            modelBuilder.Entity<Order>().Property(o => o.Id).HasColumnName("id");
            modelBuilder.Entity<Order>().Property(o => o.UserId).HasColumnName("userid");
            modelBuilder.Entity<Order>().Property(o => o.TotalAmount).HasColumnName("totalamount");
            modelBuilder.Entity<Order>().Property(o => o.Currency).HasColumnName("currency");
            modelBuilder.Entity<Order>().Property(o => o.CreatedAt).HasColumnName("createdat");

            // 🧾 ORDEN ITEMS
            modelBuilder.Entity<OrderItem>().ToTable("orderitems");
            modelBuilder.Entity<OrderItem>().Property(oi => oi.Id).HasColumnName("id");
            modelBuilder.Entity<OrderItem>().Property(oi => oi.OrderId).HasColumnName("orderid");
            modelBuilder.Entity<OrderItem>().Property(oi => oi.ProductoId).HasColumnName("productoid");
            modelBuilder.Entity<OrderItem>().Property(oi => oi.Cantidad).HasColumnName("cantidad");
            modelBuilder.Entity<OrderItem>().Property(oi => oi.PrecioUnitario).HasColumnName("preciounitario");

            // Relaciones
            modelBuilder.Entity<Order>()
                .HasMany(o => o.Items)
                .WithOne(oi => oi.Order)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Producto)
                .WithMany()
                .HasForeignKey(oi => oi.ProductoId)
                .OnDelete(DeleteBehavior.Restrict);
            
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

            //modelBuilder.Entity<Carrito>()
            //    .HasOne(c => c.User)
            //    .WithMany()
            //    .HasForeignKey(c => c.UserId)
            //    .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Carrito>()
                .HasOne(c => c.User)
                .WithOne(u => u.Carrito)
                .HasForeignKey<Carrito>(c => c.UserId)
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