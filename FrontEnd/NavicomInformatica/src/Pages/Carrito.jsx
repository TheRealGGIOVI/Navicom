import React, { useState, useEffect } from "react";
import "./styles/Module.Carrito.css";

// Función para obtener el carrito temporal desde localStorage
const getTempCart = () => {
  const cart = localStorage.getItem("tempCart");
  return cart ? JSON.parse(cart) : [];
};

// Función para guardar el carrito temporal en localStorage
const saveTempCart = (cart) => {
  localStorage.setItem("tempCart", JSON.stringify(cart));
};

function Carrito() {
  const [cart, setCart] = useState(getTempCart()); // Carrito actual
  const [total, setTotal] = useState(0); // Total del carrito

  // Actualizar el total cada vez que cambie el carrito
  useEffect(() => {
    let totalPrice = 0;
    cart.forEach((item) => {
      totalPrice += item.cantidad * item.precio; // Suponiendo que cada producto tiene un precio
    });
    setTotal(totalPrice);
    saveTempCart(cart); // Guardar carrito en localStorage
  }, [cart]);

  // Eliminar producto del carrito
  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.productoId !== productId));
  };

  // Incrementar cantidad
  const incrementQuantity = (productId) => {
    setCart(cart.map((item) =>
      item.productoId === productId
        ? { ...item, cantidad: item.cantidad + 1 }
        : item
    ));
  };

  // Decrementar cantidad
  const decrementQuantity = (productId) => {
    setCart(cart.map((item) =>
      item.productoId === productId && item.cantidad > 1
        ? { ...item, cantidad: item.cantidad - 1 }
        : item
    ));
  };

  // Función para proceder al checkout (puedes adaptarlo para tu lógica de pago)
  const proceedToCheckout = () => {
    alert("Procediendo al checkout...");
    // Aquí puedes implementar tu lógica para proceder al pago o enviar el carrito al servidor.
  };

  return (
    <div className="carrito-container">
      <h1>Carrito de Compras</h1>

      {cart.length === 0 ? (
        <p>Tu carrito está vacío</p>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.productoId} className="cart-item">
                <div>
                  <h2>{item.productoNombre}</h2>
                  <p>Precio: {item.precio} €</p>
                </div>
                <div>
                  <span>Cantidad: {item.cantidad}</span>
                  <button onClick={() => incrementQuantity(item.productoId)}>+</button>
                  <button onClick={() => decrementQuantity(item.productoId)}>-</button>
                  <button onClick={() => removeFromCart(item.productoId)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <p><strong>Total:</strong> {total.toFixed(2)} €</p>
            <button onClick={proceedToCheckout}>Proceder al pago</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Carrito;