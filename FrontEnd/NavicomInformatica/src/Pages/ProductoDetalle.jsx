import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "./styles/Module.ProductoDetalle.css"; // Asegúrate de importar el CSS

function ProductoDetalle() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cantidad, setCantidad] = useState(0);

    const CARRITO_ENDPOINT = `${API_BASE_URL}/api/Carrito`;

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/Product/id?id=${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "*/*"
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const data = await response.json();
                setProduct(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const addToCart = async (productId) => {
        if (product.stock === 0) {
            alert("Este producto está agotado.");
            return;
        }

        if (cantidad === 0) {
            alert("Debe seleccionar al menos 1 unidad para añadir al carrito.");
            return;
        }

        if (cantidad > product.stock) {
            alert(`Solo hay ${product.stock} unidades disponibles.`);
            return;
        }

        const cartId = 1;

        try {
            const response = await fetch(`${CARRITO_ENDPOINT}/AddToCart`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*"
                },
                body: JSON.stringify({
                    CarritoId: cartId,
                    ProductoId: productId,
                    Cantidad: cantidad
                })
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            alert(data.message);
        } catch (err) {
            console.error("Error al añadir al carrito:", err);
            alert("Error al añadir al carrito");
        }
    };

    if (loading) {
        return <p>Cargando detalles del producto...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (!product) {
        return <p>Producto no encontrado.</p>;
    }

    return (
        <div className="producto-detalle-container">
            <div className="producto-imagenes">
                <img src={product.img_name} alt={product.model} className="product-image-large" />
            </div>
            <div className="producto-info">
                <h1>{product.brand} {product.model}</h1>
                <p className="descripcion">{product.description || "Descripción no disponible"}</p>
                <p><strong>Precio:</strong> {product.precio} €</p>
                <p><strong>Stock disponible:</strong> {product.stock}</p>
            </div>
            <div className="producto-acciones">
                <div className="cantidad-seleccion">
                    <label htmlFor="cantidad">Cantidad:</label>
                    <input
                        type="number"
                        id="cantidad"
                        value={cantidad}
                        onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            setCantidad(Math.max(0, Math.min(value, product.stock)));
                        }}
                        min="0"
                        max={product.stock}
                    />
                </div>
                <button
                    onClick={() => addToCart(product.id)}
                    disabled={product.stock === 0}
                >
                    Añadir al Carrito
                </button>
                {product.stock === 0 && (
                    <p className="agotado">Este producto está agotado.</p>
                )}
            </div>
        </div>
    );
}

export default ProductoDetalle;