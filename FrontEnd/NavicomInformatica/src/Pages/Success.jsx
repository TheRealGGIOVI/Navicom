// src/Pages/SuccessPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import { STRIPE_SUCCESS, MAKE_ORDER } from "../../config";
import { AuthContext } from "../context/AuthProvider";
import { CartContext } from "../context/CartContext";
import "./styles/Module.Success.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SuccessPage() {
  const query = useQuery();
  const sessionId = query.get("session_id");

  const { user, authLoading } = useContext(AuthContext);
  const { setCartCount, updateCartCount } = useContext(CartContext);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId || authLoading || !user || !user.Id) return;

    const procesarPago = async () => {
      try {
        // 1. Obtener datos de Stripe
        const res = await fetch(STRIPE_SUCCESS + sessionId);
        if (!res.ok) throw new Error("Error al obtener datos de Stripe.");
        const json = await res.json();
        setData(json);

        // const body = {
        //   SessionId: sessionId,
        //   UserId: user.Id.toString()
        // };
        const body = {
          SessionId: sessionId,
          UserId: user.Id.toString(),
          Items: items.map(item => ({
            Nombre: item.productName,
            PrecioUnitario: item.unitAmount / 100,
            Cantidad: item.quantity
          }))
        };

        const createOrderRes = await fetch(MAKE_ORDER, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!createOrderRes.ok) {
          throw new Error("Error al crear la orden en backend.");
        }

        await createOrderRes.json();

        setCartCount(0);
        updateCartCount();

      } catch (err) {
        console.error("Error en SuccessPage:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    procesarPago();
  }, [sessionId, authLoading, user]);

  if (loading || authLoading) return <div className="sp-container">Cargando pedido…</div>;
  if (error) return <div className="sp-container sp-error">Error: {error}</div>;

  const { amountTotal, currency, customerEmail, items } = data;

  return (
    <div className="sp-container">
      <h1>✅ ¡Pago confirmado!</h1>
      <p>
        <strong>Total:</strong> {(amountTotal / 100).toFixed(2)} {currency.toUpperCase()}
      </p>
      <p><strong>Email:</strong> {customerEmail}</p>

      <h2>Productos:</h2>
      <ul className="sp-items">
        {items.map(item => (
          <li key={item.id} className="sp-item">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.productName}
                className="sp-item-img"
              />
            )}
            <div className="sp-item-details">
              <p className="sp-item-name">{item.productName}</p>
              <p className="sp-item-desc">{item.description}</p>
              <p className="sp-item-info">
                {item.quantity} × {(item.unitAmount / 100).toFixed(2)}{" "}
                {item.currency.toUpperCase()}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <Link to="/" className="sp-button">Volver al inicio</Link>
    </div>
  );
}
