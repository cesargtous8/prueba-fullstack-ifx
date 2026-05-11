using Microsoft.EntityFrameworkCore;
using VmManager.Api.Models;
using VmManager.Api.Services;

namespace VmManager.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var db = services.GetRequiredService<AppDbContext>();
        var hasher = services.GetRequiredService<IPasswordHasher>();

        if (!await db.Users.AnyAsync())
        {
            db.Users.Add(new User
            {
                Id = Guid.NewGuid(),
                Name = "Admin IFX",
                Email = "admin@ifx.com",
                PasswordHash = hasher.Hash("Admin123"),
                Role = "Administrador"
            });

            db.Users.Add(new User
            {
                Id = Guid.NewGuid(),
                Name = "Cliente IFX",
                Email = "cliente@ifx.com",
                PasswordHash = hasher.Hash("Cliente123"),
                Role = "Cliente"
            });

            await db.SaveChangesAsync();
        }
    }
}
