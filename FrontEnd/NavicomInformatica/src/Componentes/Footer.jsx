// Footer.jsx
import React from 'react';
import { FaFacebookF, FaInstagram } from 'react-icons/fa';
import './styles/Module.Footer.css';

const Footer = () => {
  return (
    <footer>
      <div className="footer-container">
        {/* Contacto */}
        <div className="footer-column contact">
          <h2>Contacto</h2>
          <p>952 451 362</p>
          <p>info@navicominformatica.com</p>
          <p>C. Buenavista, 53, 29100 Coín, Málaga</p>
        </div>

        {/* Información */}
        <div className="footer-column info">
          <h2>Información</h2>
          <ul>
            <li><a href="/terminos-de-uso">Términos de uso</a></li>
            <li><a href="/terminos-de-venta">Términos de venta</a></li>
            <li><a href="/aviso-legal">Aviso legal</a></li>
            <li><a href="/politica-privacidad">Política de privacidad y cookies</a></li>
            <li><a href="/configuracion-privacidad">Configuración de privacidad y cookies</a></li>
            <li><a href="/sobre-nosotros">Sobre Nosotros</a></li>
          </ul>
        </div>

        {/* Redes Sociales */}
        <div className="footer-column social-media">
          <h2>Redes Sociales</h2>
          <div className="social-icons">
            <a
              href="https://www.facebook.com/p/Navicom-Informatica-100071020142889/?locale=es_ES"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visita nuestro Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://www.instagram.com/navicominformatica_/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visita nuestro Instagram"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
