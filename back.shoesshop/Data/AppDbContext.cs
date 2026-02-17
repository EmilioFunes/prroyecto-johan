using Microsoft.EntityFrameworkCore;
using back.shoesshop.Models;

namespace back.shoesshop.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Shoe> Shoes { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Decimal precision for SQLite/various providers
            modelBuilder.Entity<Shoe>().Property(s => s.Price).HasConversion<double>();
            modelBuilder.Entity<Shoe>().Property(s => s.Size).HasConversion<double>();
        }
    }
}
