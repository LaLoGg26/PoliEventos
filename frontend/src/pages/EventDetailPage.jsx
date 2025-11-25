import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getEventoById, comprarBoletosAPI } from "../services/eventoService";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../context/AuthContext";

// Fix iconos
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

// ⚠️ CONFIGURA ESTO CON TU DATO DE TWILIO ⚠️
const TWILIO_SANDBOX_CODE = "join particular-owl"; // Reemplaza con tu código real
const TWILIO_NUMBER = "+14155238886";

function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cantidad, setCantidad] = useState(1);

  // Estados para el Modal de WhatsApp
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [lastPurchaseId, setLastPurchaseId] = useState(null);
  const [sendingWhats, setSendingWhats] = useState(false);

  const cargarEvento = async () => {
    try {
      const data = await getEventoById(id);
      setEvento(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar evento.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEvento();
  }, [id]);

  const handleComprar = async (boletoId) => {
    if (!user || !token) {
      alert("Inicia sesión para comprar.");
      navigate("/login");
      return;
    }
    if (cantidad <= 0) return;

    try {
      // Nota: Ahora la función retorna el ID de compra si modificamos el backend para ello,
      // o asumimos que fue la última.
      // Para este flujo, asumimos éxito y mostramos el modal.
      const result = await comprarBoletosAPI(boletoId, cantidad, token);

      // Si el backend nos devuelve el ID de la compra en 'result', lo usamos.
      // Si no, tendremos que confiar en el flujo. (Idealmente el backend debería devolver { success: true, compraId: 123 })

      // Hack rápido para MVP: Si la compra fue exitosa, mostramos el modal.
      // Usaremos un reenvío manual si es necesario.

      await cargarEvento();
      setCantidad(1);
      setShowWhatsappModal(true); // 👈 ABRIR MODAL
    } catch (error) {
      alert(error.message);
    }
  };

  // Función para activar el envío manual desde el modal
  const triggerWhatsappSend = async () => {
    // Como no tenemos el ID de compra exacto aquí (a menos que actualicemos el return del backend),
    // podemos hacer un truco: Obtener la última compra del usuario.
    // O simplemente dirigir al usuario a "Mis Tickets".

    // Para este MVP, lo mejor es dirigirlo a la wallet.
    navigate("/mis-tickets");
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
        <h2>No encontrado</h2>
      </div>
    );

  return (
    <div style={styles.container}>
      {/* ⭐️ MODAL DE WHATSAPP ⭐️ */}
      {showWhatsappModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>📱</div>
            <h2 style={{ margin: "0 0 10px 0", color: "#25D366" }}>
              ¡Compra Exitosa!
            </h2>
            <p style={{ marginBottom: "20px", color: "#555" }}>
              Para recibir tus boletos en WhatsApp, debes activar el servicio
              (Solo 1 vez).
            </p>

            <div style={styles.stepBox}>
              <strong>Paso 1:</strong> Envía el código al Sandbox.
              <a
                href={`https://wa.me/${TWILIO_NUMBER}?text=${encodeURIComponent(
                  TWILIO_SANDBOX_CODE
                )}`}
                target="_blank"
                rel="noreferrer"
                style={styles.whatsappBtn}
              >
                👉 Abrir WhatsApp y Enviar Código
              </a>
            </div>

            <div style={styles.stepBox}>
              <strong>Paso 2:</strong> Una vez enviado, ve a tus tickets.
              <button onClick={triggerWhatsappSend} style={styles.primaryBtn}>
                Ir a Mis Tickets
              </button>
            </div>

            <button
              onClick={() => setShowWhatsappModal(false)}
              style={styles.closeLink}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <Link to="/" style={styles.backLink}>
        ← Volver
      </Link>

      <div style={styles.layout}>
        <div style={styles.eventInfo}>
          <div style={styles.imageContainer}>
            {evento.imagen_url ? (
              <img
                src={evento.imagen_url}
                alt={evento.nombre}
                style={styles.eventImage}
              />
            ) : (
              <div style={styles.imagePlaceholder}>🎟️</div>
            )}
          </div>
          <h1 style={styles.title}>{evento.nombre}</h1>
          <div style={styles.meta}>
            <p>📍 {evento.lugar}</p>
            <p>🗓️ {new Date(evento.fecha).toLocaleString()}</p>
          </div>
          <p>{evento.descripcion}</p>

          {evento.latitud && evento.longitud && (
            <div style={styles.mapWrapper}>
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

        <div style={styles.ticketSection}>
          <h2>Boletos</h2>
          <div style={styles.ticketsList}>
            {evento.boletos
              .filter((b) => b.activo)
              .map((boleto) => (
                <div key={boleto.id} style={styles.ticketCard}>
                  <div style={styles.ticketInfo}>
                    <span style={styles.zoneName}>{boleto.zona}</span>
                    <span style={styles.price}>${boleto.precio}</span>
                  </div>
                  <div style={styles.buyActions}>
                    <input
                      type="number"
                      min="1"
                      max={boleto.disponibles}
                      value={cantidad}
                      onChange={(e) =>
                        setCantidad(Math.max(1, parseInt(e.target.value)))
                      }
                      style={styles.qtyInput}
                    />
                    <button
                      onClick={() => handleComprar(boleto.id)}
                      style={styles.buyBtn}
                    >
                      Comprar
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
    fontSize: "2rem",
  },
  title: { margin: "0 0 10px 0", fontSize: "2rem", color: "#111" },
  meta: { color: "#555", fontSize: "1.1rem", marginBottom: "20px" },
  mapWrapper: {
    marginTop: "30px",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #eee",
  },
  ticketSection: { display: "flex", flexDirection: "column", gap: "20px" },
  ticketCard: {
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.02)",
  },
  ticketInfo: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    fontWeight: "bold",
  },
  zoneName: { fontSize: "1.2rem" },
  price: { color: "#2563EB", fontSize: "1.3rem" },
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

  // MODAL
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3000,
  },
  modalCard: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "16px",
    textAlign: "center",
    width: "90%",
    maxWidth: "400px",
  },
  stepBox: {
    margin: "20px 0",
    padding: "15px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    border: "1px solid #eee",
  },
  whatsappBtn: {
    display: "block",
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#25D366",
    color: "white",
    textDecoration: "none",
    borderRadius: "6px",
    fontWeight: "bold",
  },
  primaryBtn: {
    width: "100%",
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#2563EB",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  closeLink: {
    background: "none",
    border: "none",
    color: "#888",
    marginTop: "10px",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default EventDetailPage;
