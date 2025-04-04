import { useState, useEffect } from "react";
import { PRODUCTOS_ENDPOINT } from "../../config";

function Home() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch(PRODUCTOS_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*"
            },
            body: JSON.stringify({})
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => setProducts(data.items))
        .catch(error => console.error("Error al obtener los productos:", error));
    }, []);

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
                
                {/* Sección de Productos */}
                <section className="products-section">
                    <div className="section-box">
                        <div className="text-box">
                            <h2>Productos Destacados</h2>
                        </div>
                        <div className="products-grid">
                            {products.length > 0 ? (
                                products.map(product => (
                                    <div key={product.id} className="product-card">
                                        <img src={product.img_name} alt={product.name} className="product-image" />
                                        <h3>{product.brand}</h3>
                                        <p>{product.model}</p>
                                        <p className="product-price">{product.precio} €</p>
                                    </div>
                                ))
                            ) : (
                                <p>Cargando productos...</p>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

export default Home;
