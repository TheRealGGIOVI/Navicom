import { Link } from "react-router-dom"; // Importamos Link para manejar las rutas
import Navbar from "./Navbar";
import Logo from "../img/Logo.jpg";
import "./styles/Module.Header.css";

const Header = () => {
  // Lista de enlaces para pasar al Navbar
  const navLinks = [
    { name: "Servicios", path: "/servicios" },
    { name: "Contacto", path: "/contacto" },
    { name: "Sobre Nosotros", path: "/sobre-nosotros" },
  ];

  return (
    <header className="header">
      <div className="header-left">
        <img src={Logo} alt="Logo" className="logo" />
        <h1 className="site-title">Navicom Informática</h1>
      </div>
      <Navbar links={navLinks} />
    </header>
  );
};

export default Header;