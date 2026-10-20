import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import "./styles/Module.Card.css"; 

function Card({ id, brand, model, precio, imagenes, stock }) {
  // Usamos la primera imagen de la lista, o una URL por defecto si no hay imágenes
  const imgUrl = imagenes && imagenes.length > 0 && imagenes[0]
    ? imagenes[0] 
    : "https://via.placeholder.com/320x240?text=Navicom";

  const numPrice = typeof precio === "number" ? precio : parseFloat(precio) || 0;
  const formattedPrice = numPrice.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const numStock = Number(stock ?? 0);
  const isAvailable = numStock > 0;

  return (
    <Link to={`/producto/${id}`} className="card-link" aria-label={`Ver producto ${brand} ${model}`}>
      <article className="card">
        <div className="card-img-container">
          <div className="card-badges">
            <span className="card-badge-brand">{brand || "Hardware"}</span>
            <span className={`card-badge-stock ${isAvailable ? "in-stock" : "out-of-stock"}`}>
              <span className="stock-dot"></span>
              {isAvailable ? `${numStock} en stock` : "Agotado"}
            </span>
          </div>
          <img 
            className="card-img" 
            src={imgUrl} 
            alt={`${brand} ${model}`} 
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/320x240?text=Navicom";
            }}
          />
        </div>

        <div className="card-info">
          <div className="card-info-top">
            <span className="card-brand-subtitle">{brand}</span>
            <h3 className="card-title" title={`${brand} ${model}`}>
              {model}
            </h3>
          </div>

          <div className="card-info-bottom">
            <div className="card-price-block">
              <span className="card-price-label">Precio</span>
              <div className="card-price-wrapper">
                <span className="card-price-amount">{formattedPrice}</span>
                <span className="card-price-currency">€</span>
              </div>
            </div>

            <div className="card-cta-btn">
              <span>Ver</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

Card.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  brand: PropTypes.string,
  model: PropTypes.string,
  precio: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  imagenes: PropTypes.arrayOf(PropTypes.string),
  stock: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

Card.defaultProps = {
  brand: "Navicom",
  model: "Producto",
  precio: 0,
  imagenes: [],
  stock: 0,
};

export default Card;