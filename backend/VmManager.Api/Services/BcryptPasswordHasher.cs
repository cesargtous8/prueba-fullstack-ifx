namespace VmManager.Api.Services;

public class BcryptPasswordHasher : IPasswordHasher
{
    public string Hash(string plainText) => BCrypt.Net.BCrypt.HashPassword(plainText);

    public bool Verify(string plainText, string hash) =>
        BCrypt.Net.BCrypt.Verify(plainText, hash);
}