import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import { Link } from "react-router-dom";
import { USER_CART, ADD_CART_ENDPOINT, UPDATE_QUANTITY_ENDPOINT, DELETE_PRODUCT_CART_ENDPOINT } from "../../config";

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
  const [error, setError] = useState(null);
  const { user, token } = useContext(AuthContext);
  const BASE_IMAGE_URL = "[invalid url, do not cite]

  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        // Sincronizar el carrito local con el backend al iniciar sesión
        const localCart = getTempCart();
        if (localCart.length > 0) {
          try {
            for (const item of localCart) {
              await fetch(ADD_CART_ENDPOINT, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
                  "Accept": "*/*"
                },
                body: JSON.stringify({
                  CarritoId: user.Id,
                  ProductoId: item.productoId,
                  Cantidad: item.cantidad
                })
              });
            }
            saveTempCart([]);
          } catch (err) {
            console.error("Error al sincronizar el carrito local con el backend:", err);
            setError("Error al sincronizar el carrito. Por favor, intenta de nuevo.");
          }
        }

        // Obtener el carrito del backend
        try {
          const res = await fetch(`${USER_CART}${user.Id}`, {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Accept": "*/*"
            }
          });
          const data = await res.json();
          console.log("Datos del carrito del backend:", data);
          setCart(data.cartProducts || []);
          setTotal(data.totalPrice || 0);
        } catch (err) {
          console.error("Error backend carrito:", err);
          setCart([]);
          setTotal(0);
          setError("Error al cargar el carrito. Por favor, intenta de nuevo.");
        }
      } else {
        const localCart = getTempCart();
        // Normalizar los datos del carrito local al formato del backend
        const normalizedCart = localCart.map(item => ({
          productId: item.productoId,
          productBrand: item.brand,
          productModel: item.model,
          productDescription: item.description,
          productStock: item.stock,
          productPrice: item.precio,
          images: item.imagenes ? item.imagenes.map(img => ({ img_Name: img.replace(BASE_IMAGE_URL, "") })) : [],
          quantity: item.cantidad
        }));
        setCart(normalizedCart);
      }
    };

    fetchCart();
  }, [user, token]);

  useEffect(() => {
    if (!user) {
      let totalPrice = 0;
      cart.forEach((item) => {
        totalPrice += item.quantity * item.productPrice;
      });
      setTotal(totalPrice);
      // Guardar el carrito normalizado en localStorage
      const denormalizedCart = cart.map(item => ({
        productoId: item.productId,
        brand: item.productBrand,
        model: item.productModel,
        description: item.productDescription,
        stock: item.productStock,
        precio: item.productPrice,
        imagenes: item.images.map(img => `${BASE_IMAGE_URL}${img.img_Name}`),
        cantidad: item.quantity
      }));
      saveTempCart(denormalizedCart);
    }
  }, [cart, user]);

  const removeFromCart = async (productId) => {
    if (user) {
      try {
        const res = await fetch(`${DELETE_PRODUCT_CART_ENDPOINT}${user.Id}/${productId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "*/*"
          }
        });

        if (!res.ok) {
          throw new Error("Error al eliminar el producto del carrito");
        }

        const response = await fetch(`${USER_CART}${user.Id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "*/*"
          }
        });
        const data = await response.json();
        setCart(data.cartProducts || []);
        setTotal(data.totalPrice || 0);
      } catch (error) {
        console.error("Error al eliminar del carrito:", error);
        setError("Error al eliminar el producto. Por favor, intenta de nuevo.");
      }
    } else {
      setCart(cart.filter((item) => item.productId !== productId));
    }
  };

  const incrementQuantity = (productId) => {
    setCart(cart.map((item) =>
      item.productId === productId
        ? item.quantity < item.productStock
          ? { ...item, quantity: item.quantity + 1 }
          : item
        : item
    ));
  };

  const decrementQuantity = (productId) => {
    setCart(cart.map((item) =>
      item.productId === productId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    ));
  };

  const updateQuantity = async (productId, newCantidad) => {
    const item = cart.find((p) => p.productId === productId);

    if (!item || newCantidad < 1 || newCantidad > item.productStock) return;

    try {
      const res = await fetch(UPDATE_QUANTITY_ENDPOINT, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "*/*"
        },
        body: JSON.stringify({
          carritoId: user.Id,
          productoId: productId,
          cantidad: newCantidad,
        }),
      });

      if (!res.ok) throw new Error("Error actualizando cantidad");

      const updatedRes = await fetch(`${USER_CART}${user.Id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "*/*"
        }
      });
      const updatedData = await updatedRes.json();
      setCart(updatedData.cartProducts || []);
      setTotal(updatedData.totalPrice || 0);
    } catch (err) {
      console.error("Error al actualizar cantidad:", err);
      setError("Error al actualizar la cantidad. Por favor, intenta de nuevo.");
    }
  };

  // Si hay un error, mostrar un mensaje en lugar de intentar renderizar el carrito
  if (error) {
    return (
      <div className="carrito-container">
        <h1 className="carrito-title">Carrito de Compras</h1>
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Recargar página</button>
        </div>
      </div>
    );
  }

  return (
    <div className="carrito-container">
      <h1 className="carrito-title">Carrito de Compras</h1>
    
      {cart.length === 0 ? (
        <div className="empty-cart-message">
          <h2>Carrito vacío</h2>
          <p>Puedes navegar por nuestra tienda y añadir productos.</p>
          <Link to="/catalogo">
            <button className="go-to-catalog-button">Ir al catálogo</button>
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {Array.isArray(cart) && cart.map((item) => {
              const imageUrl = item.images && item.images.length > 0
                ? `${BASE_IMAGE_URL}${item.images[0].img_Name}`
                : null;
              return (
                <div key={item.productId} className="cart-item">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={`${item.productBrand} ${item.productModel}`}
                      className="cart-item-image"
                    />
                  ) : (
                    <div className="cart-item-image-placeholder">
                      Imagen no disponible
                    </div>
                  )}
                  <div className="cart-item-details">
                    <h2>{item.productBrand} {item.productModel}</h2>
                    <p>{item.productDescription}</p>
                    <p><strong>Precio:</strong> {item.productPrice} €</p>
                    <p><strong>Stock disponible:</strong> {item.productStock}</p>
                    <div className="cart-actions">
                      <button onClick={() => user ? updateQuantity(item.productId, item.quantity - 1) : decrementQuantity(item.productId)} disabled={item.quantity <= 1}>-</button>
                      <span className="cantidad">{item.quantity}</span>
                      <button onClick={() => user ? updateQuantity(item.productId, item.quantity + 1) : incrementQuantity(item.productId)} disabled={item.quantity >= item.productStock}>+</button>
                      <button className="btn-remove" onClick={() => removeFromCart(item.productId)}>Eliminar</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <p><strong>Total:</strong> {total.toFixed(2)} €</p>
            {user ? (
              <button onClick={() => console.log("Pago realizado")}>Proceder al pago</button>
            ) : (
              <Link to="/InicioSesion">
                <button>Proceder al pago</button>
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Carrito;