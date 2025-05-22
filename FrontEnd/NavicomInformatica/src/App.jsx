import './global.css';
import { Route, Routes } from 'react-router-dom';
import Home from './Pages/Home';
import LoginRegister from './Pages/LoginRegister';
import Perfil from './Pages/Perfil';
import BigLayout from './utils/BigLayout';
import SobreNosotros from './Pages/SobreNosotros';
import Contacto from './Pages/Contacto';
import ProductoDetalle from './Pages/ProductoDetalle';
import Catalogo from './Pages/Catalogo';
import Carrito from './Pages/Carrito';
import AdminPanel from './Pages/AdminPanel';  

console.log("🔥 API BASE URL:", import.meta.env.VITE_API_BASE_URL);


function App() {
  return (
    <Routes>
      <Route path="/" element={<BigLayout />}>
        <Route index element={<Home />} />
        <Route path="InicioSesion" element={<LoginRegister />} />
        <Route path="Perfil" element={<Perfil />} />
        <Route path="sobre-nosotros" element={<SobreNosotros />} />
        <Route path="Contacto" element={<Contacto />} />
        <Route path="producto/:id" element={<ProductoDetalle />} />
        <Route path="catalogo" element={<Catalogo />} />
        <Route path="Carrito" element={<Carrito />} />
        <Route path="admin-panel" element={<AdminPanel />} /> 
        <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
      </Route>
    </Routes>
  );
}

export default App;