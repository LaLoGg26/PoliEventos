import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const API_URL = "http://localhost:3001/api/eventos";

function MyTicketsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expandedId, setExpandedId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null); // Zoom QR

  // ⭐️ ESTADOS PARA LOS NUEVOS MODALES ⭐️
  const [resendTargetId, setResendTargetId] = useState(null); // ID de la compra a reenviar (abre modal confirm)
  const [isResending, setIsResending] = useState(false); // Loading del envío
  const [resendResult, setResendResult] = useState(null); // { type: 'success' | 'error', msg: '' }

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetch(`${API_URL}/usuario/mis-tickets`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const dataLimpia = Array.isArray(data)
          ? data.map((c) => ({ ...c, tickets: c.tickets || [] }))
          : [];
        setCompras(dataLimpia);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user, token, navigate]);

  const toggleExpand = (id) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  const handleQRClick = (ticket) => {
    if (ticket.uuid && ticket.uuid !== "PENDIENTE") setSelectedTicket(ticket);
  };

  // 1. Abrir Modal de Confirmación
  const openResendModal = (compraId) => {
    setResendTargetId(compraId);
    setResendResult(null);
  };

  // 2. Ejecutar el Reenvío (Confirmado)
  const confirmResend = async () => {
    if (!resendTargetId) return;

    setIsResending(true);
    try {
      const res = await fetch(`${API_URL}/usuario/reenviar-correo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ compraId: resendTargetId }),
      });

      // Leemos el texto primero, por si el servidor devuelve HTML de error (500)
      const text = await res.text();

      try {
        const data = JSON.parse(text); // Intentamos leerlo como JSON
        if (res.ok) {
          setResendResult({ type: "success", msg: data.message });
          setResendTargetId(null);
        } else {
          setResendResult({ type: "error", msg: data.message });
          setResendTargetId(null);
        }
      } catch {
        // Si falla el JSON.parse, es que el servidor explotó y mandó HTML
        console.error("Error crítico del servidor:", text);
        setResendResult({
          type: "error",
          msg: "Error crítico en el servidor. Revisa la terminal.",
        });
        setResendTargetId(null);
      }
    } catch (err) {
      console.error(err);
      setResendResult({
        type: "error",
        msg: "Error de red o servidor apagado.",
      });
      setResendTargetId(null);
    } finally {
      setIsResending(false);
    }
  };

  if (loading) return <div style={styles.center}>Cargando tu cartera...</div>;

  return (
    <div style={styles.container}>
      {/* --- MODAL 1: ZOOM QR --- */}
      {selectedTicket && (
        <div
          style={styles.modalOverlay}
          onClick={() => setSelectedTicket(null)}
        >
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "20px" }}>Escanea este código</h3>
            <div
              style={{
                padding: "20px",
                background: "white",
                display: "inline-block",
                borderRadius: "10px",
              }}
            >
              <QRCodeSVG value={selectedTicket.uuid} size={300} />
            </div>
            <p style={styles.modalUuid}>{selectedTicket.uuid}</p>
            <button
              onClick={() => setSelectedTicket(null)}
              style={styles.closeBtn}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 2: CONFIRMACIÓN DE REENVÍO --- */}
      {resendTargetId && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>📧</div>
            <h3>¿Reenviar Boletos?</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Enviaremos una copia de los boletos a tu correo registrado.
            </p>
            <div style={styles.modalActions}>
              <button
                onClick={() => setResendTargetId(null)}
                style={styles.secondaryBtn}
                disabled={isResending}
              >
                Cancelar
              </button>
              <button
                onClick={confirmResend}
                style={styles.primaryBtn}
                disabled={isResending}
              >
                {isResending ? "Enviando..." : "Sí, Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: RESULTADO (ÉXITO O ERROR) --- */}
      {resendResult && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>
              {resendResult.type === "success" ? "✅" : "❌"}
            </div>
            <h3>
              {resendResult.type === "success"
                ? "¡Correo Enviado!"
                : "Hubo un problema"}
            </h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              {resendResult.msg}
            </p>
            <button
              onClick={() => setResendResult(null)}
              style={styles.primaryBtn}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div style={styles.header}>
        <h1>🎟️ Mis Tickets</h1>
        <p>Toca un código QR para ampliarlo.</p>
      </div>

      {compras.length === 0 ? (
        <div style={styles.emptyState}>
          <h3>No tienes boletos aún 😢</h3>
          <Link to="/" style={styles.browseBtn}>
            Explorar Eventos
          </Link>
        </div>
      ) : (
        <div style={styles.list}>
          {compras.map((compra) => (
            <div key={compra.compra_id} style={styles.card}>
              <div
                style={styles.cardHeader}
                onClick={() => toggleExpand(compra.compra_id)}
              >
                <div
                  style={{
                    ...styles.thumbnail,
                    backgroundImage: compra.imagen_url
                      ? `url(${compra.imagen_url})`
                      : "none",
                    backgroundColor: compra.imagen_url
                      ? "transparent"
                      : "#4a00e0",
                  }}
                >
                  {!compra.imagen_url && "🎫"}
                </div>
                <div style={styles.info}>
                  <h3 style={styles.eventName}>{compra.evento_nombre}</h3>
                  <p style={styles.eventDate}>
                    📅 {new Date(compra.evento_fecha).toLocaleDateString()}
                  </p>
                  <p style={styles.zoneInfo}>
                    {compra.nombre_zona} • {compra.cantidad} boletos
                  </p>
                </div>
                <button style={styles.expandBtn}>
                  {expandedId === compra.compra_id ? "▲" : "▼"}
                </button>
              </div>

              {expandedId === compra.compra_id && (
                <div style={styles.qrSection}>
                  <div style={{ textAlign: "right", marginBottom: "15px" }}>
                    {/* Botón que abre el modal de confirmación */}
                    <button
                      onClick={() => openResendModal(compra.compra_id)}
                      style={styles.resendBtn}
                    >
                      📩 Reenviar Correo
                    </button>
                  </div>

                  {compra.tickets.length === 0 ||
                  compra.tickets[0].uuid === "PENDIENTE" ? (
                    <p style={{ textAlign: "center", color: "#d9534f" }}>
                      ⚠️ Compra antigua sin QR disponible.
                    </p>
                  ) : (
                    <div style={styles.qrGrid}>
                      {compra.tickets.map((ticket, index) => (
                        <div
                          key={index}
                          style={{ ...styles.qrCard, cursor: "pointer" }}
                          onClick={() => handleQRClick(ticket)}
                        >
                          <div style={styles.qrWrapper}>
                            <QRCodeSVG
                              value={ticket.uuid || "error"}
                              size={100}
                            />
                          </div>
                          <span style={styles.ticketLabel}>
                            Boleto {index + 1}
                          </span>
                          <span style={styles.clickHint}>(Ver Grande 🔍)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "40px 20px",
    minHeight: "80vh",
  },
  center: {
    textAlign: "center",
    marginTop: "50px",
    fontSize: "1.2rem",
    color: "#666",
  },
  header: { marginBottom: "30px", textAlign: "center" },
  emptyState: {
    textAlign: "center",
    padding: "50px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },
  browseBtn: {
    display: "inline-block",
    marginTop: "15px",
    padding: "10px 20px",
    backgroundColor: "#2563EB",
    color: "white",
    textDecoration: "none",
    borderRadius: "8px",
  },
  list: { display: "flex", flexDirection: "column", gap: "20px" },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    overflow: "hidden",
    border: "1px solid #f3f4f6",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    padding: "20px",
    cursor: "pointer",
    transition: "background 0.2s",
    gap: "15px",
    userSelect: "none",
  },
  thumbnail: {
    width: "60px",
    height: "60px",
    borderRadius: "8px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    color: "white",
    flexShrink: 0,
  },
  info: { flex: 1 },
  eventName: { margin: "0 0 5px 0", fontSize: "1.1rem", color: "#111" },
  eventDate: { margin: 0, fontSize: "0.85rem", color: "#666" },
  zoneInfo: {
    margin: "5px 0 0 0",
    fontSize: "0.9rem",
    fontWeight: "bold",
    color: "#2563EB",
  },
  expandBtn: {
    background: "none",
    border: "none",
    color: "#666",
    cursor: "pointer",
    fontSize: "1.2rem",
    fontWeight: "bold",
    padding: "5px 10px",
  },
  qrSection: {
    backgroundColor: "#f9fafb",
    padding: "20px",
    borderTop: "1px solid #eee",
    animation: "fadeIn 0.3s",
  },
  qrGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
  },
  qrCard: {
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "130px",
    transition: "transform 0.2s",
  },
  qrWrapper: { marginBottom: "10px", padding: "5px", background: "white" },
  ticketLabel: { fontWeight: "bold", fontSize: "0.9rem", marginBottom: "2px" },
  clickHint: { fontSize: "0.7rem", color: "#2563EB", fontStyle: "italic" },

  // Estilos Modales
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3000,
    backdropFilter: "blur(3px)",
  },
  modalCard: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "16px",
    textAlign: "center",
    width: "90%",
    maxWidth: "350px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
  },
  modalUuid: {
    fontFamily: "monospace",
    fontSize: "0.9rem",
    margin: "15px 0",
    color: "#555",
    wordBreak: "break-all",
  },
  modalActions: { display: "flex", gap: "10px", justifyContent: "center" },

  // Botones
  closeBtn: {
    padding: "10px 25px",
    backgroundColor: "#333",
    color: "white",
    border: "none",
    borderRadius: "50px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  resendBtn: {
    backgroundColor: "#4B5563",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "bold",
  },
  primaryBtn: {
    padding: "10px 20px",
    backgroundColor: "#2563EB",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  secondaryBtn: {
    padding: "10px 20px",
    backgroundColor: "#e5e7eb",
    color: "#333",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

// Animación CSS
const styleSheet = document.createElement("style");
styleSheet.innerText = `@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(styleSheet);

export default MyTicketsPage;
