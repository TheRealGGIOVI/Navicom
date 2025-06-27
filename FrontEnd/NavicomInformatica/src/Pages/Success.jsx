// src/Pages/SuccessPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import { STRIPE_SUCCESS, MAKE_ORDER, EMAIL_URL } from "../../config";
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
          Items: json.items.map(item => ({
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

        const { amountTotal, currency, customerEmail, items } = json;
        fetch(EMAIL_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            para: customerEmail,
            asunto: "Confirmación de compra - Navicom Informática",
            contenido: `<!DOCTYPE html>
              <html lang="es">
              <head>
                <meta charset="UTF-8" />
                <style>
                  :root {
                    --primary: #0157CA;
                    --secondary: #6CAAF1;
                  }
                  body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
                  .container {
                    background-color: #fff;
                    border: 1px solid #ddd;
                    padding: 30px;
                    max-width: 600px;
                    margin: auto;
                    border-radius: 8px;
                  }
                  .header {
                    background-color: var(--primary);
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 6px 6px 0 0;
                  }
                  .content {
                    margin-top: 20px;
                    color: #333;
                  }
                  .item {
                    display: flex;
                    align-items: center;
                    padding: 10px 0;
                    border-bottom: 1px solid #eee;
                  }
                  .item:last-child {
                    border-bottom: none;
                  }
                  .item img {
                    width: 60px;
                    height: 60px;
                    object-fit: cover;
                    margin-right: 15px;
                    border-radius: 6px;
                    border: 1px solid #ddd;
                  }
                  .item-info {
                    flex: 1;
                  }
                  .item-name {
                    font-weight: bold;
                    color: var(--primary);
                    margin-bottom: 4px;
                  }
                  .item-details {
                    font-size: 14px;
                    color: #555;
                  }
                  .total {
                    margin-top: 20px;
                    font-size: 18px;
                    font-weight: bold;
                    color: var(--primary);
                    text-align: right;
                  }
                  .footer {
                    margin-top: 30px;
                    font-size: 12px;
                    color: #888;
                    text-align: center;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>¡Gracias por tu compra!</h1>
                  </div>
                  <div class="content">
                    <p>Hola ${user?.name || "cliente"},</p>
                    <p>Hemos recibido tu pedido correctamente. Aquí tienes un resumen:</p>

                    ${items.map(item => `
                      <div class="item">
                        <img src="${item.imageUrl}" alt="${item.productName}" />
                        <div class="item-info">
                          <div class="item-name">${item.productName}</div>
                          <div class="item-details">${item.quantity} × ${(item.unitAmount / 100).toFixed(2)} ${currency.toUpperCase()}</div>
                        </div>
                      </div>
                    `).join('')}

                    <div class="total">
                      Total pagado: ${(amountTotal / 100).toFixed(2)} ${currency.toUpperCase()}
                    </div>

                    <p style="margin-top: 20px;">
                      En breve recibirás tu pedido. Gracias por confiar en <strong style="color: var(--secondary)">Navicom Informática</strong>.
                    </p>
                  </div>
                  <div class="footer">
                    &copy; 2025 Navicom Informática. Todos los derechos reservados.
                  </div>
                </div>
              </body>
              </html>`
          })
        });
        


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
