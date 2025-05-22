using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NavicomInformatica.Data;
using NavicomInformatica.Data.Seeder;
using NavicomInformatica.DataMappers;
using NavicomInformatica.Interfaces;
using NavicomInformatica.Models;
using NavicomInformatica.Repositories;
using Swashbuckle.AspNetCore.Filters;
using System.Text;
using Microsoft.EntityFrameworkCore;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.WebHost.UseUrls("http://0.0.0.0:5000");


        // Add services to the container.
        builder.Services.AddControllers();
        //builder.Services.AddScoped<DataBaseContext>();
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





        // Swagger configuration
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

        // JWT Authentication configuration
        builder.Services.AddAuthentication().AddJwtBearer(options =>
        {
            string key = Environment.GetEnvironmentVariable("JWT_KEY");
            if (string.IsNullOrEmpty(key))
            {
                throw new Exception("JWT_KEY variable de entorno no está configurada.");
            }
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
            };
        });

        var app = builder.Build();

        // Database initialization
        //using (IServiceScope scope = app.Services.CreateScope())
        //{
        //    DataBaseContext dbcontext = scope.ServiceProvider.GetService<DataBaseContext>();
        //    dbcontext.Database.EnsureCreated();
        //    var seeder = scope.ServiceProvider.GetRequiredService<Seeder>();
        //    seeder.Seed();
        //}

        using (IServiceScope scope = app.Services.CreateScope())
        {
            var env = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();

            // 🔒 SOLO en entorno local
            if (env.IsDevelopment() || env.IsProduction())
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




        // Habilitar Swagger y CORS para desarrollo o producción
        if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        //app.UseHttpsRedirection();
        app.UseStaticFiles();
        app.UseCors(policy =>
        {
            policy.AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        }); // Aplica la política de CORS


        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();
        app.Run();
    }
}
