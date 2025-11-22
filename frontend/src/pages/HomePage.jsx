import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getEventos } from "../services/eventoService";
import Footer from "../components/Footer";

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

  const eventosFiltrados = eventos.filter(
    (e) =>
      e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.lugar.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={styles.pageContainer}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Vive momentos inolvidables</h1>
      </div>
      <div style={styles.contentWrapper}>
        <div style={styles.searchSection}>
          <input
            type="text"
            placeholder="🔍 Busca por artista o lugar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        {loading && <h3>Cargando...</h3>}
        {error && <h3 style={{ color: "red" }}>{error}</h3>}
        <div style={styles.grid}>
          {eventosFiltrados.map((evento) => (
            <div key={evento.id} style={styles.card}>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{evento.nombre}</h3>
                <p>
                  📍 {evento.lugar} - 🗓️{" "}
                  {new Date(evento.fecha).toLocaleDateString()}
                </p>
                <Link to={`/evento/${evento.id}`}>
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
    backgroundColor: "#f4f4f4",
  },
  hero: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    height: "250px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },
  heroTitle: { fontSize: "2.5rem", textShadow: "2px 2px 4px rgba(0,0,0,0.3)" },
  contentWrapper: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
    width: "100%",
    boxSizing: "border-box", // 👈 ESTO EVITA DESBORDAMIENTOS LATERALES
    flex: 1,
  },
  searchSection: {
    display: "flex",
    justifyContent: "center",
    marginTop: "-30px",
    marginBottom: "40px",
  },
  searchInput: {
    width: "100%",
    maxWidth: "500px",
    padding: "15px",
    borderRadius: "30px",
    border: "none",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "30px",
    marginBottom: "50px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    padding: "20px",
  },
  cardButton: {
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
  },
};
export default HomePage;
