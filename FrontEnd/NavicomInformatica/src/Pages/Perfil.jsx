import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import "./styles/Module.Perfil.css";
import { Link } from "react-router-dom";

const Perfil = () => {
    const { user, logout } = useContext(AuthContext);

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
                <p className="text-gray">Aquí aparecerán tus pedidos recientes.</p>
            </div>
        </div>
    );
};

export default Perfil;
