import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../Componentes/Card";
import { LIST_OF_PRODUCTS_ENDPOINT, BASE_IMAGE_URL } from "../../config";
import "./styles/Module.Home.css";

function Home() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch(LIST_OF_PRODUCTS_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*"
            },
            body: JSON.stringify({ page: 1, limit: 30 }) // Pedimos más productos para tener variedad
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Ordenamos los productos por ID de forma descendente y tomamos los primeros 12
            const latestProducts = data.items
                .sort((a, b) => b.id - a.id) // Orden descendente por ID
                .slice(0, 12); // Tomamos los primeros 12
            setProducts(latestProducts);
        })
        .catch(error => console.error("Error al obtener los productos:", error));
    }, []);

    return (
        
        <>
        <section className="welcome-section">
            <div className="text-img">
                <h1>Bienvenido a Navicom Informática</h1>
                <p>Tu tienda de confianza para soluciones informáticas en Coín, Málaga.</p>
            </div>
        </section>
            
        <div className="home-container">
            <section className="products-section">
                <div className="text-box">
                    <h2>Novedades</h2>
                </div>
                <div className="products-grid">
                    {products.length > 0 ? (
                        products.map(product => {
                            // Construir las URLs completas para las imágenes
                            const imageUrls = product.imagenes.map(img => `${BASE_IMAGE_URL}${img.img_Name}`);
                            return (
                                <Card
                                    key={product.id}
                                    id={product.id}
                                    brand={product.brand}
                                    model={product.model}
                                    precio={product.precio}
                                    imagenes={imageUrls} // Pasamos el array de URLs completas
                                    stock={product.stock}
                                />
                            );
                        })
                    ) : (
                        <p>Cargando productos...</p>
                    )}
                </div>
                {/* Botón para mostrar más productos */}
                <div className="more-products-button">
                    <Link to="catalogo" className="more-products-link">
                        Mostrar más productos
                    </Link>
                </div>
            </section>
        </div>
        </>
    );
}

export default Home;