import { useState, useEffect } from "react";
import Card from "../Componentes/Card";
import {
  LIST_OF_PRODUCTS_ENDPOINT,
  SORT_BY_PRICE_ENDPOINT,
  SORT_ALPHABETICALLY_ENDPOINT,
  FILTER_BY_CATEGORY_ENDPOINT,
  SEARCH_BY_TEXT_ENDPOINT,
  BASE_IMAGE_URL
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

  // Añadimos un estado para evitar bucles infinitos
  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTrigger]); // Solo depende de fetchTrigger

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = LIST_OF_PRODUCTS_ENDPOINT;
      let body = { page: page.toString(), limit: limit.toString() };

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

  // Función para disparar la búsqueda manualmente
  const handleFetch = () => {
    setFetchTrigger(prev => prev + 1);
  };

  // Ajustamos los manejadores de eventos para usar handleFetch
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setPage(1);
    handleFetch();
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
    handleFetch();
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
    handleFetch();
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    handleFetch();
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
          onChange={handleSearchChange}
        />
        <select value={sortBy} onChange={handleSortChange}>
          <option value="">Ordenar por...</option>
          <option value="price-asc">Precio: Menor a Mayor</option>
          <option value="price-desc">Precio: Mayor a Menor</option>
          <option value="alpha-asc">Alfabético: A-Z</option>
          <option value="alpha-desc">Alfabético: Z-A</option>
        </select>
        <select value={category} onChange={handleCategoryChange}>
          <option value="">Todas las Categorías</option>
          <option value="Portatiles">Portátiles</option>
          <option value="Ordenadores">Ordenadores</option>
          <option value="Monitores">Monitores</option>
        </select>
      </div>
      <div className="products-grid">
        {loading ? (
          <p>Cargando productos...</p>
        ) : products.length === 0 ? (
          <p>No se encontraron productos.</p>
        ) : (
          products.map((p) => {
            // Construir las URLs completas para las imágenes
            const imageUrls = p.imagenes.map(img => `${BASE_IMAGE_URL}${img.img_Name}`);
            return (
              <Card
                key={p.id}
                id={p.id}
                brand={p.brand}
                model={p.model}
                precio={p.precio}
                imagenes={imageUrls}
                stock={p.stock}
              />
            );
          })
        )}
      </div>
      <div className="pagination">
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
          &#8592;
        </button>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map((num) => {
          if (
            num === 1 ||
            num === totalPages ||
            (num >= page - 1 && num <= page + 1)
          ) {
            return (
              <button
                key={num}
                onClick={() => handlePageChange(num)}
                className={page === num ? "active-page" : ""}
              >
                {num}
              </button>
            );
          } else if (
            (num === page - 2 && num > 1) ||
            (num === page + 2 && num < totalPages)
          ) {
            return (
              <span key={num} className="pagination-ellipsis">
                ...
              </span>
            );
          } else {
            return null;
          }
        })}

        <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
          &#8594;
        </button>
      </div>
    </div>
  );
}

export default Catalogo;