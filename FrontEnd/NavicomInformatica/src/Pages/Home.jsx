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
      const items = Array.isArray(data.items) ? data.items : [];
      const latestProducts = [...items]
        .sort((a, b) => {
          const bId = Number(b.id ?? b.Id ?? 0);
          const aId = Number(a.id ?? a.Id ?? 0);
          return bId - aId;
        })
        .slice(0, 10);
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
          <div className="home-novedades-grid">
            {products.length > 0 ? (
              products.map(prod => {
                const prodId = prod.id ?? prod.Id;
                const rawImages = prod.imagenes || prod.Imagenes || [];
                const imageUrls = rawImages.map(
                  i => typeof i === "string" ? `${BASE_IMAGE_URL}${i}` : `${BASE_IMAGE_URL}${i.img_Name || i.Img_Name || ""}`
                );
                return (
                  <Card
                    key={prodId}
                    id={prodId}
                    brand={prod.brand || prod.Brand || ""}
                    model={prod.model || prod.Model || ""}
                    precio={prod.precio || prod.Precio || 0}
                    imagenes={imageUrls}
                    stock={prod.stock || prod.Stock || 0}
                  />
                );
              })
            ) : (
              <p>Cargando novedades...</p>
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
