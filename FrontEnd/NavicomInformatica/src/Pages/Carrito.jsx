import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import { USER_CART, UPDATE_QUANTITY_ENDPOINT, DELETE_PRODUCT_CART_ENDPOINT, BASE_IMAGE_URL, STRIPE} from "../../config";

import { loadStripe } from "@stripe/stripe-js";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);


import "./styles/Module.Carrito.css";


const getTempCart = () => {
  const cart = localStorage.getItem("tempCart");
  return cart ? JSON.parse(cart) : [];
};

const saveTempCart = (cart) => {
  localStorage.setItem("tempCart", JSON.stringify(cart));
};

function Carrito() {
  const [cart, setCart] = useState(getTempCart());
  const [total, setTotal] = useState(0);
  const { user } = useContext(AuthContext);
  const { updateCartCount } = useContext(CartContext);

  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        try {
          const res = await fetch(`${USER_CART}${user.Id}`);
          const data = await res.json();
          setCart(data.cartProducts);
          setTotal(data.totalPrice);
        } catch (err) {
          console.error("Error backend carrito:", err);
        }
      } else {
        const localCart = getTempCart();
        setCart(localCart);
      }
    };
  
    fetchCart();
  }, [user]);

  useEffect(() => {
    if (!user) {
      let totalPrice = 0;
      cart.forEach((item) => {
        totalPrice += item.cantidad * item.precio;
      });
      setTotal(totalPrice);
      saveTempCart(cart);
    }
  }, [cart, user]);

  const removeFromCart = async (productId) => {
    if (user) {
      try {
        const res = await fetch(`${DELETE_PRODUCT_CART_ENDPOINT}${user.Id}/${productId}`, {
          method: "DELETE",
          headers: {
            "Accept": "*/*"
          }
        });
  
        if (!res.ok) {
          throw new Error("Error al eliminar el producto del carrito");
        }

        const response = await fetch(`${USER_CART}${user.Id}`);
        const data = await response.json();
        setCart(data.cartProducts);
        setTotal(data.totalPrice);
  
      } catch (error) {
        console.error("Error al eliminar del carrito:", error);
      }
    }else{
      setCart(cart.filter((item) => item.productoId !== productId));
    }
    updateCartCount();
  };

  const incrementQuantity = (productId) => {
    setCart(cart.map((item) =>
      item.productoId === productId
        ? item.cantidad < item.stock
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
        : item
    ));
    updateCartCount();
  };
  

  const decrementQuantity = (productId) => {
    setCart(cart.map((item) =>
      item.productoId === productId && item.cantidad > 1
        ? { ...item, cantidad: item.cantidad - 1 }
        : item
    ));
    updateCartCount();
  };
  
  const updateQuantity = async (productId, newCantidad) => {
    const item = cart.find((p) => p.productId === productId);
  
    if (!item || newCantidad < 1 || newCantidad > item.productStock) return;
  
    try {
      const res = await fetch(UPDATE_QUANTITY_ENDPOINT, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "*/*"
        },
        body: JSON.stringify({
          carritoId: user.Id,
          productoId: productId,
          cantidad: newCantidad,
        }),
      });
  
      if (!res.ok) throw new Error("Error actualizando cantidad");

      const updatedRes = await fetch(`${USER_CART}${user.Id}`);
      const updatedData = await updatedRes.json();
      setCart(updatedData.cartProducts);
      setTotal(updatedData.totalPrice);
  
    } catch (err) {
      console.error("Error al actualizar cantidad:", err);
    }
    updateCartCount();
  };

  function reemplazarEspaciosPorGuionBajo(brand, model) {
    const modelConGuiones = model.replace(/ /g, "_");
    const urlCompleta = `${BASE_IMAGE_URL}${brand}_${modelConGuiones}_1.jpg`;
    return urlCompleta
  }

  const handleCheckout = async () => {
    if (!cart.length) return;

    const items = cart.map(p => ({
      productName: `${p.productBrand} ${p.productModel}`,
      description: p.productDescription,
      imageUrl: reemplazarEspaciosPorGuionBajo(p.productBrand, p.productModel),
      quantity: p.quantity,
      unitAmountCents: Math.round(p.productPrice * 100)
    }));

    try {
      const r = await fetch(STRIPE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
      });
      const { sessionId } = await r.json();
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      console.error("Error Stripe:", err);
    }
  };

  return (
    <div className="carrito-container">
      <h1 className="carrito-title">Carrito de Compras</h1>
    
      {user ? (
        // CARRITO DEL BACKEND
        cart?.length === 0 ? (
          <>
            <div className="empty-cart-message">
              <h2>Carrito vacío</h2>
              <p>Puedes navegar por nuestra tienda y añadir productos.</p>
              <Link to="/catalogo">
                <button className="go-to-catalog-button">Ir al catálogo</button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.productId} className="cart-item">
                  <img
                    src={`${BASE_IMAGE_URL}HP_EliteBook_840_G4_1.jpg`}
                    alt={item.productModel}
                    className="cart-item-image"
                  />

                  <div className="cart-item-details">
                    <h2>{item.productBrand} {item.productModel}</h2>
                    <p>{item.productDescription}</p>
                    <p><strong>Precio:</strong> {item.productPrice} €</p>
                    <p><strong>Stock disponible:</strong> {item.productStock}</p>
                    <div className="cart-actions">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                      <span className="cantidad">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= item.productStock}>+</button>
                      <button className="btn-remove" onClick={() => removeFromCart(item.productId)}>Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <p><strong>Total:</strong> {total.toFixed(2)} €</p>
              <button onClick={handleCheckout}>Proceder al pago</button>
            </div>
          </>
        )
      ) : (
        // CARRITO LOCAL
        cart.length === 0 ? (
          <>
            <div className="empty-cart-message">
              <h2>Carrito vacío</h2>
              <p>Puedes navegar por nuestra tienda y añadir productos.</p>
              <Link to="/catalogo">
                <button className="go-to-catalog-button">Ir al catálogo</button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.productoId} className="cart-item">
                  <img src={reemplazarEspaciosPorGuionBajo(item.brand, item.model)} alt={item.model} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h2>{item.brand} {item.model}</h2>
                    <p>{item.description}</p>
                    <p><strong>Precio:</strong> {item.precio} €</p>
                    <p><strong>Stock disponible:</strong> {item.stock}</p>
                    <div className="cart-actions">
                      <button onClick={() => decrementQuantity(item.productoId)}>-</button>
                      <span className="cantidad">{item.cantidad}</span>
                      <button onClick={() => incrementQuantity(item.productoId)}>+</button>
                      <button className="btn-remove" onClick={() => removeFromCart(item.productoId)}>Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
  
            <div className="cart-summary">
              <p><strong>Total:</strong> {total.toFixed(2)} €</p>
              <Link to="/InicioSesion">
                <button>Proceder al pago</button>
              </Link>
              
            </div>
          </>
        )
      )}
    </div>
  );
}

export default Carrito;