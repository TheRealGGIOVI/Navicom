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
                const res = await fetch(`${USER_CART}${user.Id}`);
                const data = await res.json();
                const count = data.cartProducts.reduce((sum, p) => sum + p.quantity, 0);
                setCartCount(count);
            } catch (err) {
                console.error("Error actualizando cantidad del carrito:", err);
            }
        } else {
            const tempCart = getTempCart();
            const count = tempCart.reduce((sum, p) => sum + p.cantidad, 0);
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
