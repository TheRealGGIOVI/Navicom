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
                  --bg: #f9f9f9;
                }

                body {
                  font-family: 'Segoe UI', sans-serif;
                  background-color: var(--bg);
                  padding: 20px;
                  margin: 0;
                }

                .container {
                  max-width: 600px;
                  margin: auto;
                  background: #fff;
                  border-radius: 10px;
                  overflow: hidden;
                  box-shadow: 0 0 10px rgba(0,0,0,0.05);
                }

                .header {
                  background-color: var(--primary);
                  padding: 25px;
                  text-align: center;
                  color: white;
                }

                .header h1 {
                  margin: 0;
                  font-size: 24px;
                }

                .content {
                  padding: 30px 25px;
                  color: #333;
                }

                .content p {
                  margin: 10px 0;
                  line-height: 1.5;
                }

                .items {
                  margin-top: 25px;
                }

                .item {
                  display: flex;
                  align-items: center;
                  margin-bottom: 20px;
                  padding-bottom: 15px;
                  border-bottom: 1px solid #eee;
                }

                .item img {
                  width: 70px;
                  height: 70px;
                  object-fit: cover;
                  border-radius: 8px;
                  border: 1px solid #ddd;
                  margin-right: 15px;
                }

                .item-info {
                  flex: 1;
                }

                .item-name {
                  font-weight: bold;
                  color: var(--primary);
                }

                .item-details {
                  font-size: 14px;
                  color: #666;
                  margin-top: 3px;
                }

                .total {
                  text-align: right;
                  font-size: 18px;
                  margin-top: 25px;
                  font-weight: bold;
                  color: var(--primary);
                }

                .footer {
                  text-align: center;
                  background: #f0f0f0;
                  font-size: 12px;
                  padding: 15px;
                  color: #666;
                  border-top: 1px solid #ddd;
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

                  <div class="items">
                    ${items.map(item => `
                      <div class="item">
                        <img src="${item.imageUrl}" alt="${item.productName}" />
                        <div class="item-info">
                          <div class="item-name">${item.productName}</div>
                          <div class="item-details">${item.quantity} × ${(item.unitAmount / 100).toFixed(2)} ${currency.toUpperCase()}</div>
                        </div>
                      </div>
                    `).join('')}
                  </div>

                  <div class="total">
                    Total pagado: ${(amountTotal / 100).toFixed(2)} ${currency.toUpperCase()}
                  </div>

                  <p style="margin-top: 30px;">
                    En breve recibirás tu pedido. Gracias por confiar en <strong style="color: var(--secondary);">Navicom Informática</strong>.
                  </p>
                </div>
                <div class="footer">
                  &copy; 2025 Navicom Informática. Todos los derechos reservados.
                </div>
              </div>
            </body>
            </html>
            `
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
