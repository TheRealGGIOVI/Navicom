import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import Usuario from "../img/icons8-usuario-30.png";
import "./styles/Module.Navbar.css"; 

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>
        <ul className={`nav-links ${isOpen ? "open" : ""}`}>
          <li>
            <Link to="/" onClick={() => setIsOpen(false)}>Inicio</Link>
          </li>
          <li>
            <Link to="/sobre-nosotros" onClick={() => setIsOpen(false)}>Sobre Nosotros</Link>
          </li>
        </ul>
        
        <div className="profile">
          <Link to={user ? "/Perfil" : "/InicioSesion"}>
            <img src={Usuario} alt="Perfil" className="user-icon" />
            <p>{user ? "Perfil" : "Inicio Sesión"}</p>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
