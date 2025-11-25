import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:3001") + "/api/eventos";

function MyTicketsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expandedId, setExpandedId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resendingId, setResendingId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetch(`${API_URL}/usuario/mis-tickets`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener tickets");
        return res.json();
      })
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
    // Solo abrimos el modal si el ticket es VÁLIDO
    if (
      ticket.uuid &&
      ticket.uuid !== "PENDIENTE" &&
      ticket.estado === "VALIDO"
    ) {
      setSelectedTicket(ticket);
    }
  };

  const handleResend = async (compraId) => {
    if (!window.confirm("¿Reenviar boletos al correo?")) return;
    setResendingId(compraId);
    try {
      const res = await fetch(
        `${API_URL.replace(
          "/api/eventos",
          "/api/auth"
        )}/../usuario/reenviar-correo`,
        {
          // Ajuste ruta
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ compraId }),
        }
      );
      // Nota: Asegúrate que tu ruta en el backend coincida con la URL base
      // Si usas /api/eventos en la constante, la ruta de usuario está ahí.
      // Ajuste rápido: Usamos la URL directa si la constante apunta a eventos
      const res2 = await fetch(
        `${API_URL.replace("/eventos", "")}/usuario/reenviar-correo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ compraId }),
        }
      );

      if (res2.ok) alert("✅ Correo enviado.");
      else alert("❌ Error al enviar.");
    } catch (err) {
      console.error(err);
    } finally {
      setResendingId(null);
    }
  };

  if (loading) return <div style={styles.center}>Cargando tu cartera...</div>;

  return (
    <div style={styles.container}>
      {/* MODAL ZOOM QR */}
      {selectedTicket && (
        <div
          style={styles.qrModalOverlay}
          onClick={() => setSelectedTicket(null)}
        >
          <div
            style={styles.qrModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "10px", color: "#333" }}>
              Entrada Válida
            </h3>
            <div
              style={{
                padding: "20px",
                background: "white",
                display: "inline-block",
                borderRadius: "10px",
                border: "5px solid #16a34a",
              }}
            >
              <QRCodeSVG value={selectedTicket.uuid} size={300} />
            </div>
            <p style={styles.modalUuid}>{selectedTicket.uuid}</p>
            <p
              style={{
                color: "#16a34a",
                fontWeight: "bold",
                fontSize: "1.2rem",
              }}
            >
              ✅ LISTO PARA ESCANEAR
            </p>
            <button
              onClick={() => setSelectedTicket(null)}
              style={styles.closeModalBtn}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <h1>🎟️ Mis Tickets</h1>
        <p>Gestiona tus entradas y accesos.</p>
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
                    📅 {new Date(compra.evento_fecha).toLocaleDateString()} •{" "}
                    {compra.cantidad} boletos
                  </p>
                </div>
                <button style={styles.expandBtn}>
                  {expandedId === compra.compra_id ? "▲" : "▼"}
                </button>
              </div>

              {expandedId === compra.compra_id && (
                <div style={styles.qrSection}>
                  <div style={{ textAlign: "right", marginBottom: "15px" }}>
                    <button
                      onClick={() => handleResend(compra.compra_id)}
                      disabled={resendingId === compra.compra_id}
                      style={styles.resendBtn}
                    >
                      {resendingId === compra.compra_id
                        ? "Enviando..."
                        : "📩 Reenviar PDF al Correo"}
                    </button>
                  </div>

                  <div style={styles.qrGrid}>
                    {compra.tickets.map((ticket, index) => {
                      const isUsed = ticket.estado === "USADO";
                      return (
                        <div
                          key={index}
                          style={{
                            ...styles.qrCard,
                            opacity: isUsed ? 0.6 : 1,
                            cursor: isUsed ? "default" : "pointer",
                            borderColor: isUsed ? "#ccc" : "#16a34a",
                          }}
                          onClick={() => handleQRClick(ticket)}
                          title={
                            isUsed
                              ? "Este boleto ya fue usado"
                              : "Clic para ampliar"
                          }
                        >
                          {/* Etiqueta de Estado */}
                          <div
                            style={{
                              ...styles.statusBadge,
                              backgroundColor: isUsed ? "#fee2e2" : "#dcfce7",
                              color: isUsed ? "#dc2626" : "#16a34a",
                            }}
                          >
                            {isUsed ? "USADO" : "VÁLIDO"}
                          </div>

                          <div style={styles.qrWrapper}>
                            {/* Si está usado, mostramos el QR borroso o gris */}
                            <div
                              style={{
                                opacity: isUsed ? 0.3 : 1,
                                filter: isUsed ? "grayscale(100%)" : "none",
                              }}
                            >
                              <QRCodeSVG
                                value={ticket.uuid || "error"}
                                size={100}
                              />
                            </div>
                            {isUsed && <div style={styles.usedOverlay}>❌</div>}
                          </div>

                          <span style={styles.ticketLabel}>
                            Boleto {index + 1}
                          </span>
                          {!isUsed && (
                            <span style={styles.clickHint}>(Ver Grande)</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
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
    fontFamily: "system-ui, sans-serif",
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
    borderRadius: "16px",
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
    borderRadius: "12px",
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
  eventName: {
    margin: "0 0 5px 0",
    fontSize: "1.1rem",
    color: "#1e293b",
    fontWeight: "700",
  },
  eventDate: { margin: 0, fontSize: "0.9rem", color: "#64748b" },
  expandBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    padding: "5px",
  },

  qrSection: {
    backgroundColor: "#f8fafc",
    padding: "25px",
    borderTop: "1px solid #e2e8f0",
    animation: "fadeIn 0.3s",
  },
  qrGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
  },

  // TARJETA DE TICKET INDIVIDUAL
  qrCard: {
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "140px",
    border: "2px solid transparent",
    position: "relative",
    transition: "transform 0.2s",
  },
  qrWrapper: { marginBottom: "10px", padding: "5px", position: "relative" },
  usedOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "3rem",
    opacity: 0.8,
  },

  ticketLabel: {
    fontWeight: "bold",
    fontSize: "0.9rem",
    marginBottom: "2px",
    color: "#334155",
  },
  clickHint: { fontSize: "0.7rem", color: "#2563EB", fontStyle: "italic" },

  statusBadge: {
    fontSize: "0.7rem",
    padding: "2px 8px",
    borderRadius: "20px",
    fontWeight: "bold",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  // MODAL
  qrModalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3000,
    backdropFilter: "blur(5px)",
  },
  qrModalContent: {
    backgroundColor: "#f4f4f4",
    padding: "40px",
    borderRadius: "24px",
    textAlign: "center",
    maxWidth: "90%",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  modalUuid: {
    fontFamily: "monospace",
    fontSize: "0.9rem",
    margin: "15px 0 5px",
    color: "#555",
    wordBreak: "break-all",
    background: "#e2e8f0",
    padding: "5px 10px",
    borderRadius: "5px",
  },
  closeModalBtn: {
    padding: "12px 35px",
    backgroundColor: "#1e293b",
    color: "white",
    border: "none",
    borderRadius: "50px",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "20px",
  },
  resendBtn: {
    backgroundColor: "#fff",
    color: "#475569",
    border: "1px solid #cbd5e1",
    padding: "8px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
  },
};

// Animación
const styleSheet = document.createElement("style");
styleSheet.innerText = `@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(styleSheet);

export default MyTicketsPage;
