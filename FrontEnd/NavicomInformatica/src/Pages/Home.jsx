import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../Componentes/Card";
import { PRODUCTOS_ENDPOINT } from "../../config";
import "./styles/Module.Home.css";

function Home() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch(PRODUCTOS_ENDPOINT, {
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
            // Ordenamos los productos por ID de forma descendente y tomamos los primeros 10
            const latestProducts = data.items
                .sort((a, b) => b.id - a.id) // Orden descendente por ID
                .slice(0, 10); // Tomamos los primeros 10
            setProducts(latestProducts);
        })
        .catch(error => console.error("Error al obtener los productos:", error));
    }, []);

    return (
        <div className="home-container">
            {/* Sección de Bienvenida */}
            <section className="welcome-section">
                <div className="text-box">
                    <h1>Bienvenido a Navicom Informática</h1>
                    <p>Tu tienda de confianza para soluciones informáticas en Coín, Málaga.</p>
                </div>
            </section>
            
            {/* Sección de Novedades */}
            <section className="products-section">
                <div className="text-box">
                    <h2>Novedades</h2> {/* Cambiamos el título a "Novedades" */}
                </div>
                <div className="products-grid">
                    {products.length > 0 ? (
                        <>
                            {/* Primer grupo: primeros 8 productos */}
                            <div className="products-grid-main">
                                {products.slice(0, 8).map(product => (
                                    <Card
                                        key={product.id}
                                        id={product.id}
                                        brand={product.brand}
                                        model={product.model}
                                        precio={product.precio}
                                        img_name={product.img_name}
                                        stock={product.stock}
                                    />
                                ))}
                            </div>
                            {/* Segundo grupo: últimos 2 productos */}
                            <div className="products-grid-highlight">
                                {products.slice(8, 10).map(product => (
                                    <Card
                                        key={product.id}
                                        id={product.id}
                                        brand={product.brand}
                                        model={product.model}
                                        precio={product.precio}
                                        img_name={product.img_name}
                                        stock={product.stock}
                                    />
                                ))}
                            </div>
                        </>
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
    );
}

export default Home;