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

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddControllers();
        builder.Services.AddScoped<DataBaseContext>();
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
        using (IServiceScope scope = app.Services.CreateScope())
        {
            DataBaseContext dbcontext = scope.ServiceProvider.GetService<DataBaseContext>();
            dbcontext.Database.EnsureCreated();
            var seeder = scope.ServiceProvider.GetRequiredService<Seeder>();
            seeder.Seed();
        }

        /*
        app.Use(async (context, next) =>
        {
            var user = context.User;
            if (user.Identity.IsAuthenticated)
            {
                Console.WriteLine("Usuario autenticado:");
                foreach (var claim in user.Claims)
                {
                    Console.WriteLine($"{claim.Type}: {claim.Value}");
                }
            }
            else
            {
                Console.WriteLine("Usuario NO autenticado");
            }
            await next();
        });
        */

        // Habilitar Swagger y CORS para desarrollo o producción
        if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();
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
