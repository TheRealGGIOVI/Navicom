import { useState, useEffect } from "react";
import { LIST_OF_PRODUCTS_ENDPOINT, SEARCH_PRODUCTS_ENDPOINT } from "../../config";
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
      let body = { page, limit };

      // Si hay filtros, usamos SearchProducts
      if (searchText || sortBy || category) {
        url = SEARCH_PRODUCTS_ENDPOINT;
        body = { searchText, sortBy, category, page, limit };
      }

      console.log("Haciendo solicitud a:", url, "con cuerpo:", body);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error en la solicitud a la API: ${response.status} - ${errorText}`);
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
      setError(`No se pudieron cargar los productos: ${error.message}`);
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
      <div>
        {loading ? (
          <p>Cargando productos...</p>
        ) : products.length === 0 ? (
          <p>No se encontraron productos.</p>
        ) : (
          products.map((p) => (
            <div className="product-item" key={p.id}>
              {p.brand} {p.model} - ${p.precio}
            </div>
          ))
        )}
      </div>
      <button onClick={() => setPage(page - 1)} disabled={page === 1 || loading}>
        Anterior
      </button>
      <span>Página {page} de {totalPages}</span>
      <button onClick={() => setPage(page + 1)} disabled={page === totalPages || loading}>
        Siguiente
      </button>
    </div>
  );
}

export default Catalogo;  