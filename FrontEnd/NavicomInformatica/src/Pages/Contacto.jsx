import "./styles/Module.Contacto.css";

function Contacto() {
  return (
    <>
      <div className="main-content">
        {/* Título Principal */}
        <section className="title-section">
          <div className="text-box">
            <h1>Contáctanos</h1>
          </div>
        </section>

        {/* Sección de Información y Formulario */}
        <section className="info-form-section">
          <div className="columns">
            {/* Columna de Información */}
            <div className="column">
              <div className="text-box">
                <h2>¿Dónde estamos?</h2>
                <p>
                  <strong>Navicom está en Calle Buenavista 53, Coín, Málaga.</strong>
                </p>
                <p>
                  <strong>Puedes rellenar el formulario para preguntar una duda específica o llamar al número de abajo.</strong>
                </p>
                <p className="phone-number">Tel: 952-451-362</p>
              </div>
            </div>
            {/* Columna del Formulario */}
            <div className="column">
              <div className="form-box">
                <form className="contact-form">
                  <div className="form-group">
                    <label htmlFor="name">Nombre</label>
                    <input
                      type="text"
                      id="name"
                      name="your-name"
                      placeholder="Nombre"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Correo</label>
                    <input
                      type="email"
                      id="email"
                      name="your-email"
                      placeholder="Correo"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Tu mensaje aquí</label>
                    <textarea
                      id="message"
                      name="your-message"
                      placeholder="Tu mensaje aquí"
                      rows="5"
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <button type="submit" className="submit-button">
                      Enviar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Sección del Mapa */}
        <section className="map-section">
          <div className="map-box">
            <iframe
              loading="lazy"
              src="https://maps.google.com/maps?q=Navicom%2C%20Calle%20Buenavista%2C%2053%2C%2029100%20Co%C3%ADn%2C%20M%C3%A1laga&t=m&z=15&output=embed&iwloc=near"
              title="Navicom, Calle Buenavista, 53, 29100 Coín, Málaga"
              aria-label="Navicom, Calle Buenavista, 53, 29100 Coín, Málaga"
            ></iframe>
          </div>
        </section>
      </div>
    </>
  );
}

export default Contacto;