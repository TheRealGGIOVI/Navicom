import './App.css'
import Home from "./Pages/Home";
import LoginRegister from "./Pages/LoginRegister"
import { Route, Routes } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/InicioSesion" element={<LoginRegister />}/>
      <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
    </Routes>
  );
}

export default App;

