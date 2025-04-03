import Header from "../Componentes/Header";
import Footer from "../Componentes/Footer";
import "./styles/Module.SobreNosotros.css";

function SobreNosotros() {
    return (
        <>
            <div className="main-content">
                {/* Sección Introductoria */}
                <section className="intro-section">
                    <div className="text-box">
                        <p>
                            Navicom Informática es una empresa de servicio de mantenimiento preventivo, correctivo y reparación de ordenadores, creada para brindar soporte técnico en mantenimiento, asesorías y reparación de ordenadores, con servicios de calidad y asegurando la satisfacción del usuario. También prestamos el servicio de venta de ordenadores, partes, accesorios y establecimiento de redes locales e intranets.
                        </p>
                    </div>
                    <div className="button-box">
                        <a href="/contacto" className="contact-button">Contáctanos</a>
                    </div>
                </section>

                {/* Sección de Valores y Misión */}
                <section className="values-mission-section">
                    <div className="columns">
                        {/* Columna de Valores */}
                        <div className="column">
                            <div className="text-box">
                                <h3>Valores</h3>
                                <p>Clientes satisfechos. Personal comprometido con el trabajo. Seguridad y privacidad total. Calidad en todos los servicios. Actitud emprendedora y responsable.</p>
                            </div>
                        </div>
                        {/* Columna de Misión */}
                        <div className="column">
                            <div className="text-box">
                                <h3>Misión</h3>
                                <p>Satisfacer las necesidades de nuestros clientes a través de un servicio excelente y cumplimiento rápido, eficaz y de confianza. Navicom Informática se comprometa a preservar la privacidad e integridad de los datos de sus clientes.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección de Visión */}
                <section className="vision-section">
                    <div className="text-box">
                        <h3>Visión</h3>
                        <p>Navicom Informática es una empresa de mantenimiento preventivo, correctivo y reparación de ordenadores que quiere crecer en el mercado para ser una de las mejores, con altos índices de calidad y servicio al cliente.</p>
                    </div>
                </section>
            </div>
        </>
    );
}

export default SobreNosotros;