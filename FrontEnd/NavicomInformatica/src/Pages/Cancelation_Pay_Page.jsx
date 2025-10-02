import "./styles/Module.ErrorPage.css";
const ErrorPage = () => {
  return (
    <div className="error-page">
      <div className="error-container">
        <h1 className="error-code"></h1>
        <p className="error-message">Parece que algo ha ido mal, desea volver a intentarlo.</p>
        <a href="/Carrito" className="btn-home">Volver al carrito</a>
      </div>
    </div>
  );
};

export default ErrorPage;

