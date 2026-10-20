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
  const limit = 12; // 4 cards x 3 filas = 12 productos por página

  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchTrigger]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = LIST_OF_PRODUCTS_ENDPOINT;
      let body = {
        page: page.toString(),
        limit: limit.toString(),
        isActive: "true"
      };

      if (searchText) {
        url = SEARCH_BY_TEXT_ENDPOINT;
        body = {
          searchText,
          page: page.toString(),
          limit: limit.toString(),
          isActive: "true"
        };
      } else if (category) {
        url = FILTER_BY_CATEGORY_ENDPOINT;
        body = {
          category,
          page: page.toString(),
          limit: limit.toString(),
          isActive: "true"
        };
      } else if (sortBy === "alpha-asc" || sortBy === "alpha-desc") {
        url = SORT_ALPHABETICALLY_ENDPOINT;
        body = {
          sortOrder: sortBy === "alpha-asc" ? "asc" : "desc",
          page: page.toString(),
          limit: limit.toString(),
          isActive: "true"
        };
      } else if (sortBy === "price-asc" || sortBy === "price-desc") {
        url = SORT_BY_PRICE_ENDPOINT;
        body = {
          sortOrder: sortBy === "price-asc" ? "asc" : "desc",
          page: page.toString(),
          limit: limit.toString(),
          isActive: "true"
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
        if (response.status === 404) {
          setProducts([]);
          setTotalPages(1);
          setError(null);
          return;
        }
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
        let items = [...data.items];
        if (sortBy) {
          items.sort((a, b) => {
            const priceA = a.precio ?? a.Precio ?? a.price ?? 0;
            const priceB = b.precio ?? b.Precio ?? b.price ?? 0;
            if (sortBy === "price-asc") return priceA - priceB;
            if (sortBy === "price-desc") return priceB - priceA;
            const nameA = `${a.brand || a.Brand || ""} ${a.model || a.Model || ""}`.trim().toLowerCase();
            const nameB = `${b.brand || b.Brand || ""} ${b.model || b.Model || ""}`.trim().toLowerCase();
            if (sortBy === "alpha-asc") return nameA.localeCompare(nameB);
            if (sortBy === "alpha-desc") return nameB.localeCompare(nameA);
            return 0;
          });
        }
        setProducts(items);
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

  const handleFetch = () => {
    setFetchTrigger(prev => prev + 1);
  };

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
    <div className="catalogo-page">
      {/* Hero Header Section */}
      <section className="catalogo-hero">
        <div className="catalogo-hero-content">
          <span className="catalogo-hero-badge">Hardware & Tecnología</span>
          <h1>Catálogo de Productos</h1>
          <p>
            Descubre nuestra gama de componentes, portátiles, ordenadores y periféricos de primeras marcas con la máxima garantía.
          </p>
        </div>
      </section>

      <div className="catalogo-container">
        {error && <div className="catalogo-error-alert">{error}</div>}

        {/* Filters Bar */}
        <div className="catalogo-filters">
          <div className="catalogo-search-wrapper">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Buscar por marca, modelo o palabra clave..."
              value={searchText}
              onChange={handleSearchChange}
            />
            {searchText && (
              <button 
                type="button" 
                className="clear-search-btn" 
                onClick={() => { setSearchText(""); setPage(1); handleFetch(); }}
                title="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>

          <div className="catalogo-selects-wrapper">
            <select value={sortBy} onChange={handleSortChange} aria-label="Ordenar productos">
              <option value="">Ordenar por relevancia</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="alpha-asc">Nombre: A - Z</option>
              <option value="alpha-desc">Nombre: Z - A</option>
            </select>

            <select value={category} onChange={handleCategoryChange} aria-label="Filtrar por categoría">
              <option value="">Todas las Categorías</option>
              <option value="Portatiles">Portátiles</option>
              <option value="Ordenadores">Ordenadores</option>
              <option value="Monitores">Monitores</option>
              <option value="Perifericos">Periféricos y Accesorios</option>
            </select>
          </div>
        </div>

        {/* Products Grid - 4 cards per row */}
        <div className="products-grid">
          {loading ? (
            <div className="catalogo-state-box">
              <div className="catalogo-spinner"></div>
              <p>Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="catalogo-state-box">
              <p className="empty-title">No se encontraron productos</p>
              <p className="empty-subtitle">Intenta buscar con otro término o elimina los filtros aplicados.</p>
            </div>
          ) : (
            products.map((p) => {
              const prodId = p.id ?? p.Id;
              const rawImages = p.imagenes || p.Imagenes || [];
              const imageUrls = rawImages.map(img =>
                typeof img === "string"
                  ? (img.startsWith("http") ? img : `${BASE_IMAGE_URL}${img}`)
                  : `${BASE_IMAGE_URL}${img.img_Name || img.Img_Name || ""}`
              );
              const prodPrice = p.precio ?? p.Precio ?? p.price ?? 0;
              const prodStock = p.stock ?? p.Stock ?? 0;
              const prodBrand = p.brand || p.Brand || "Navicom";
              const prodModel = p.model || p.Model || "Producto";

              return (
                <Card
                  key={prodId}
                  id={prodId}
                  brand={prodBrand}
                  model={prodModel}
                  precio={prodPrice}
                  imagenes={imageUrls}
                  stock={prodStock}
                />
              );
            })
          )}
        </div>

        {/* Modern Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(page - 1)} 
              disabled={page === 1}
              aria-label="Página anterior"
            >
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
                    aria-label={`Página ${num}`}
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

            <button 
              onClick={() => handlePageChange(page + 1)} 
              disabled={page === totalPages}
              aria-label="Página siguiente"
            >
              &#8594;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Catalogo;
