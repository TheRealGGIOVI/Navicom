const TEMP_CART_KEY = "tempCart";

export const getTempCart = () => {
    const stored = localStorage.getItem(TEMP_CART_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const addToTempCart = (productoId, cantidad) => {
    const cart = getTempCart();
    const existing = cart.find(p => p.productoId === productoId);

    if (existing) {
        existing.cantidad += cantidad;
    } else {
        cart.push({ productoId, cantidad });
    }

    localStorage.setItem(TEMP_CART_KEY, JSON.stringify(cart));
};

export const clearTempCart = () => {
    localStorage.removeItem(TEMP_CART_KEY);
};
