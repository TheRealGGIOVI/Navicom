import { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import { CartContext } from "../context/CartContext";
import {ADD_CART_ENDPOINT} from "../../config"
import {GET_PRODUCT_ENDPOINT} from "../../config"
import {BASE_IMAGE_URL} from "../../config"
import "./styles/Module.ProductoDetalle.css";

const TEMP_CART_KEY = "tempCart";

function ProductoDetalle() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { user, token } = useContext(AuthContext);
    const { updateCartCount } = useContext(CartContext);


    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`${GET_PRODUCT_ENDPOINT}${id}`, {
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

    const saveTempCart = (productos) => {
        localStorage.setItem(TEMP_CART_KEY, JSON.stringify(productos));
    };

    const getTempCart = () => {
        const data = localStorage.getItem(TEMP_CART_KEY);
        return data ? JSON.parse(data) : [];
    };

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

        // Usuario autenticado -> llamar al backend
        if (user) {
            try {
                const response = await fetch(ADD_CART_ENDPOINT, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        CarritoId: user.Id,
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
        } else {
            // Usuario no autenticado -> guardar en localStorage
            const tempCart = getTempCart();
            const index = tempCart.findIndex(p => p.productoId === productId);
            if (index !== -1) {
                tempCart[index].cantidad += cantidad;
            } else {
                tempCart.push({
                    productoId: productId,
                    cantidad,
                    brand: product.brand,
                    model: product.model,
                    precio: product.precio,
                    description: product.description,
                    imagenes: product.imagenes,
                    stock: product.stock
                    
                });
            }
            saveTempCart(tempCart);
            alert("Producto añadido al carrito temporal.");
        }
        updateCartCount();
    };

    if (loading) return <p>Cargando detalles del producto...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!product) return <p>Producto no encontrado.</p>;

    // Construir la URL completa para la imagen actual
    const currentImage = product.imagenes && product.imagenes.length > 0
        ? `${BASE_IMAGE_URL}${product.imagenes[currentImageIndex].img_Name}` // Usamos img_Name aquí
        : "https://via.placeholder.com/150";

    return (
        <div className="producto-detalle-container">
            <div className="producto-imagenes">
                <div className="carousel">
                    
                    <img
                        src={currentImage}
                        alt={`${product.brand} ${product.model}`}
                        className="product-image-large"
                    />
                   
                </div>
                <div className="thumbnails">
                    {product.imagenes && product.imagenes.map((img, index) => (
                        <img
                            key={index}
                            src={`${BASE_IMAGE_URL}${img.img_Name}`} 
                            alt={`Thumbnail ${index}`}
                            className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                            onClick={() => setCurrentImageIndex(index)}
                            style={{ width: "60px", height: "60px", margin: "0 5px", cursor: "pointer" }}
                        />
                    ))}
                </div>
            </div>
            <div className="producto-detalle-derecha">
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
                                const value = parseInt(e.target.value) || 1;
                                setCantidad(Math.max(1, Math.min(value, product.stock)));
                            }}
                            min="1"
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
        </div>
    );
}

export default ProductoDetalle;