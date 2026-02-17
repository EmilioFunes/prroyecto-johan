using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Security.Claims;
using back.shoesshop.Data;
using back.shoesshop.Models;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DB Config
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=shoesshop.db"));

// JWT Config
var jwtKey = builder.Configuration["Jwt:Key"] ?? "super_secret_key_123456789_must_be_long_enough";
var key = Encoding.ASCII.GetBytes(jwtKey);
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

// CORS Config - Permissive for Dev
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();
app.UseCors("AllowAll");

// Static files for uploads
var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadsPath)) Directory.CreateDirectory(uploadsPath);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.UseAuthentication();
app.UseAuthorization();

// Seeding Logic
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();

    if (!db.Users.Any())
    {
        db.Users.Add(new User { Username = "admin", PasswordHash = "admin123", Role = "Admin" });
        db.SaveChanges();
    }

    if (!db.Shoes.Any())
    {
        var sampleShoes = new List<Shoe>
        {
            new Shoe { Name = "Air Max 270", Brand = "Nike", Price = 150.00m, Size = 10.5m, Description = "Legendary comfort.", ImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff" },
            new Shoe { Name = "Ultra Boost", Brand = "Adidas", Price = 180.00m, Size = 9.5m, Description = "Energy return.", ImageUrl = "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb" },
            new Shoe { Name = "Classic Leather", Brand = "Reebok", Price = 80.00m, Size = 11.0m, Description = "Timeless style.", ImageUrl = "https://images.unsplash.com/photo-1539185441755-769473a23570" },
            new Shoe { Name = "Chuck Taylor", Brand = "Converse", Price = 60.00m, Size = 10.0m, Description = "All star icon.", ImageUrl = "https://images.unsplash.com/photo-1491553895911-0055eca6402d" },
            new Shoe { Name = "Old Skool", Brand = "Vans", Price = 65.00m, Size = 9.0m, Description = "Skate classic.", ImageUrl = "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77" },
            new Shoe { Name = "990v5", Brand = "New Balance", Price = 175.00m, Size = 10.5m, Description = "Dad shoe king.", ImageUrl = "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2" },
            new Shoe { Name = "Forum Low", Brand = "Adidas", Price = 100.00m, Size = 12.0m, Description = "Retro hoop vibes.", ImageUrl = "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a" },
            new Shoe { Name = "Blazer Mid", Brand = "Nike", Price = 110.00m, Size = 10.0m, Description = "Vintage hoops.", ImageUrl = "https://images.unsplash.com/photo-1560769629-975ec94e6a86" },
            new Shoe { Name = "Clyde All-Pro", Brand = "Puma", Price = 130.00m, Size = 11.5m, Description = "Pro performance.", ImageUrl = "https://images.unsplash.com/photo-1608231387042-66d1773070a5" },
            new Shoe { Name = "Gel-Lyte III", Brand = "ASICS", Price = 120.00m, Size = 10.0m, Description = "Split tongue.", ImageUrl = "https://images.unsplash.com/photo-1605348532760-6753d2c43329" },
            new Shoe { Name = "Superstar", Brand = "Adidas", Price = 90.00m, Size = 10.5m, Description = "Shell toe.", ImageUrl = "https://images.unsplash.com/photo-1512374382149-4332c6c02151" },
            new Shoe { Name = "Dunk Low", Brand = "Nike", Price = 120.00m, Size = 9.5m, Description = "Hype beast favorite.", ImageUrl = "https://images.unsplash.com/photo-1597044768535-09894e527aa4" },
            new Shoe { Name = "Sk8-Hi", Brand = "Vans", Price = 75.00m, Size = 11.0m, Description = "High top skate.", ImageUrl = "https://images.unsplash.com/photo-1560769629-975ec94e6a86" },
            new Shoe { Name = "Gazelle", Brand = "Adidas", Price = 100.00m, Size = 10.0m, Description = "Suede classic.", ImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff" },
            new Shoe { Name = "React Vision", Brand = "Nike", Price = 140.00m, Size = 10.5m, Description = "Surreal comfort.", ImageUrl = "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb" }
        };
        db.Shoes.AddRange(sampleShoes);
        db.SaveChanges();
    }
}

app.MapControllers();

app.Run();
