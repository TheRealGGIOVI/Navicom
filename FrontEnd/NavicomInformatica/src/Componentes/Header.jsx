import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Logo from "../img/Logo.jpg";
import "./styles/Module.Header.css";

const Header = () => {
  
  

  return (
    <header className="header">
      <Link className="link-header" to="/">
      <div className="header-left">
        <img src={Logo} alt="Logo" className="logo" />
        <h1 className="site-title">Navicom Informática</h1>
      </div>
      </Link>
      <Navbar />
    </header>
  );
};

export default Header;