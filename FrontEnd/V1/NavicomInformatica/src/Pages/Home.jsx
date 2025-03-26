import Header from "../Componentes/Header";
import Footer from "../Componentes/Footer";

function Home(){
    return(
        <>
        <Header/>
        <div className="main-content">
                {/* Aquí va el contenido de la página */}
        </div>
        <Footer/>
        </>
    );
}

export default Home;