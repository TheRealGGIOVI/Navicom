import Header from "../Componentes/Header";
import Footer from "../Componentes/Footer";
import { Outlet } from "react-router-dom";
import "./styles/Module.BigLayout.css"; // Importa el CSS

export default function BigLayout() {
    return (
        <div className="big-layout-container">
            <Header />
            <div className="big-layout-content">
                <Outlet />
            </div>
            <Footer />
        </div>
    );
}