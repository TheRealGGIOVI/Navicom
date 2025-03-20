import { useState } from "react";
import { validation } from "../utils/validationForm"; 
import { LOGIN_ENDPOINT } from "../../config";
import { jwtDecode } from "jwt-decode";



function Login(){

    // const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [isLoading, setIsLoading] = useState(null);
    const [promesaError, setPromesaError] = useState(null);

    const handleSubmit = (event) => {
        event.preventDefault();
        
        const emailValue = email;
        if (!validation.isValidEmail(emailValue)) {
            setEmailError("Por favor, introduce un formato de email válido.");
            return;
        } else {
            setEmailError(null);
        }

        const passwordValue = password;
        if (!validation.isValidPassword(passwordValue)) {
            setPasswordError(
                "La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales."
            );
            return;
        } else {
            setPasswordError(null);
        }

        const objetoBackend = {
            identificador: emailValue,
            password: passwordValue
        };

        fetchingData(LOGIN_ENDPOINT, objetoBackend);
        reseteoForm();
    }

    function reseteoForm() {
        setEmail("");
        setPassword("");
    }

    async function fetchingData(url, data) {
        try{
            setIsLoading(true);
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const datosPromesa = await response.json();
                const token = datosPromesa.accessToken;
                const decodedToken = jwtDecode(token);
                console.log("Funciona el login");

                if (decodedToken) {
                    const userInfo = {
                        id: decodedToken.Id,
                        name: decodedToken.Name,
                        email: decodedToken.Email,
                        rol: decodedToken.Rol
                    };
                    // login(userInfo, token);
                    
                }

                setPromesaError(null);
            } else {
                setPromesaError("error server");
            }
        } catch (error) {
            console.log(error);
            setPromesaError(`error server ${error}`);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container">
          <h2>Iniciar Sesión</h2>
          <form onSubmit={handleSubmit}>
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
            <button type="submit">Iniciar Sesión</button>
          </form>
        </div>
    );
}

export default Login;