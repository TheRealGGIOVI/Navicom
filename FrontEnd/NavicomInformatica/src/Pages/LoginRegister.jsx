import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { validation } from "../utils/validationForm";
import { LOGIN_ENDPOINT, REGISTER_ENDPOINT, EMAIL_URL } from "../../config";
import { AuthContext } from "../context/AuthProvider";
import "./styles/Module.LoginRegister.css";
const URL = "https://navicominformatica.com";

// Función para decodificar el token JWT (solo la parte del payload)
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);
  const [nameError, setNameError] = useState(null);
  const [apellidoError, setApellidoError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [promesaError, setPromesaError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const resetErrors = () => {
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setNameError(null);
    setApellidoError(null);
    setPromesaError(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validation.isValidEmail(email)) {
      setEmailError("Por favor, introduce un formato de email válido.");
      return;
    } else {
      setEmailError(null);
    }

    if (!isLogin && !validation.isValidPassword(password)) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.");
      return;
    } else {
      setPasswordError(null);
    }

    if (!isLogin && password !== confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden.");
      return;
    } else {
      setConfirmPasswordError(null);
    }

    if (!isLogin && name.trim().length < 2) {
      setNameError("El nombre debe tener al menos 3 caracteres.");
      return;
    } else {
      setNameError(null);
    }

    if (!isLogin && apellido.trim().length < 2) {
      setApellidoError("El apellido debe tener al menos 3 caracteres.");
      return;
    } else {
      setApellidoError(null);
    }

    const userData = {
      email: email,
      password: password,
    };

    if (!isLogin) {
      userData.id = 0;
      userData.name = name;
      userData.apellido = apellido;
    }

    const endpoint = isLogin ? LOGIN_ENDPOINT : REGISTER_ENDPOINT;
    fetchingData(endpoint, userData);
  };

  function resetForm() {
    setName("");
    setApellido("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRememberMe(false);
  }

  async function fetchingData(url, userData) {
    try {
      setIsLoading(true);
      const formData = new FormData();

      if (isLogin) {
        formData.append("Email", userData.email);
        formData.append("Password", userData.password);
      } else {
        formData.append("Nombre", userData.name);
        formData.append("Apellidos", userData.apellido);
        formData.append("Email", userData.email);
        formData.append("Password", userData.password);
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { accept: "*/*" },
        body: formData,
      });

      if (response.ok) {
        const datosPromesa = await response.json();
        if (isLogin) {
          const token = datosPromesa.accessToken;
          

          // Decodificar el token para obtener el rol
          const decodedToken = parseJwt(token);

          // Extraer el rol de forma flexible
          let role = decodedToken?.role || decodedToken?.Role || decodedToken?.rol;

          if (!role) {
            console.error("No se encontró el claim del rol en el token.");
            setPromesaError("No se pudo determinar el rol del usuario.");
            return;
          }

          // Guardar el rol y el token en localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('role', role);

          login(token, rememberMe);
          
          // Redirigir según el rol
          if (role.toLowerCase() === 'admin') {
            navigate("/admin-panel");
          } else {
            navigate("/Perfil");
          }
        } else {
          fetch(EMAIL_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              para: userData.email,
              asunto: "Bienvenido a Navicom Informática",
              contenido: `<!DOCTYPE html><html lang=\"es\"><head><meta charset=\"UTF-8\" /><style>body {font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;} .container {background-color: #ffffff; border: 1px solid #dddddd; padding: 30px; max-width: 600px; margin: auto; border-radius: 8px;} .header {background-color: #0157CA; color: white; padding: 20px; text-align: center; border-radius: 6px 6px 0 0;} .content {margin-top: 20px; color: #333333;} .button {display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #6CAAF1; color: white; text-decoration: none; border-radius: 4px;} .footer {margin-top: 30px; font-size: 12px; color: #888888; text-align: center;}</style></head><body><div class=\"container\"><div class=\"header\"><h1>¡Bienvenido a Nuestra Tienda!</h1></div><div class=\"content\"><p>Hola ${userData.name},</p><p>Gracias por registrarte en nuestra tienda. Estamos felices de tenerte a bordo.</p><p>¡Explora nuestros productos y disfruta de tu experiencia de compra!</p><a class=\"button\" href=\"${URL}\">Ir a la tienda</a></div><div class=\"footer\">&copy; 2025 NavicomInformática. Todos los derechos reservados.</div></div></body></html>`
            })
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Error al enviar el correo');
            }
            return response.json();
          })
          .then(data => {
          })
          .catch(error => {
            console.error('Error:', error);
          });

          console.log("Registro exitoso");
          setIsLogin(true);
        }
        setPromesaError(null);
        resetForm();
      } else {
        const errorData = await response.text();
        setPromesaError(`${errorData || "Desconocido"}`);
      }
    } catch (error) {
      console.error(error);
      setPromesaError(`${error}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container">
      <h2 className="LR-title">{isLogin ? "Iniciar Sesión" : "Registrarse"}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {nameError && <p className="error">{nameError}</p>}

            <input
              type="text"
              placeholder="Apellidos"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
            />
            {apellidoError && <p className="error">{apellidoError}</p>}
          </>
        )}

        <input
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {emailError && <p className="error">{emailError}</p>}

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {passwordError && <p className="error">{passwordError}</p>}

        {!isLogin && (
          <>
            <input
              type="password"
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {confirmPasswordError && <p className="error">{confirmPasswordError}</p>}
          </>
        )}

        {promesaError && <p className="server_error">{promesaError}</p>}

        {isLogin && (
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            Mantener sesión iniciada
          </label>
        )}

        <button type="submit" className="primary-button" disabled={isLoading}>
          {isLoading ? "Cargando..." : isLogin ? "Iniciar Sesión" : "Registrarse"}
        </button>

        {isLogin ? <><p className="cuenta">¿No tienes cuenta?</p></> : <><p className="cuenta">¿Ya tienes cuenta?</p></>}{" "}
        <button
          className="primary-button"
          onClick={() => {
            setIsLogin(!isLogin);
            resetErrors();
          }}
        >
          {isLogin ? "Regístrate" : "Iniciar Sesión"}
        </button>
      </form>

      
    </div>
  );
}

export default LoginRegister;