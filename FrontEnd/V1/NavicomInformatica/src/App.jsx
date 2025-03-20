import './App.css'
import Home from "./Pages/Home";
import Login from "./Pages/Login"
import { Route, Routes } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="/login" element={<Login />}/>
    </Routes>
  );
}

export default App;

