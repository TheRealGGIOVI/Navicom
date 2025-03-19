namespace NavicomInformatica.Interfaces
{
    public interface IPasswordHasher
    {
        string Hash(string password);
    }
}
