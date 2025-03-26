import React from 'react';
import './styles/Module.Footer.css';

const Footer = () => {
    return (
        <footer>
            <div className="footer-container">
                <div className="footer-column contact">
                    <h2>Contacto</h2>
                    <p>952 451 362</p>
                    <p>info@navicominformatica.com</p>
                    <p>C. Buenavista, 53, 29100 Coín, Málaga</p>
                </div>
                <div className="footer-column info">
                    <h2>Información</h2>
                    <ul>
                        <li><a href="/terminos-de-uso">Términos de uso</a></li>
                        <li><a href="/terminos-de-venta">Términos de venta</a></li>
                        <li><a href="/aviso-legal">Aviso legal</a></li>
                        <li><a href="/politica-privacidad">Política de privacidad y cookies</a></li>
                        <li><a href="/configuracion-privacidad">Configuración de privacidad y cookies</a></li>
                    </ul>
                </div>
                <div className="footer-column social-media">
                    <h2>Redes Sociales</h2>
                    <div>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;