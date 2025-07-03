import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../Componentes/Card";
import { LIST_OF_PRODUCTS_ENDPOINT, BASE_IMAGE_URL } from "../../config";
import "./styles/Module.Home.css";

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
  const formData = new FormData();
  formData.append("page", "1");
  formData.append("limit", "30");
  formData.append("isActive", "true"); // 👈 opcional pero recomendado

  fetch(LIST_OF_PRODUCTS_ENDPOINT, {
    method: "POST",
    body: formData, // 👈 no pongas headers
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const latestProducts = data.items
        .sort((a, b) => b.id - a.id)
        .slice(0, 12);
      setProducts(latestProducts);
    })
    .catch(error => console.error("Error al obtener los productos:", error));
}, []);


  return (
    <>
      <section className="welcome-section">
        <div className="hero-text">
          <h1>Bienvenido a Navicom Informática</h1>
          <p>Tu tienda de confianza para soluciones informáticas en Coín, Málaga.</p>
        </div>
      </section>

      <div className="home-container">
        <section className="products-section">
          <div className="section-header">
            <h2>Novedades</h2>
          </div>
          <div className="products-grid">
            {products.length > 0 ? (
              products.map(prod => {
                const imageUrls = prod.imagenes.map(
                  i => `${BASE_IMAGE_URL}${i.img_Name}`
                );
                return (
                  <Card
                    key={prod.id}
                    id={prod.id}
                    brand={prod.brand}
                    model={prod.model}
                    precio={prod.precio}
                    imagenes={imageUrls}
                    stock={prod.stock}
                  />
                );
              })
            ) : (
              <p>Cargando productos...</p>
            )}
          </div>
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
