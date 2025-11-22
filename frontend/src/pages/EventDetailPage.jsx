import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getEventoById } from "../services/eventoService";

function EventDetailPage() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarEvento = async () => {
      try {
        const data = await getEventoById(id);
        setEvento(data);
        setError(null); // Limpiar cualquier error previo
      } catch (err) {
        // CORRECCIÓN: Usamos el parámetro 'err' para logging.
        setError("No se pudo cargar el evento o no existe.");
        console.error("Detalle del error:", err);
      } finally {
        setLoading(false);
      }
    };
    cargarEvento();
  }, [id]);

  if (loading) return <h1>Cargando detalles del evento...</h1>;
  if (error) return <h1 style={{ color: "red" }}>{error}</h1>;
  if (!evento) return <h1>Evento no encontrado.</h1>;

  // (El resto del JSX se mantiene igual...)
  return (
    <div className="event-detail" style={{ padding: "20px" }}>
      <Link to="/" style={{ display: "block", marginBottom: "20px" }}>
        ← Volver a la Lista de Eventos
      </Link>
      <h1>{evento.nombre}</h1>
      <p>
        📍 {evento.lugar} - 🗓️ {new Date(evento.fecha).toLocaleString()}
      </p>
      {/* ... Código para mostrar boletos ... */}
      <h2>Boletos Disponibles:</h2>
      {evento.boletos.map((boleto) => (
        <div
          key={boleto.id}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            margin: "10px 0",
            borderRadius: "5px",
          }}
        >
          <h3>{boleto.zona}</h3>
          <p>Precio: **${boleto.precio.toFixed(2)}**</p>
          <p>Disponibles: **{boleto.disponibles}**</p>
          <button
            disabled={boleto.disponibles <= 0}
            style={{
              padding: "8px 15px",
              cursor: "pointer",
              backgroundColor: boleto.disponibles > 0 ? "#4CAF50" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "3px",
            }}
          >
            {boleto.disponibles > 0 ? "Comprar" : "Agotado"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default EventDetailPage;
