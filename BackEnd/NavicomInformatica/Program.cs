﻿using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NavicomInformatica.Data;
using NavicomInformatica.Data.Seeder;
using NavicomInformatica.DataMappers;
using NavicomInformatica.Interfaces;
using NavicomInformatica.Models;
using NavicomInformatica.Repositories;
using Swashbuckle.AspNetCore.Filters;
using System.Security.Claims;
using System.Text;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Agregar CORS
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowAllOrigins", builder =>
            {
                builder.AllowAnyOrigin()    // Permite cualquier origen (incluyendo todos los puertos de localhost)
                       .AllowAnyHeader()    // Permite cualquier encabezado
                       .AllowAnyMethod();   // Permite cualquier método (GET, POST, etc.)
            });
        });

        // Add services to the container.
        builder.Services.AddControllers();
        builder.Services.AddScoped<IUserRepository, UserRepository>();
        builder.Services.AddScoped<IProductoRepository, ProductRepository>(); // Registro de IProductoRepository
        builder.Services.AddScoped<UserMapper>();
        builder.Services.AddScoped<ProductoMapper>(); // Registro de ProductoMapper
        builder.Services.AddTransient<IPasswordHasher, PasswordHasher>(); // Registro de PasswordHasher
        builder.Services.AddScoped<DataBaseContext>();
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
        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        }).AddJwtBearer(options =>
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
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                RoleClaimType = ClaimTypes.Role
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

        // Habilitar Swagger y CORS para desarrollo o producción
        if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseCors("AllowAllOrigins"); // Aplica la política de CORS

        app.UseHttpsRedirection();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseStaticFiles();
        app.MapControllers();
        app.Run();
    }
}
