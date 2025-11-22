import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getEventoById, comprarBoletosAPI } from "../services/eventoService";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../context/AuthContext"; // 1. Importar Auth

// Fix para iconos de Leaflet
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 2. Obtener usuario y token
  const { user, token } = useAuth();

  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cantidad, setCantidad] = useState(1);
  const [mensajeCompra, setMensajeCompra] = useState(null);

  const cargarEvento = async () => {
    try {
      const data = await getEventoById(id);
      setEvento(data);
      setError(null);
    } catch (err) {
      setError("No se pudo cargar el evento.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEvento();
  }, [id]);

  const handleComprar = async (boletoId) => {
    setMensajeCompra(null);

    // 3. Verificación de Sesión
    if (!user || !token) {
      alert("Debes iniciar sesión para comprar boletos.");
      navigate("/login");
      return;
    }

    if (cantidad <= 0) return;

    try {
      // 4. Enviar Token a la API
      const result = await comprarBoletosAPI(boletoId, cantidad, token);
      setMensajeCompra({ type: "success", text: result.message });

      // Recargar datos para actualizar stock
      await cargarEvento();
      setCantidad(1);
    } catch (error) {
      setMensajeCompra({ type: "error", text: error.message });
    }
  };

  if (loading)
    return (
      <div style={styles.center}>
        <h2>Cargando...</h2>
      </div>
    );
  if (error)
    return (
      <div style={styles.center}>
        <h2 style={{ color: "red" }}>{error}</h2>
      </div>
    );
  if (!evento)
    return (
      <div style={styles.center}>
        <h2>Evento no encontrado.</h2>
      </div>
    );

  return (
    <div style={styles.container}>
      <Link to="/" style={styles.backLink}>
        ← Volver a Eventos
      </Link>

      <div style={styles.layout}>
        {/* --- Columna Izquierda: Información --- */}
        <div style={styles.eventInfo}>
          <div style={styles.imageContainer}>
            {evento.imagen_url ? (
              <img
                src={evento.imagen_url}
                alt={evento.nombre}
                style={styles.eventImage}
              />
            ) : (
              <div style={styles.imagePlaceholder}>🎟️ Sin Imagen</div>
            )}
          </div>

          <h1 style={styles.title}>{evento.nombre}</h1>
          <div style={styles.meta}>
            <p>
              📍 <strong>Lugar:</strong> {evento.lugar}
            </p>
            <p>
              🗓️ <strong>Fecha:</strong>{" "}
              {new Date(evento.fecha).toLocaleString()}
            </p>
          </div>
          <div style={styles.descriptionBox}>
            <h3>Acerca del evento</h3>
            <p>{evento.descripcion}</p>
          </div>

          {evento.latitud && evento.longitud && (
            <div style={styles.mapWrapper}>
              <h3>Ubicación</h3>
              <MapContainer
                center={[evento.latitud, evento.longitud]}
                zoom={15}
                style={{ height: "300px", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[evento.latitud, evento.longitud]}>
                  <Popup>{evento.lugar}</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
        </div>

        {/* --- Columna Derecha: Tickets --- */}
        <div style={styles.ticketSection}>
          <h2 style={styles.ticketTitle}>Selecciona tus Boletos</h2>

          {mensajeCompra && (
            <div
              style={
                mensajeCompra.type === "error"
                  ? styles.msgError
                  : styles.msgSuccess
              }
            >
              {mensajeCompra.text}
            </div>
          )}

          <div style={styles.ticketsList}>
            {evento.boletos
              // 5. Filtro: Solo mostrar boletos activos
              .filter((boleto) => boleto.activo === 1 || boleto.activo === true)
              .map((boleto) => (
                <div key={boleto.id} style={styles.ticketCard}>
                  <div style={styles.ticketInfo}>
                    <span style={styles.zoneName}>{boleto.zona}</span>
                    <span style={styles.availability}>
                      {boleto.disponibles > 0
                        ? `${boleto.disponibles} disp.`
                        : "AGOTADO"}
                    </span>
                  </div>
                  <div style={styles.priceTag}>${boleto.precio.toFixed(2)}</div>

                  <div style={styles.buyActions}>
                    <input
                      type="number"
                      min="1"
                      max={boleto.disponibles}
                      value={cantidad}
                      onChange={(e) =>
                        setCantidad(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      style={styles.qtyInput}
                      disabled={boleto.disponibles <= 0}
                    />
                    <button
                      onClick={() => handleComprar(boleto.id)}
                      disabled={boleto.disponibles <= 0}
                      style={
                        boleto.disponibles > 0
                          ? styles.buyBtn
                          : styles.soldOutBtn
                      }
                    >
                      {boleto.disponibles > 0 ? "Comprar" : "Agotado"}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "40px 20px",
    minHeight: "80vh",
  },
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "50vh",
  },
  backLink: {
    display: "inline-block",
    marginBottom: "20px",
    color: "#666",
    textDecoration: "none",
    fontWeight: "bold",
  },

  layout: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "40px",
  },

  eventInfo: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },
  imageContainer: {
    marginBottom: "20px",
    borderRadius: "12px",
    overflow: "hidden",
  },
  eventImage: { width: "100%", height: "300px", objectFit: "cover" },
  imagePlaceholder: {
    width: "100%",
    height: "200px",
    backgroundColor: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    color: "#888",
  },

  title: { margin: "0 0 10px 0", fontSize: "2rem", color: "#111" },
  meta: {
    color: "#555",
    fontSize: "1.1rem",
    marginBottom: "20px",
    lineHeight: "1.6",
  },
  descriptionBox: {
    borderTop: "1px solid #eee",
    paddingTop: "20px",
    color: "#444",
    lineHeight: "1.6",
  },

  mapWrapper: {
    marginTop: "30px",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #eee",
  },

  ticketSection: { display: "flex", flexDirection: "column", gap: "20px" },
  ticketTitle: { fontSize: "1.5rem", margin: "0 0 10px 0" },
  ticketsList: { display: "flex", flexDirection: "column", gap: "15px" },

  ticketCard: {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.02)",
  },
  ticketInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  zoneName: { fontWeight: "bold", fontSize: "1.2rem", color: "#333" },
  availability: {
    fontSize: "0.85rem",
    color: "#666",
    backgroundColor: "#f3f4f6",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  priceTag: { fontSize: "1.5rem", fontWeight: "bold", color: "#2563EB" },

  buyActions: { display: "flex", gap: "10px" },
  qtyInput: {
    width: "60px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    textAlign: "center",
  },
  buyBtn: {
    flex: 1,
    backgroundColor: "#2563EB",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  soldOutBtn: {
    flex: 1,
    backgroundColor: "#ccc",
    color: "#666",
    border: "none",
    borderRadius: "6px",
    cursor: "not-allowed",
    fontWeight: "bold",
  },

  msgSuccess: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
    padding: "15px",
    borderRadius: "8px",
    textAlign: "center",
  },
  msgError: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "15px",
    borderRadius: "8px",
    textAlign: "center",
  },
};

export default EventDetailPage;
