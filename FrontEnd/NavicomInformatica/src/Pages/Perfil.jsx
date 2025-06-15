import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthProvider";
import { Link } from "react-router-dom";
import {LIST_ORDERS, BASE_IMAGE_URL} from "../../config"
import "./styles/Module.Perfil.css";

const Perfil = () => {
    const { user, logout } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) return;

        fetch(LIST_ORDERS + user.Id)
            .then(res => {
                if (!res.ok) throw new Error("Error al cargar pedidos");
                return res.json();
            })
            .then(setOrders)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [user]);

    if (!user) {
        return <p className="error-message">No has iniciado sesión</p>;
    }

    return (
        <div className="perfil-container">
            <div className="perfil-card">
                <h2>Bienvenido, {user.Nombre}</h2>
                <p><strong>Email:</strong> {user.Email}</p>
                <p><strong>ID de usuario:</strong> {user.Id}</p>
                <Link to="/">
                    <button onClick={logout} className="logout-btn">
                        Cerrar sesión
                    </button>
                </Link>
            </div>

            <div className="pedidos-card">
                <h3>Historial de pedidos</h3>

                {loading && <p>Cargando pedidos...</p>}
                {error && <p className="error-message">{error}</p>}
                {!loading && orders.length === 0 && (
                    <p className="text-gray">No hay pedidos registrados.</p>
                )}

                {orders.map(order => (
                    <div key={order.orderId} className="pedido">
                        <p><strong>Pedido:</strong> {order.orderId}</p>
                        <p><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                        <p><strong>Total:</strong> {order.totalAmount.toFixed(2)} {order.currency.toUpperCase()}</p>
                        <div className="productos-pedido">
                            {order.items.map((item, i) => (
                                <div key={i} className="producto-pedido">
                                    {item.imageUrl && (
                                        <img src={BASE_IMAGE_URL + item.imageUrl} alt={item.productName} />
                                    )}
                                    <div>
                                        <p><strong>{item.productName}</strong></p>
                                        <p>{item.quantity} × {item.precioUnitario.toFixed(2)} €</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Perfil;
