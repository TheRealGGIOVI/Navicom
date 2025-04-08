import { useState, useEffect } from "react";


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
      const response = await fetch("http://localhost:5000/api/Product/ListOfProducts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchText, sortBy, category, page, limit })
      });
      if (!response.ok) throw new Error("Error en la solicitud a la API");
      const data = await response.json();
      if (Array.isArray(data.items)) {
        setProducts(data.items);
        setTotalPages(data.totalPages || 1);
      } else {
        throw new Error("Datos inválidos recibidos de la API");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("No se pudieron cargar los productos. Intente más tarde.");
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
        onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
      />
      <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}>
        <option value="">Ordenar por...</option>
        <option value="price-asc">Precio: Menor a Mayor</option>
        <option value="price-desc">Precio: Mayor a Menor</option>
        <option value="alpha-asc">Alfabético: A-Z</option>
        <option value="alpha-desc">Alfabético: Z-A</option>
      </select>
      <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
        <option value="">Todas las Categorías</option>
        <option value="Laptops">Laptops</option>
        <option value="MiniPCs">MiniPCs</option>
        <option value="MonitorsAndAccessories">MonitorsAndAccessories</option>
      </select>
      <div>
        {loading ? (
          <p>Cargando productos...</p>
        ) : (
          products.map(p => (
            <div className="product-item" key={p.id}>{p.brand} {p.model} - ${p.precio}</div>
          ))
        )}
      </div>
      <button onClick={() => setPage(page - 1)} disabled={page === 1 || loading}>Anterior</button>
      <span>Página {page} de {totalPages}</span>
      <button onClick={() => setPage(page + 1)} disabled={page === totalPages || loading}>Siguiente</button>
    </div>
  );
}

export default Catalogo;