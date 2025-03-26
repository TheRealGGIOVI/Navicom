import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import Usuario from "../img/usuario.png"

const Navbar = () => {
  const {user} = useContext(AuthContext);

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-900 text-white">
      <ul className="flex gap-6">
        <li>
          <Link to="/">Inicio</Link>
        </li>
        <li>
          <Link to="/sobre-nosotros">Sobre Nosotros</Link>
        </li>
      </ul>

      <div className="flex items-center gap-4">
        <Link to={user ? "/Perfil" : "/InicioSesion"}>
          <img src={Usuario} alt="Perfil" className="w-8 h-8" />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;