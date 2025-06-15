// src/Pages/SuccessPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import {STRIPE_SUCCESS, MAKE_ORDER} from "../../config"
import { AuthProvider } from "../context/AuthProvider";
import "./styles/Module.Success.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SuccessPage() {
  const query = useQuery();
  const sessionId = query.get("session_id");
  const { user } = useContext(AuthProvider);
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Falta el parámetro session_id en la URL.");
      setLoading(false);
      return;
    }

    // 1. Confirmar datos desde Stripe
    fetch(STRIPE_SUCCESS + sessionId)
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(json => {
        setData(json);

        // 2. Hacer la orden en backend (solo si hay usuario)
        if (user?.id) {
          fetch(MAKE_ORDER, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: sessionId,
              userId: user.id.toString()
            })
          })
            .then(res => {
              if (!res.ok) throw new Error("Error al crear la orden.");
              return res.json();
            })
            .then(() => setOrderSuccess(true))
            .catch(err => console.error("Error creando la orden:", err));
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId, user]);
  
  if (loading) return <div className="sp-container">Cargando pedido…</div>;
  if (error)   return <div className="sp-container sp-error">Error: {error}</div>;

  // Aquí usamos camelCase, que es como viene en el JSON
  const { amountTotal, currency, customerEmail, items } = data;

  return (
    <div className="sp-container">
      <h1>✅ ¡Pago confirmado!</h1>
      <p>
        <strong>Total:</strong> {(amountTotal / 100).toFixed(2)}{" "}
        {currency.toUpperCase()}
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
