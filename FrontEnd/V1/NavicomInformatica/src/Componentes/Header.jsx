import Navbar from "./Navbar";
import Logo from "../img/Logo.jpg";
import "./styles/Module.Header.css";

const Header = () => {
  return (
    <header className="header">

      <div className="header-left">
        <img src={Logo} alt="Logo" className="logo" />
        <h1 className="site-title">Navicom Infórmatica</h1>
      </div>
      <Navbar />
    </header>
  );
};

export default Header;

