import "./styles/Module.ErrorPage.css";
const ErrorPage = () => {
  return (
    <div className="error-page">
      <div className="error-container">
        <h1 className="error-code">404</h1>
        <p className="error-message">Lo sentimos, esta página no existe.</p>
        <a href="/" className="btn-home">Volver al inicio</a>
      </div>
    </div>
  );
};

export default ErrorPage;

