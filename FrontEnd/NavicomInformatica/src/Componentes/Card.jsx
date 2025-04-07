import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import "./styles/Module.Card.css"; 

function Card({ id, brand, model, precio, img_name, stock }) {
    return (
        <Link to={`/producto/${id}`} className="card-link">
            <div className="card">
                <div className="card-img-container">
                    <img className="card-img" src={img_name} alt={`${brand} ${model}`} />
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
    img_name: PropTypes.string.isRequired,
    stock: PropTypes.number.isRequired,
};

export default Card;