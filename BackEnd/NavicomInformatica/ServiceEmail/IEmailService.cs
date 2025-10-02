using NavicomInformatica.DTO;
namespace NavicomInformatica.ServiceEmail
{
    public interface IEmailService
    {
        void SendEmail(EmailDTO request);
    }
}
