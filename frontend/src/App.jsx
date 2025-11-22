import { Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getEventos } from "./services/eventoService";
import EventDetailPage from "./pages/EventDetailPage";
import "./App.css";

// Componente para la lista de eventos (Homepage)
function HomePage() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        const data = await getEventos();
        setEventos(data);
        setError(null);
      } catch (err) {
        setError("Error al cargar los eventos. ¿Está el backend corriendo?");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargarEventos();
  }, []);

  if (loading) return <h1>Cargando Eventos...</h1>;
  if (error)
    return <h1 style={{ color: "red", textAlign: "center" }}>{error}</h1>;

  return (
    <div className="App" style={{ textAlign: "center" }}>
      <h1>🎟️ Eventos Disponibles</h1>
      <div
        className="eventos-list"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
          padding: "20px",
        }}
      >
        {eventos.map((evento) => (
          <div
            key={evento.id}
            className="card"
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              width: "300px",
              borderRadius: "8px",
              boxShadow: "2px 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <h2>{evento.nombre}</h2>
            <p>📍 {evento.lugar}</p>
            <p>🗓️ {new Date(evento.fecha).toLocaleString()}</p>

            <Link to={`/evento/${evento.id}`}>
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#007BFF",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                Ver Boletos
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente principal que define las rutas
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/evento/:id" element={<EventDetailPage />} />
      <Route
        path="*"
        element={
          <h1 style={{ textAlign: "center" }}>404 | Página no encontrada</h1>
        }
      />
    </Routes>
  );
}

export default App;
