using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NavicomInformatica.Data;
using NavicomInformatica.Data.Seeder;
using NavicomInformatica.DataMappers;
using NavicomInformatica.Interfaces;
using NavicomInformatica.Models;
using NavicomInformatica.Repositories;
using NavicomInformatica.ServiceEmail;
using System.Text;
using Swashbuckle.AspNetCore.Filters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

// 👉 Stripe
using Stripe;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.FileProviders;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        // Vercel (runtime "container") envía el tráfico al puerto $PORT; en local se usa 7069.
        var port = Environment.GetEnvironmentVariable("PORT") ?? "7069";
        builder.WebHost.UseUrls($"http://0.0.0.0:{port}");


        /* ---------- 1. INYECCIÓN DE SERVICIOS EXISTENTES ---------- */
        builder.Services.AddControllers();
        var connectionString = ResolveConnectionString(builder.Configuration);
        builder.Services.AddDbContext<DataBaseContext>(options =>
            options.UseNpgsql(connectionString));

        builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
        builder.Services.AddScoped<IUserRepository, UserRepository>();
        builder.Services.AddScoped<UserMapper>();
        builder.Services.AddScoped<IProductoRepository, ProductRepository>();
        builder.Services.AddScoped<ProductoMapper>();
        builder.Services.AddScoped<ICarritoRepository, CarritoRepository>();
        builder.Services.AddScoped<CarritoMapper>();
        builder.Services.AddScoped<Seeder>();
        builder.Services.AddScoped<IEmailService, EmailService>();

        /* ---------- 2. STRIPE SETTINGS ---------- */
        // Lee la sección "Stripe" del appsettings.json / secrets / variables de entorno
        builder.Services.Configure<StripeSettings>(
            builder.Configuration.GetSection("Stripe"));
        // Si no se define Stripe__Domain, usa el dominio del preview o de producción que Vercel expone.
        builder.Services.PostConfigure<StripeSettings>(s =>
        {
            if (string.IsNullOrWhiteSpace(s.Domain))
            {
                var vercelDomain = Environment.GetEnvironmentVariable("VERCEL_URL")
                                ?? Environment.GetEnvironmentVariable("VERCEL_PROJECT_PRODUCTION_URL");
                if (!string.IsNullOrWhiteSpace(vercelDomain)) s.Domain = $"https://{vercelDomain}";
            }
        });

        /* ---------- 3. SWAGGER ---------- */
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, new OpenApiSecurityScheme
            {
                BearerFormat = "JWT",
                Name = "Authorization",
                Description = "Escribe **_SOLO_** tu token JWT",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = JwtBearerDefaults.AuthenticationScheme
            });
            options.OperationFilter<SecurityRequirementsOperationFilter>(true, JwtBearerDefaults.AuthenticationScheme);
        });

        /* ---------- 4. JWT ---------- */
        builder.Services.AddAuthentication().AddJwtBearer(options =>
        {
            string key = Environment.GetEnvironmentVariable("JWT_KEY")
                      ?? builder.Configuration["JWT_KEY"]
                      ?? "Navicom_Default_Fallback_JWT_Secret_Key_2026_!#99";

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
            };
        });

        var app = builder.Build();

        /* ---------- 5. STRIPE CONFIGURATION.GLOBAL ---------- */
        // Obtiene las claves y las expone a StripeConfiguration
        var stripeSettings = app.Services.GetRequiredService<IOptions<StripeSettings>>().Value;
        StripeConfiguration.ApiKey = stripeSettings.SecretKey;   // 🔒 solo la clave secreta

        /* ---------- 6. DATABASE INIT ---------- */
        var dbInit = builder.Configuration["DB_INIT"]
                  ?? Environment.GetEnvironmentVariable("DB_INIT");
        if (string.Equals(dbInit, "true", StringComparison.OrdinalIgnoreCase))
        {
            using IServiceScope scope = app.Services.CreateScope();
            try
            {
                var dbcontext = scope.ServiceProvider.GetRequiredService<DataBaseContext>();
                var creator = dbcontext.GetService<IRelationalDatabaseCreator>();
                try
                {
                    creator.CreateTables();
                }
                catch (Exception createEx)
                {
                    Console.WriteLine($"Nota al crear tablas (posiblemente ya existan): {createEx.Message}");
                }

                var seeder = scope.ServiceProvider.GetRequiredService<Seeder>();
                seeder.Seed();
                Console.WriteLine("DB_INIT: base de datos creada y sembrada.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al inicializar la base de datos: {ex.Message}");
            }
        }

        /* ---------- 7. MIDDLEWARE ---------- */
        if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        //app.UseHttpsRedirection();
        app.UseStaticFiles();
        var imagesPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
        Directory.CreateDirectory(imagesPath);
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(imagesPath),
            RequestPath = "/api/images"
        });
        app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();

        // Endpoint manual para crear y sembrar la base de datos directamente desde el navegador
        app.MapGet("/api/init-db", (DataBaseContext db, Seeder seeder) =>
        {
            try
            {
                var creator = db.GetService<IRelationalDatabaseCreator>();
                try
                {
                    creator.CreateTables();
                }
                catch (Exception createEx)
                {
                    Console.WriteLine($"Nota al crear tablas (posiblemente ya existan): {createEx.Message}");
                }

                seeder.Seed();
                return Results.Ok(new { status = "OK", message = "Base de datos creada y sembrada con éxito con los productos y usuarios iniciales." });
            }
            catch (Exception ex)
            {
                return Results.Problem($"Error al inicializar base de datos: {ex.Message} | Detalle interno: {ex.InnerException?.Message}");
            }
        });

        app.Run();
    }

    /* Cadena de conexión: admite DATABASE_URL / POSTGRES_URL (formato postgres://, como inyectan
       las integraciones de Vercel Marketplace, o formato estándar Host=...;Database=...)
       o ConnectionStrings:DefaultConnection. */
    private static string? ResolveConnectionString(IConfiguration config)
    {
        var url = Environment.GetEnvironmentVariable("DATABASE_URL")
                  ?? Environment.GetEnvironmentVariable("POSTGRES_URL");

        if (!string.IsNullOrWhiteSpace(url))
        {
            if (url.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
                url.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
            {
                var uri = new Uri(url);
                var userInfo = uri.UserInfo.Split(':', 2);
                var csb = new Npgsql.NpgsqlConnectionStringBuilder
                {
                    Host = uri.Host,
                    Port = uri.Port > 0 ? uri.Port : 5432,
                    Username = Uri.UnescapeDataString(userInfo[0]),
                    Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : null,
                    Database = uri.AbsolutePath.TrimStart('/'),
                    SslMode = Npgsql.SslMode.Require,
                    TrustServerCertificate = true,
                    MaxPoolSize = 5
                };
                return csb.ConnectionString;
            }

            // Si ya viene en formato de parámetros (ej. Host=...;Database=...)
            return url;
        }

        return config.GetConnectionString("DefaultConnection");
    }
}

/* ---------- 8. POCO con las tres claves de Stripe ---------- */
public class StripeSettings
{
    public string SecretKey { get; set; } = string.Empty;
    public string PublishableKey { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
}
