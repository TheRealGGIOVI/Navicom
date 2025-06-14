// src/Pages/SuccessPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import "./styles/Module.Success.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SuccessPage() {
  const query = useQuery();
  const sessionId = query.get("session_id");
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Falta el parámetro session_id en la URL.");
      setLoading(false);
      return;
    }

    fetch(`http://52.54.146.10:7069/api/checkout/success?sessionId=${sessionId}`)
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(json => setData(json))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

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
          <li key={item.id}>
            {item.quantity}× {item.productName}
          </li>
        ))}
      </ul>

      <Link to="/" className="sp-button">Volver al inicio</Link>
    </div>
  );
}
