import "./styles/Module.Home.css";

function Home() {
    return (
        <>
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
            </div>
        </>
    );
}

export default Home;