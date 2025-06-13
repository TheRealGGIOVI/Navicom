import "./styles/Module.Contacto.css";
import { EMAIL_URL } from "../../config";
import { useState } from "react";
function Contacto() {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch(EMAIL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          para: "ventas.navicominformatica@gmail.com",
          asunto: form.subject,
          contenido: `
            Nombre: ${form.name}
            Apellidos: ${form.surname}
            Email: ${form.email}
            Teléfono: ${form.phone}
            Mensaje: ${form.message}
          `
        })
      });
      if (!res.ok) throw new Error("Error al enviar");
      setResult({ success: true, message: "¡Mensaje enviado!" });
      setForm({ name: "", surname: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setSending(false);
    }
  };
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
                <form className="contact-form" onSubmit={handleSubmit}>

                  {/* ——— Dos primeras filas en 2 columnas ——— */}
                  <div className="two-cols">
                    {/* Nombre */}
                    <div className="form-group">
                      <label htmlFor="name">Nombre</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Nombre"
                        required
                      />
                    </div>
                    {/* Apellidos */}
                    <div className="form-group">
                      <label htmlFor="surname">Apellidos</label>
                      <input
                        type="text"
                        id="surname"
                        name="surname"
                        value={form.surname}
                        onChange={handleChange}
                        placeholder="Apellidos"
                        required
                      />
                    </div>
                    {/* Email */}
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email"
                        required
                      />
                    </div>
                    {/* Teléfono (solo números) */}
                    <div className="form-group">
                      <label htmlFor="phone">Teléfono</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Teléfono"
                        pattern="[0-9]+"
                        inputMode="numeric"
                        required
                      />
                    </div>
                  </div>

                  {/* ——— Asunto (ancho completo) ——— */}
                  <div className="form-group form-group--full">
                    <label htmlFor="subject">Asunto</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="Asunto"
                      required
                    />
                  </div>

                  {/* ——— Mensaje (ancho completo) ——— */}
                  <div className="form-group form-group--full">
                    <label htmlFor="message">Mensaje</label>
                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tu mensaje aquí"
                      rows="5"
                      required
                    />
                  </div>

                  {/* ——— Botón (ancho completo) ——— */}
                  <div className="form-group form-group--full">
                    <button
                      type="submit"
                      className="submit-button"
                      disabled={sending}
                    >
                      {sending ? "Enviando…" : "Enviar"}
                    </button>
                  </div>

                  {/* ——— Feedback ——— */}
                  {result && (
                    <p className={result.success ? "success" : "error"}>
                      {result.message}
                    </p>
                  )}
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