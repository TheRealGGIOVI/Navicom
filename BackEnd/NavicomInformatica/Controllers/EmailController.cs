using Microsoft.AspNetCore.Mvc;
using NavicomInformatica.ServiceEmail;
using NavicomInformatica.DTO;

namespace NavicomInformatica.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmailController : ControllerBase
    {
        private readonly IEmailService _emailService;

        public EmailController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpPost]
        public IActionResult SendEmail([FromBody] EmailDTO request)
        { 
            try
            {
                _emailService.SendEmail(request);
                return Ok(new { success = true, message = "Correo enviado con éxito." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al enviar email: {ex.Message}");
                return StatusCode(500, new
                {
                    error = "Error al enviar correo",
                    message = ex.Message
                });
            }
        }

    }
}
