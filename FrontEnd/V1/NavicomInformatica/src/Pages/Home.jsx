import Header from "../Componentes/Header";
import Footer from "../Componentes/Footer";
import "./styles/Module.Home.css";

function Home() {
    return (
        <>
            <Header />
            <div className="main-content">
                {/* Sección de Bienvenida */}
                <section className="welcome-section">
                    <div className="section-box">
                        <div className="text-box">
                            <h1>Bienvenido a Navicom Informática</h1>
                            <p>Tu tienda de confianza para soluciones informáticas en Coín, Málaga.</p>
                        </div>
                    </div>
                </section>
                {/* Sección de Productos (Carrusel Placeholder) */}
                <section className="products-section">
                    <div className="section-box">
                        <div className="text-box">
                            <h2>Productos Destacados</h2>
                        </div>
                        <div className="products-carousel">
                            <div className="product-placeholder">Producto 1</div>
                            <div className="product-placeholder">Producto 2</div>
                            <div className="product-placeholder">Producto 3</div>
                            <div className="product-placeholder">Producto 4</div>
                        </div>
                    </div>
                </section>
                 {/* Sección de Ubicación */}
                 <section className="location-section">
                    <div className="text-box">
                        <h2>Encuéntranos</h2>
                        <p>Estamos ubicados en Calle Buenavista 53, Coín, Málaga.</p>
                    </div>
                    <div className="map-container">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3199.663427165395!2d-4.7577046846875!3d36.65969597997863!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72c5e5f9e8e8e3%3A0x5e8e8e3f9e8e8e3!2sCalle%20Buenavista%2C%2053%2C%2029100%20Co%C3%ADn%2C%20M%C3%A1laga%2C%20Spain!5e0!3m2!1sen!2sus!4v1698765432100!5m2!1sen!2sus"
                            width="100%"
                            height="400"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}

export default Home;