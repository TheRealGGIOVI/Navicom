import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { getTempCart, clearTempCart } from "../utils/cartService";
import { API_BASE_URL } from "../../config";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

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

    const login = async (token, rememberMe) => {
        const decodedUser = jwtDecode(token);
        console.log("Usuario decodificado:", decodedUser);
        setUser(decodedUser);
        setToken(token);
        if (rememberMe) {
            localStorage.setItem("token", token);
        } else {
            sessionStorage.setItem("token", token);
        }

        const tempCart = getTempCart();
        if (tempCart.length > 0) {
            console.log(JSON.stringify({
                carritoId: decodedUser.Id,
                productos: tempCart.map(item => ({
                    productoId: item.productoId,
                    cantidad: item.cantidad
                }))
            }));
            try {
                const response = await fetch(`${API_BASE_URL}/api/Carrito/MergeCart`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "*/*"
                    },
                    body: JSON.stringify({
                        carritoId: decodedUser.id,
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
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
