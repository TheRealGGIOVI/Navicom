import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import { CartContext } from "../context/CartContext"
import Usuario from "../img/icono-negro.png";
// import UsuarioHover from "../img/icons8-usuario-30.png";
import Carrito from "../img/carrito_negro.png";
import "./styles/Module.Navbar.css";

const Navbar = () => {
  const { user, token } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const { cartCount } = useContext(CartContext)

  // Obtener el role desde el user
  const role = user?.role;

  return (
    <nav className="navbar">
     <div className="navbar-container">  
        <button
          className="menu-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        >
          ☰
        </button>
        <ul className={`nav-links ${isOpen ? "open" : ""}`}>
          <li>
            <Link to="/" onClick={() => setIsOpen(false)}>
              Inicio
            </Link>
          </li>
          <li>
            <Link to="/catalogo" onClick={() => setIsOpen(false)}>
              Catálogo
            </Link>
          </li>
          <li>
            <Link to="/contacto" onClick={() => setIsOpen(false)}>
              Contacto
            </Link>
          </li>
          {token && role && role.toLowerCase() === 'admin' && (
            <li>
              <Link to="/admin-panel"  onClick={() => setIsOpen(false)}>
                Panel de Admin
              </Link>
            </li>
          )}
        </ul>

        <div className="profile" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          <Link to={user ? "/Perfil" : "/InicioSesion"} onClick={() => setIsOpen(false)}>
            {/* <img src={hover ? UsuarioHover : Usuario} alt="Perfil de usuario" className="user-icon" /> */}
            <img src={Usuario} alt="Perfil de usuario" className="user-icon" />
            <p>{user ? "Ver Perfil" : "Iniciar Sesión"}</p>
          </Link>
        </div>
        <div className="carrito">
          <Link to="/Carrito" onClick={() => setIsOpen(false)}>
          <img src={Carrito} alt="Carrito" className="cart-icon" /><span className="cart-number">{cartCount}</span>
          </Link>
        </div>
      </div>  
    </nav>
  );
};

export default Navbar;