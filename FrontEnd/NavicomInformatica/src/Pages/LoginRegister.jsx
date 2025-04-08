import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { validation } from "../utils/validationForm";
import { LOGIN_ENDPOINT, REGISTER_ENDPOINT } from "../../config";
import { AuthContext } from "../context/AuthProvider";
import "./styles/Module.LoginRegister.css";

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

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validation.isValidEmail(email)) {
      setEmailError("Por favor, introduce un formato de email válido.");
      return;
    } else {
      setEmailError(null);
    }

    if (!validation.isValidPassword(password)) {
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
        formData.append("Id", userData.id);
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
          console.log("Inicio de sesión exitoso");
          login(token, rememberMe);
          console.log("Redirigiendo a /Perfil...");
          navigate("/Perfil");
        } else {
          console.log("Registro exitoso");
          setIsLogin(true);
        }
        setPromesaError(null);
        resetForm();
      } else {
        const errorData = await response.text();
        setPromesaError(`Error en el servidor: ${errorData || "Desconocido"}`);
      }
    } catch (error) {
      console.error(error);
      setPromesaError(`Error en el servidor: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container">
      <h2>{isLogin ? "Iniciar Sesión" : "Registrarse"}</h2>
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
            {nameError && <p>{nameError}</p>}

            <input
              type="text"
              placeholder="Apellidos"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
            />
            {apellidoError && <p>{apellidoError}</p>}
          </>
        )}

        <input
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {emailError && <p>{emailError}</p>}

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {passwordError && <p>{passwordError}</p>}

        {!isLogin && (
          <>
            <input
              type="password"
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {confirmPasswordError && <p>{confirmPasswordError}</p>}
          </>
        )}

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

        {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
        <button className="primary-button" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Regístrate" : "Inicia Sesión"}
        </button>
      </form>

      {promesaError && <p>{promesaError}</p>}
    </div>
  );
}

export default LoginRegister;