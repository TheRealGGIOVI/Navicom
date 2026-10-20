import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthProvider";
import { USER_CART } from "../../config";
import { getTempCart } from "../utils/cartService";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [cartCount, setCartCount] = useState(0);

    const updateCartCount = async () => {
        if (user) {
            try {
                const userId = user.Id || user.id;
                const res = await fetch(`${USER_CART}${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    const list = data?.cartProducts || data?.CartProducts || [];
                    const count = list.reduce((sum, p) => sum + (p.quantity || p.Quantity || 0), 0);
                    setCartCount(count);
                } else {
                    setCartCount(0);
                }
            } catch (err) {
                console.error("Error actualizando cantidad del carrito:", err);
            }
        } else {
            const tempCart = getTempCart();
            const count = tempCart.reduce((sum, p) => sum + (p.cantidad || p.quantity || 0), 0);
            setCartCount(count);
        }
    };

    useEffect(() => {
        updateCartCount();
    }, [user]);

    return (
        <CartContext.Provider value={{ cartCount, setCartCount, updateCartCount }}>
            {children}
        </CartContext.Provider>
    );
};
