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
using Swashbuckle.AspNetCore.Filters;
using System.Text;
using Microsoft.EntityFrameworkCore;

// 👉 Stripe
using Stripe;
using Microsoft.Extensions.Options;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.WebHost.UseUrls("https://0.0.0.0:7069");


        /* ---------- 1. INYECCIÓN DE SERVICIOS EXISTENTES ---------- */
        builder.Services.AddControllers();
        builder.Services.AddDbContext<DataBaseContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

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
            string key = Environment.GetEnvironmentVariable("JWT_KEY");
            if (string.IsNullOrEmpty(key))
                throw new Exception("JWT_KEY variable de entorno no está configurada.");

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

        /* ---------- 6. DATABASE SEED (sin cambios) ---------- */
        using (IServiceScope scope = app.Services.CreateScope())
        {
            var env = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();

            // 🔒 SOLO en entorno local
            if (env.IsDevelopment() || env.IsProduction())

            if (env.IsDevelopment() && Environment.MachineName == "TU-PC-NOMBRE")
            {
                try
                {
                    var dbcontext = scope.ServiceProvider.GetRequiredService<DataBaseContext>();
                    dbcontext.Database.EnsureCreated();

                    var seeder = scope.ServiceProvider.GetRequiredService<Seeder>();
                    seeder.Seed();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error al ejecutar el seeder: {ex.Message}");
                }
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
        app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();
        app.Run();
    }
}

/* ---------- 8. POCO con las tres claves de Stripe ---------- */
public class StripeSettings
{
    public string SecretKey { get; set; } = string.Empty;
    public string PublishableKey { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
}
