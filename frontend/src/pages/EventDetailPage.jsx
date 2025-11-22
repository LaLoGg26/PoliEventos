import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getEventoById, comprarBoletosAPI } from "../services/eventoService"; // Importar la función de compra

function EventDetailPage() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para la compra
  const [cantidad, setCantidad] = useState(1);
  const [mensajeCompra, setMensajeCompra] = useState(null);

  const cargarEvento = async () => {
    try {
      const data = await getEventoById(id);
      setEvento(data);
      setError(null);
    } catch (err) {
      setError("No se pudo cargar el evento o no existe.");
      console.error("Detalle del error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEvento();
  }, [id]);

  const handleComprar = async (boletoId) => {
    setMensajeCompra(null);
    if (cantidad <= 0)
      return setMensajeCompra({
        type: "error",
        text: "La cantidad debe ser 1 o más.",
      });

    try {
      const result = await comprarBoletosAPI(boletoId, cantidad);
      setMensajeCompra({ type: "success", text: result.message });

      // Recargar para actualizar el inventario inmediatamente
      await cargarEvento();
      setCantidad(1); // Resetear cantidad
    } catch (error) {
      setMensajeCompra({ type: "error", text: error.message });
    }
  };

  if (loading) return <h1>Cargando detalles del evento...</h1>;
  if (error)
    return <h1 style={{ color: "red", textAlign: "center" }}>{error}</h1>;
  if (!evento)
    return <h1 style={{ textAlign: "center" }}>Evento no encontrado.</h1>;

  return (
    <div className="event-detail" style={{ padding: "20px" }}>
      <Link
        to="/"
        style={{
          display: "block",
          marginBottom: "20px",
          textDecoration: "none",
          color: "#007BFF",
        }}
      >
        ← Volver a la Lista de Eventos
      </Link>

      {/* Mostrar mensaje de compra */}
      {mensajeCompra && (
        <p
          style={{
            color: "white",
            backgroundColor:
              mensajeCompra.type === "error" ? "#dc3545" : "#28a745",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          {mensajeCompra.text}
        </p>
      )}

      <h1>{evento.nombre}</h1>
      <p>
        📍 {evento.lugar} - 🗓️ {new Date(evento.fecha).toLocaleString()}
      </p>
      <p>{evento.descripcion}</p>

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

          {/* Controles de Compra */}
          <div style={{ marginTop: "10px" }}>
            <label>Cantidad: </label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) =>
                setCantidad(Math.max(1, parseInt(e.target.value) || 1))
              }
              min="1"
              max={boleto.disponibles}
              style={{ width: "60px", marginRight: "10px", padding: "5px" }}
            />
            <button
              onClick={() => handleComprar(boleto.id)}
              disabled={
                boleto.disponibles <= 0 || cantidad > boleto.disponibles
              }
              style={{
                padding: "8px 15px",
                cursor: "pointer",
                backgroundColor: boleto.disponibles > 0 ? "#4CAF50" : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "3px",
              }}
            >
              Comprar ({cantidad})
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default EventDetailPage;
