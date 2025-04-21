import { useState, useEffect } from "react";
import Card from "../Componentes/Card";
import {
  LIST_OF_PRODUCTS_ENDPOINT,
  SORT_BY_PRICE_ENDPOINT,
  SORT_ALPHABETICALLY_ENDPOINT,
  FILTER_BY_CATEGORY_ENDPOINT,
  SEARCH_BY_TEXT_ENDPOINT,
} from "../../config";
import "./styles/Module.Catalogo.css";

function Catalogo() {
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText, sortBy, category, page]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = LIST_OF_PRODUCTS_ENDPOINT;
      let body = { page: page.toString(), limit: limit.toString() };

      // Prioridad: búsqueda por texto > categoría > ordenamiento alfabético > ordenamiento por precio
      if (searchText) {
        url = SEARCH_BY_TEXT_ENDPOINT;
        body = { searchText, page: page.toString(), limit: limit.toString() };
      } else if (category) {
        url = FILTER_BY_CATEGORY_ENDPOINT;
        body = { category, page: page.toString(), limit: limit.toString() };
      } else if (sortBy === "alpha-asc" || sortBy === "alpha-desc") {
        url = SORT_ALPHABETICALLY_ENDPOINT;
        body = {
          sortOrder: sortBy === "alpha-asc" ? "asc" : "desc",
          page: page.toString(),
          limit: limit.toString(),
        };
      } else if (sortBy === "price-asc" || sortBy === "price-desc") {
        url = SORT_BY_PRICE_ENDPOINT;
        body = {
          sortOrder: sortBy === "price-asc" ? "asc" : "desc",
          page: page.toString(),
          limit: limit.toString(),
        };
      }

      console.log("Haciendo solicitud a:", url, "con cuerpo:", body);

      const formData = new FormData();
      Object.entries(body).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Error en la solicitud a la API: ${response.status}`;
        try {
          const errorDetails = JSON.parse(errorText);
          errorMessage += ` - ${errorDetails.title || errorText}`;
          if (errorDetails.errors) {
            errorMessage += ` (${Object.entries(errorDetails.errors)
              .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
              .join("; ")})`;
          }
        } catch (parseError) {
          errorMessage += ` - ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Respuesta recibida:", data);

      if (Array.isArray(data.items)) {
        setProducts(data.items);
        setTotalPages(data.totalPages || 1);
      } else {
        throw new Error("Datos inválidos recibidos de la API");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message);
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="catalogo-container">
      <h1>Catálogo</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="catalogo-filters">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setPage(1);
          }}
        />
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Ordenar por...</option>
          <option value="price-asc">Precio: Menor a Mayor</option>
          <option value="price-desc">Precio: Mayor a Menor</option>
          <option value="alpha-asc">Alfabético: A-Z</option>
          <option value="alpha-desc">Alfabético: Z-A</option>
        </select>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todas las Categorías</option>
          <option value="Laptops">Laptops</option>
          <option value="MiniPCs">MiniPCs</option>
          <option value="MonitorsAndAccessories">MonitorsAndAccessories</option>
        </select>
      </div>
      <div className="products-grid">
        {loading ? (
          <p>Cargando productos...</p>
        ) : products.length === 0 ? (
          <p>No se encontraron productos.</p>
        ) : (
          products.map((p) => (
            <Card
              key={p.id}
              id={p.id}
              brand={p.brand}
              model={p.model}
              precio={p.precio}
              imagenes={p.imagenes}
              stock={p.stock}
            />
          ))
        )}
      </div>
      <div className="pagination">
        <button onClick={() => setPage(page - 1)} disabled={page === 1 || loading}>
          Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button onClick={() => setPage(page + 1)} disabled={page === totalPages || loading}>
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default Catalogo;