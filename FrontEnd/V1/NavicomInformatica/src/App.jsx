import './global.css'
import Home from "./Pages/Home";
import LoginRegister from "./Pages/LoginRegister"
import { Route, Routes } from 'react-router-dom'
import BigLayout from './utils/BigLayout';
import SobreNosotros from './Pages/SobreNosotros';
import Contacto from './Pages/Contacto';

function App() {
  return (
    <Routes>
      <Route path="/" element={<BigLayout />}>
        <Route index element={<Home />} />
        <Route path="/InicioSesion" element={<LoginRegister />}/>
        <Route path="/sobre-nosotros" element={<SobreNosotros />}/>
        <Route path="/Contacto" element={<Contacto/>} />
        <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
      </Route>
    </Routes>
  );
}

export default App;

