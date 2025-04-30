import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import Usuario from "../img/icons8-usuario-30 - copia.png";
import UsuarioHover from "../img/icons8-usuario-30.png";
import Carrito from "../img/carrito.png";
import "./styles/Module.Navbar.css";

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [hover, setHover] = useState(false);


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
            <Link to="/sobre-nosotros" onClick={() => setIsOpen(false)}>
              Sobre Nosotros
            </Link>
          </li>
        </ul>

        <div className="profile" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          
          <Link to={user ? "/Perfil" : "/InicioSesion"} onClick={() => setIsOpen(false)}>
            <img src={hover ? UsuarioHover : Usuario} alt="Perfil de usuario" className="user-icon" />
            <p>{user ? "Ver Perfil" : "Inicio Sesión"}</p>
          </Link>
        </div>
        <div className="carrito">
          <Link to="/Carrito" onClick={() => setIsOpen(false)}>
          <img src={Carrito} alt="Carrito" className="cart-icon" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;