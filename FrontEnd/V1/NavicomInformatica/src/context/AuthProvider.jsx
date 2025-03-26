import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

// Crear el contexto de autenticación
export const AuthContext = createContext();

// Proveedor de autenticación
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    // Cargar el usuario si hay un token en localStorage
    useEffect(() => {
        const storedToken = sessionStorage.getItem("token") || localStorage.getItem("token");
        if (storedToken) {
            try {
                const decodedUser = jwtDecode(storedToken);
                setUser(decodedUser);
                setToken(storedToken);
            } catch (error) {
                console.error("Error al decodificar el token:", error);
                localStorage.removeItem("token");
            }
        }
    }, []);

    // Función para iniciar sesión
    const login = (token, rememberMe) => {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
        setToken(token);
        if (rememberMe) {
            localStorage.setItem("token", token);
        } else {
            sessionStorage.setItem("token", token);
        }
    };

    // Función para cerrar sesión
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
