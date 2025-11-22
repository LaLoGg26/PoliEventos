import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getEventos } from "../services/eventoService";
import Footer from "../components/Footer";

// ⭐️ Imports del Carrusel
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function HomePage() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        const data = await getEventos();
        setEventos(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los eventos.");
      } finally {
        setLoading(false);
      }
    };
    cargarEventos();
  }, []);

  // Filtrado
  const eventosFiltrados = eventos.filter(
    (e) =>
      e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.lugar.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ⭐️ Tomar los primeros 5 eventos para el Carrusel (Destacados)
  const eventosDestacados = eventos.slice(0, 5);

  // ⭐️ Configuración del Carrusel
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false, // Quitamos flechas laterales para diseño más limpio
  };

  return (
    <div style={styles.pageContainer}>
      {/* 1. CARRUSEL HERO SECTION */}
      <div style={styles.carouselWrapper}>
        {loading ? (
          <div style={styles.loadingBanner}>Cargando cartelera...</div>
        ) : (
          <Slider {...settings}>
            {eventosDestacados.map((evento) => (
              <div key={evento.id}>
                <div style={styles.slideContainer}>
                  {/* Imagen de Fondo con degradado */}
                  <div
                    style={{
                      ...styles.slideBackground,
                      backgroundImage: evento.imagen_url
                        ? `url(${evento.imagen_url})`
                        : "none",
                      backgroundColor: evento.imagen_url
                        ? "transparent"
                        : "#4a00e0", // Color si no hay imagen
                    }}
                  >
                    <div style={styles.slideOverlay}>
                      <h1 style={styles.slideTitle}>{evento.nombre}</h1>
                      <p style={styles.slideSubtitle}>
                        📅 {new Date(evento.fecha).toLocaleDateString()} • 📍{" "}
                        {evento.lugar}
                      </p>
                      <Link to={`/evento/${evento.id}`}>
                        <button style={styles.heroButton}>
                          Conseguir Boletos
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        )}
      </div>

      {/* 2. CONTENIDO PRINCIPAL */}
      <div style={styles.contentWrapper}>
        {/* Barra de Búsqueda */}
        <div style={styles.searchSection}>
          <input
            type="text"
            placeholder="🔍 Busca por artista o lugar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {error && (
          <h3 style={{ color: "red", textAlign: "center" }}>{error}</h3>
        )}

        <h2 style={styles.sectionTitle}>Cartelera Completa</h2>

        <div style={styles.grid}>
          {eventosFiltrados.map((evento) => (
            <div key={evento.id} style={styles.card}>
              {/* Miniatura de tarjeta */}
              <div
                style={{
                  height: "150px",
                  backgroundColor: "#ddd",
                  backgroundImage: evento.imagen_url
                    ? `url(${evento.imagen_url})`
                    : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {!evento.imagen_url && <div style={styles.noImage}>🎟️</div>}
              </div>

              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{evento.nombre}</h3>
                <p style={styles.cardInfo}>📍 {evento.lugar}</p>
                <p style={styles.cardInfo}>
                  🗓️ {new Date(evento.fecha).toLocaleDateString()}
                </p>

                <Link
                  to={`/evento/${evento.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <button style={styles.cardButton}>Ver Boletos</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

const styles = {
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#f8f9fa",
  },

  // --- Estilos del Carrusel ---
  carouselWrapper: {
    width: "100%",
    marginBottom: "40px",
    backgroundColor: "#000", // Fondo negro para evitar flash blanco
  },
  loadingBanner: {
    height: "400px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    background: "#333",
  },
  slideContainer: {
    height: "450px", // Altura del banner
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  slideBackground: {
    width: "100%",
    height: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  slideOverlay: {
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.5)", // Oscurecer imagen para leer texto
    backdropFilter: "blur(2px)", // Efecto borroso ligero
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    textAlign: "center",
    padding: "20px",
  },
  slideTitle: {
    fontSize: "3.5rem",
    fontWeight: "bold",
    marginBottom: "10px",
    textShadow: "2px 2px 10px rgba(0,0,0,0.7)",
    maxWidth: "900px",
    lineHeight: 1.1,
  },
  slideSubtitle: {
    fontSize: "1.3rem",
    marginBottom: "25px",
    textShadow: "1px 1px 5px rgba(0,0,0,0.8)",
  },
  heroButton: {
    padding: "12px 30px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "white",
    backgroundColor: "#E11D48", // Color llamativo (Rosa/Rojo)
    border: "none",
    borderRadius: "50px",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(225, 29, 72, 0.4)",
    transition: "transform 0.2s",
  },

  // --- Resto del contenido ---
  contentWrapper: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
    width: "100%",
    boxSizing: "border-box",
    flex: 1,
  },
  searchSection: {
    display: "flex",
    justifyContent: "center",
    marginTop: "-65px", // Para que se monte sobre el banner
    marginBottom: "40px",
    position: "relative",
    zIndex: 10,
  },
  searchInput: {
    width: "100%",
    maxWidth: "600px",
    padding: "18px 30px",
    fontSize: "1.1rem",
    borderRadius: "50px",
    border: "none",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    outline: "none",
  },
  sectionTitle: {
    fontSize: "1.8rem",
    color: "#1f2937",
    marginBottom: "20px",
    fontWeight: "800",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "30px",
    marginBottom: "50px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    transition: "transform 0.2s",
    border: "1px solid #f3f4f6",
    display: "flex",
    flexDirection: "column",
  },
  cardContent: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  cardTitle: {
    margin: "0 0 10px 0",
    fontSize: "1.2rem",
    color: "#111",
    fontWeight: "bold",
  },
  cardInfo: { margin: "5px 0", color: "#6b7280", fontSize: "0.9rem" },
  cardButton: {
    marginTop: "auto",
    padding: "10px",
    backgroundColor: "#2563EB",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    width: "100%",
    fontWeight: "600",
  },
  noImage: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "3rem",
  },
};

export default HomePage;
