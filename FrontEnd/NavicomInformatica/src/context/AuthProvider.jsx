import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { getTempCart, clearTempCart } from "../utils/cartService";
import { MERGE_CART } from "../../config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const storedToken = sessionStorage.getItem("token") || localStorage.getItem("token");
        console.log("Token almacenado encontrado en AuthProvider:", storedToken);
        if (storedToken) {
            try {
                const decodedUser = jwtDecode(storedToken);
                console.log("Token decodificado en AuthProvider:", decodedUser);
                const role = decodedUser?.role || decodedUser?.Role || decodedUser?.rol || "user";
                console.log("Role extraído en AuthProvider:", role);
                setUser({ ...decodedUser, role });
                setToken(storedToken);
            } catch (error) {
                console.error("Error al decodificar el token:", error);
                sessionStorage.removeItem("token");
                localStorage.removeItem("token");
                setUser(null);
                setToken(null);
            }
        } else {
            console.log("No se encontró token en sessionStorage ni localStorage");
        }
    }, []);

    const login = async (token, rememberMe) => {
        const decodedUser = jwtDecode(token);
        console.log("Usuario decodificado en login:", decodedUser);
        const role = decodedUser?.role || decodedUser?.Role || decodedUser?.rol || "user";
        console.log("Role extraído en login:", role);
        setUser({ ...decodedUser, role });
        setToken(token);
        if (rememberMe) {
            localStorage.setItem("token", token);
        } else {
            sessionStorage.setItem("token", token);
        }

        const tempCart = getTempCart();
        if (tempCart.length > 0) {
            try {
                const response = await fetch(MERGE_CART, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "*/*",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        carritoId: decodedUser.Id,
                        productos: tempCart.map(item => ({
                            productoId: item.productoId,
                            cantidad: item.cantidad
                        }))
                    }),
                });

                if (!response.ok) {
                    throw new Error("Error al mergear carrito");
                }

                console.log("Carrito temporal mergeado correctamente");
                clearTempCart();
            } catch (err) {
                console.error("Fallo al mergear carrito:", err);
            }
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        sessionStorage.removeItem("token");
        localStorage.removeItem("token");
        console.log("Sesión cerrada en AuthProvider");
    };

    // Depuración del estado antes de pasar al contexto
    console.log("Estado actual en AuthProvider - User:", user);
    console.log("Estado actual en AuthProvider - Token:", token);

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};