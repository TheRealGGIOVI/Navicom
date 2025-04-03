import Header from "../Componentes/Header";
import Footer from "../Componentes/Footer";
import { Outlet } from "react-router-dom";

export default function BigLayout() {
    return (
        <div>
            <Header />
            <Outlet />
            <Footer />
        </div>
    )
}