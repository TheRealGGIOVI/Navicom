using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NavicomInformatica.DataMappers;
using NavicomInformatica.DTO;
using NavicomInformatica.Interfaces;
using NavicomInformatica.Models;
using NavicomInformatica.Data;
using System.Security.Claims;

namespace NavicomInformatica.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly UserMapper _mapper;
        private readonly DataBaseContext _context;

        public UserController(IUserRepository userRepository, UserMapper userMapper, DataBaseContext context)
        {
            _userRepository = userRepository;
            _mapper = userMapper;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsersAsync()
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var users = await _userRepository.GetUsersAsync();

                if (users == null || !users.Any())
                {
                    return NotFound("No users found.");
                }

                IEnumerable<UserDTO> usersDTO = _mapper.usersToDTO(users);

                return Ok(usersDTO);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserAsync(long id)
        {
            if (id <= 0)
            {
                return BadRequest("Invalid user ID.");
            }

            try
            {
                var user = await _userRepository.GetUserByIdAsync(id);

                if (user == null)
                {
                    return NotFound($"User with ID {id} not found.");
                }

                UserDTO userDTO = _mapper.userToDTO(user);

                return Ok(userDTO);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> AddUserAsync([FromForm] UserCreateDTO newUser)
        {
            if (newUser == null)
                return BadRequest("Información necesaria no enviada.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (string.IsNullOrEmpty(newUser.Email))
                return BadRequest("El email es obligatorio.");

            var existingEmailUser = await _userRepository.GetUserByEmailAsync(newUser.Email);
            if (existingEmailUser != null)
                return Conflict("Email existente, por favor introduzca otro Email.");

            try
            {
                var userToAdd = new User
                {
                    Nombre = newUser.Nombre ?? string.Empty,
                    Apellidos = newUser.Apellidos,
                    Email = newUser.Email,
                    Password = newUser.Password ?? string.Empty,
                    Rol = newUser.Rol ?? "user"
                };

                var passwordHasher = new PasswordHasher();
                userToAdd.Password = passwordHasher.Hash(userToAdd.Password);

                await _userRepository.AddUserAsync(userToAdd);
                await _context.SaveChangesAsync(); 

                var carrito = new Carrito
                {
                    Id = userToAdd.Id,      
                    UserId = userToAdd.Id,
                    TotalPrice = 0.0
                };

                _context.Carritos.Add(carrito);
                await _context.SaveChangesAsync();

                userToAdd.Carrito = carrito;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Usuario registrado con éxito." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message} | {ex.InnerException?.Message}");
            }
        }


        [HttpPut("actualizar")]
        [Authorize]
        public async Task<IActionResult> ActualizarPerfilUsuario([FromBody] UserDTO datosUsuario)
        {
            var idUsuarioClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(idUsuarioClaim))
            {
                return BadRequest("No se pudo obtener el ID del usuario.");
            }

            int idUsuario = int.Parse(idUsuarioClaim);
            var usuario = await _userRepository.GetUserByIdAsync(idUsuario);

            if (usuario == null)
            {
                return NotFound(new { error = "Usuario no encontrado." });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { error = "Los datos proporcionados para el usuario no son válidos." });
            }

            usuario.Nombre = datosUsuario.Nombre ?? usuario.Nombre;
            usuario.Apellidos = datosUsuario.Apellidos;

            try
            {
                await _userRepository.ActualizarUsuarioAsync(usuario);
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }
            return NoContent();
        }

        [HttpDelete("eliminar")]
        [Authorize]
        public async Task<IActionResult> EliminarCuentaUsuario()
        {
            int idUsuario = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var usuario = await _userRepository.GetUserByIdAsync(idUsuario);

            if (usuario == null)
            {
                return NotFound(new { error = "Usuario no encontrado." });
            }

            await _userRepository.EliminarUsuarioAsync(idUsuario);

            return Ok(new { message = "La cuenta del usuario ha sido eliminada exitosamente." });
        }

        [Authorize(Roles = "admin")]
        [HttpPut("update-role/{id}")]
        public async Task<IActionResult> UpdateUserRole(long id, [FromBody] UpdateRoleDTO roleUpdate)
        {
            if (roleUpdate == null || string.IsNullOrEmpty(roleUpdate.NewRole) || (roleUpdate.NewRole.ToLower() != "user" && roleUpdate.NewRole.ToLower() != "admin"))
            {
                return BadRequest("Rol inválido. Use 'user' o 'admin'.");
            }

            try
            {
                var user = await _userRepository.GetUserByIdAsync(id);
                if (user == null)
                {
                    return NotFound($"User with ID {id} not found.");
                }

                user.Rol = roleUpdate.NewRole.ToLower();
                await _userRepository.ActualizarUsuarioAsync(user);
                return Ok(new { message = $"Rol de usuario {id} actualizado a {roleUpdate.NewRole}." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
    }
}