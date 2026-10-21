using NavicomInformatica.Models;
using MailKit.Security;
using MimeKit.Text;
using MimeKit;
using MailKit.Net.Smtp;
using NavicomInformatica.DTO;



namespace NavicomInformatica.ServiceEmail
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        public EmailService(IConfiguration config)
        {
            _config = config;
        }
        public void SendEmail(EmailDTO request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Para))
            {
                Console.WriteLine("EmailService: No se especificó destinatario (request.Para está vacío).");
                return;
            }

            var host = _config["Email:Host"]
                    ?? Environment.GetEnvironmentVariable("Email__Host")
                    ?? "smtp.gmail.com";

            var portStr = _config["Email:Port"]
                       ?? Environment.GetEnvironmentVariable("Email__Port")
                       ?? "587";
            int.TryParse(portStr, out var port);
            if (port <= 0) port = 587;

            var userName = _config["Email:UserName"]
                        ?? Environment.GetEnvironmentVariable("Email__UserName")
                        ?? Environment.GetEnvironmentVariable("EMAIL_USER")
                        ?? "soporte@navicominformatica.es";

            var password = _config["Email:PassWord"]
                        ?? Environment.GetEnvironmentVariable("Email__PassWord")
                        ?? Environment.GetEnvironmentVariable("EMAIL_PASSWORD");

            if (string.IsNullOrWhiteSpace(password))
            {
                Console.WriteLine("EmailService AVISO: No se ha configurado la contraseña de correo (Email__PassWord).");
                throw new InvalidOperationException("La contraseña de correo (Email__PassWord) no está configurada en las variables de entorno de Vercel.");
            }

            var email = new MimeMessage();
            email.From.Add(new MailboxAddress("Navicom Informática", userName));
            email.To.Add(MailboxAddress.Parse(request.Para));
            email.Subject = request.Asunto;
            email.Body = new TextPart(TextFormat.Html)
            {
                Text = request.Contenido
            };

            using var smtp = new SmtpClient();
            smtp.Connect(host, port, SecureSocketOptions.StartTls);
            smtp.Authenticate(userName, password);
            smtp.Send(email);
            smtp.Disconnect(true);
        }
    }
}
