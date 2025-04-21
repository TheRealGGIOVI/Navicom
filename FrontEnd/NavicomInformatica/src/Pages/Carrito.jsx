import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import { API_BASE_URL } from "../../config";
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
  const { user, token } = useContext(AuthContext);
  const [cart, setCart] = useState(getTempCart()); // Carrito temporal o inicial
  const [total, setTotal] = useState(0); // Total del carrito
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener el carrito del backend si el usuario está autenticado
  useEffect(() => {
    const fetchCart = async () => {
      if (!user || !token) {
        // Si no hay usuario autenticado, usamos el carrito temporal
        setCart(getTempCart());
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/Carrito/GetCart/${user.id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "*/*"
          }
        });

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        // Mapear los datos del backend al formato esperado por el componente
        const formattedCart = data.cartProducts.map(item => ({
          productoId: item.productId,
          productoNombre: item.productName,
          precio: item.productPrice,
          imagenes: [{ img_name: item.productImage }], // Convertimos la imagen en una lista para consistencia
          cantidad: item.quantity
        }));
        setCart(formattedCart);
        saveTempCart(formattedCart); // Actualizamos el carrito temporal
      } catch (err) {
        setError(`Error al cargar el carrito: ${err.message}`);
        setCart(getTempCart()); // Si hay error, usamos el carrito temporal
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user, token]);

  // Actualizar el total cada vez que cambie el carrito
  useEffect(() => {
    let totalPrice = 0;
    cart.forEach((item) => {
      totalPrice += item.cantidad * item.precio;
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

  // Función para proceder al checkout
  const proceedToCheckout = () => {
    alert("Procediendo al checkout...");
    // Aquí puedes implementar tu lógica para proceder al pago o enviar el carrito al servidor.
  };

  return (
    <div className="carrito-container">
      <h1>Carrito de Compras</h1>

      {loading && <p>Cargando carrito...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {cart.length === 0 ? (
        <p>Tu carrito está vacío</p>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.productoId} className="cart-item">
                <div className="cart-item-image">
                  <img
                    src={item.imagenes && item.imagenes.length > 0 ? item.imagenes[0].img_name : "https://via.placeholder.com/150"}
                    alt={item.productoNombre}
                    style={{ width: "100px", height: "100px" }}
                  />
                </div>
                <div className="cart-item-details">
                  <h2>{item.productoNombre}</h2>
                  <p>Precio: {item.precio} €</p>
                  <div className="cart-item-quantity">
                    <span>Cantidad: {item.cantidad}</span>
                    <button onClick={() => incrementQuantity(item.productoId)}>+</button>
                    <button onClick={() => decrementQuantity(item.productoId)}>-</button>
                  </div>
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