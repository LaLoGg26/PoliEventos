import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LocationPicker from "../components/LocationPicker";

const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:3001") + "/api/eventos";

function CreateEventPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    fecha: "",
    lugar: "",
  });

  const [imagenFile, setImagenFile] = useState(null);
  const [coords, setCoords] = useState(null);

  const [tiposBoletos, setTiposBoletos] = useState([
    { nombre_zona: "", precio: "", cantidad_total: "" },
  ]);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdEventId, setCreatedEventId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.rol !== "VENDEDOR" && user.rol !== "SUPER_USER") {
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleBoletoChange = (index, e) => {
    const nuevos = [...tiposBoletos];
    nuevos[index][e.target.name] = e.target.value;
    setTiposBoletos(nuevos);
  };

  const agregarTipoBoleto = () =>
    setTiposBoletos([
      ...tiposBoletos,
      { nombre_zona: "", precio: "", cantidad_total: "" },
    ]);

  const eliminarTipoBoleto = (index) => {
    const nuevos = tiposBoletos.filter((_, i) => i !== index);
    setTiposBoletos(nuevos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append("nombre", formData.nombre);
    data.append("descripcion", formData.descripcion);
    data.append("fecha", formData.fecha);
    data.append("lugar", formData.lugar);

    if (imagenFile) data.append("imagen", imagenFile);

    if (coords) {
      data.append("latitud", coords.lat);
      data.append("longitud", coords.lng);
    }

    const boletosProcesados = tiposBoletos.map((b) => ({
      ...b,
      precio: parseFloat(b.precio),
      cantidad_total: parseInt(b.cantidad_total),
    }));
    data.append("tiposBoletos", JSON.stringify(boletosProcesados));

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setCreatedEventId(result.evento.id);
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* 🎨 ESTILOS RESPONSIVOS AGREGADOS AQUÍ */}
      <style>{`
        /* Grilla General (Datos del Evento) */
        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        /* Grilla de Boletos (3 columnas en escritorio) */
        .ticket-grid {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 10px;
        }

        /* 📱 VISTA MÓVIL (Menos de 768px) */
        @media (max-width: 768px) {
            .form-grid {
                grid-template-columns: 1fr; /* 1 sola columna para datos generales */
            }

            /* Reacomodo inteligente de boletos */
            .ticket-grid {
                grid-template-columns: 1fr 1fr; /* 2 columnas */
                row-gap: 10px;
            }
            /* El primer input (Nombre Zona) ocupará todo el ancho (2 columnas) */
            .ticket-grid input:nth-child(1) {
                grid-column: 1 / -1; 
            }
            /* Precio y Cantidad se quedan abajo compartiendo mitad y mitad */
        }
      `}</style>

      {showSuccessModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.iconWrapper}>🎉</div>
            <h2 style={styles.modalTitle}>¡Evento Publicado!</h2>
            <p style={styles.modalText}>
              Tu evento <strong>"{formData.nombre}"</strong> ya está disponible.
            </p>
            <div style={styles.modalActions}>
              <Link to={`/evento/${createdEventId}`} style={styles.primaryBtn}>
                Ver Evento Creado
              </Link>
              <button onClick={() => navigate("/")} style={styles.secondaryBtn}>
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.formWrapper}>
        <div style={styles.header}>
          <h2 style={styles.title}>📢 Publicar Nuevo Evento</h2>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>1. Información General</h3>

          {/* USAMOS LA CLASE CSS RESPONSIVA AQUI */}
          <div className="form-grid">
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nombre del Evento</label>
              <input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Ej. Viva la revolución"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Fecha y Hora</label>
              <input
                name="fecha"
                type="datetime-local"
                value={formData.fecha}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nombre del Lugar</label>
              <input
                name="lugar"
                value={formData.lugar}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Ej. Reforma"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Imagen de Portada</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagenFile(e.target.files[0])}
                style={{ ...styles.input, padding: "7px" }}
              />
            </div>
            <div style={{ ...styles.inputGroup, gridColumn: "1 / -1" }}>
              <label style={styles.label}>Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="3"
                style={styles.textarea}
              />
            </div>

            {/* El mapa ocupa todo el ancho */}
            <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
              <label style={styles.label}>
                Ubicación Exacta (Haz clic en el mapa)
              </label>
              <LocationPicker onLocationSelect={setCoords} />
              {coords && (
                <p
                  style={{
                    color: "green",
                    fontSize: "0.8rem",
                    marginTop: "5px",
                  }}
                >
                  ✅ Ubicación seleccionada
                </p>
              )}
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>2. Tickets y Precios</h3>
            <button
              type="button"
              onClick={agregarTipoBoleto}
              style={styles.addButton}
            >
              + Agregar Zona
            </button>
          </div>
          <div style={styles.ticketsContainer}>
            {tiposBoletos.map((boleto, index) => (
              <div key={index} style={styles.ticketCard}>
                {/* USAMOS LA CLASE CSS RESPONSIVA AQUI */}
                <div className="ticket-grid">
                  <input
                    name="nombre_zona"
                    placeholder="Nombre Zona (Ej. General)"
                    value={boleto.nombre_zona}
                    onChange={(e) => handleBoletoChange(index, e)}
                    required
                    style={styles.ticketInput}
                  />
                  <input
                    name="precio"
                    type="number"
                    placeholder="$ Precio"
                    value={boleto.precio}
                    onChange={(e) => handleBoletoChange(index, e)}
                    required
                    style={styles.ticketInput}
                  />
                  <input
                    name="cantidad_total"
                    type="number"
                    placeholder="Cantidad"
                    value={boleto.cantidad_total}
                    onChange={(e) => handleBoletoChange(index, e)}
                    required
                    style={styles.ticketInput}
                  />
                </div>
                {tiposBoletos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => eliminarTipoBoleto(index)}
                    style={styles.deleteButton}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <div style={styles.footer}>
          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? "Subiendo imagen y creando..." : "Publicar Evento"}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    padding: "40px 20px",
    backgroundColor: "#f4f4f4",
    minHeight: "90vh",
  },
  formWrapper: {
    backgroundColor: "white",
    width: "100%",
    maxWidth: "800px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    padding: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  }, // Padding reducido para móvil
  header: { borderBottom: "1px solid #eee", paddingBottom: "20px" },
  title: { margin: 0, color: "#111", fontSize: "1.8rem" },
  section: { display: "flex", flexDirection: "column", gap: "15px" },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#333",
    borderLeft: "4px solid #2563EB",
    paddingLeft: "10px",
  },

  // Nota: styles.grid se reemplazó por className="form-grid"

  inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "0.85rem", fontWeight: "bold", color: "#555" },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "0.95rem",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "0.95rem",
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
    fontFamily: "inherit",
  },

  ticketsContainer: { display: "flex", flexDirection: "column", gap: "15px" },
  ticketCard: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "15px",
  },

  // Nota: styles.ticketGrid se reemplazó por className="ticket-grid"

  ticketInput: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    width: "100%",
    boxSizing: "border-box",
  }, // Width 100% importante

  addButton: {
    backgroundColor: "#e0e7ff",
    color: "#3730a3",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "bold",
  },
  deleteButton: {
    color: "#ef4444",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "0.8rem",
    marginTop: "10px",
    textDecoration: "underline",
    display: "block",
    width: "100%",
    textAlign: "right",
  },
  submitButton: {
    padding: "15px",
    backgroundColor: "#2563EB",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
  },
  errorAlert: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "10px",
    borderRadius: "6px",
  },

  // Modal
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    backdropFilter: "blur(5px)",
  },
  modalCard: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "16px",
    textAlign: "center",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  iconWrapper: { fontSize: "3rem", marginBottom: "15px" },
  modalTitle: { fontSize: "1.5rem", color: "#111", margin: "0 0 10px 0" },
  modalText: { color: "#666", marginBottom: "30px" },
  modalActions: { display: "flex", flexDirection: "column", gap: "10px" },
  primaryBtn: {
    display: "block",
    padding: "12px",
    backgroundColor: "#10B981",
    color: "white",
    textDecoration: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    textAlign: "center",
  },
  secondaryBtn: {
    padding: "12px",
    backgroundColor: "transparent",
    color: "#666",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default CreateEventPage;
