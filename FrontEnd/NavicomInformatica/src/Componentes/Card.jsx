import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import "./styles/Module.Card.css"; 

function Card({ id, brand, model, precio, imagenes, stock }) {
    // Usamos la primera imagen de la lista, o una URL por defecto si no hay imágenes
    const imgUrl = imagenes && imagenes.length > 0 ? imagenes[0].img_name : "https://via.placeholder.com/150";

    return (
        <Link to={`/producto/${id}`} className="card-link">
            <div className="card">
                <div className="card-img-container">
                    <img className="card-img" src={imgUrl} alt={`${brand} ${model}`} />
                </div>
                <hr />
                <div className="card-info">
                    <div className="card-info-top">
                        <div className="card-naming">
                            <h3>{brand}</h3>
                            <p>{model}</p>
                        </div>
                    </div>
                    <div className="card-info-bottom">
                        <p className="card-stock">{stock} en stock</p>
                        <p className="card-price">{precio} €</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}

Card.propTypes = {
    id: PropTypes.number.isRequired,
    brand: PropTypes.string.isRequired,
    model: PropTypes.string.isRequired,
    precio: PropTypes.number.isRequired,
    imagenes: PropTypes.arrayOf(
        PropTypes.shape({
            img_name: PropTypes.string.isRequired
        })
    ).isRequired,
    stock: PropTypes.number.isRequired,
};

export default Card;