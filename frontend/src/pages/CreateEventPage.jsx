import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:3001/api/eventos";

function CreateEventPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // 1. Datos del Evento
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    fecha: "",
    lugar: "",
    imagen_url: "",
  });

  // 2. Datos de los Boletos (Array dinámico)
  const [tiposBoletos, setTiposBoletos] = useState([
    { nombre_zona: "General", precio: "", cantidad_total: "" },
  ]);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.rol !== "VENDEDOR" && user.rol !== "SUPER_USER") navigate("/");
  }, [user, navigate]);

  // Manejo de cambios inputs del evento
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejo de cambios inputs de boletos (por índice)
  const handleBoletoChange = (index, e) => {
    const nuevosBoletos = [...tiposBoletos];
    nuevosBoletos[index][e.target.name] = e.target.value;
    setTiposBoletos(nuevosBoletos);
  };

  // Agregar fila de boleto
  const agregarTipoBoleto = () => {
    setTiposBoletos([
      ...tiposBoletos,
      { nombre_zona: "", precio: "", cantidad_total: "" },
    ]);
  };

  // Eliminar fila de boleto
  const eliminarTipoBoleto = (index) => {
    const nuevosBoletos = tiposBoletos.filter((_, i) => i !== index);
    setTiposBoletos(nuevosBoletos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Construir el payload con los tipos de datos correctos
    const payload = {
      ...formData,
      tiposBoletos: tiposBoletos.map((b) => ({
        ...b,
        precio: parseFloat(b.precio),
        cantidad_total: parseInt(b.cantidad_total),
      })),
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert("¡Evento creado exitosamente!");
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>📢 Publicar Nuevo Evento</h2>
        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* SECCIÓN 1: DATOS DEL EVENTO */}
          <h3 style={styles.subtitle}>Detalles del Evento</h3>

          <input
            name="nombre"
            type="text"
            value={formData.nombre}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="Nombre del Evento"
          />
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows="2"
            style={{ ...styles.input, fontFamily: "inherit" }}
            placeholder="Descripción..."
          />
          <input
            name="lugar"
            type="text"
            value={formData.lugar}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="Lugar / Sede"
          />
          <input
            name="fecha"
            type="datetime-local"
            value={formData.fecha}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            name="imagen_url"
            type="text"
            value={formData.imagen_url}
            onChange={handleChange}
            style={styles.input}
            placeholder="URL de Imagen (opcional)"
          />

          {/* SECCIÓN 2: TIPOS DE BOLETOS */}
          <h3 style={styles.subtitle}>Tipos de Boletos</h3>
          <p
            style={{ fontSize: "0.8rem", color: "#666", marginBottom: "10px" }}
          >
            Define las zonas y precios (Ej. VIP, General).
          </p>

          {tiposBoletos.map((boleto, index) => (
            <div key={index} style={styles.boletoRow}>
              <input
                name="nombre_zona"
                placeholder="Nombre Zona (Ej. VIP)"
                value={boleto.nombre_zona}
                onChange={(e) => handleBoletoChange(index, e)}
                required
                style={{ ...styles.input, flex: 2 }}
              />
              <input
                name="precio"
                type="number"
                placeholder="Precio ($)"
                value={boleto.precio}
                onChange={(e) => handleBoletoChange(index, e)}
                required
                style={{ ...styles.input, flex: 1 }}
              />
              <input
                name="cantidad_total"
                type="number"
                placeholder="Cantidad"
                value={boleto.cantidad_total}
                onChange={(e) => handleBoletoChange(index, e)}
                required
                style={{ ...styles.input, flex: 1 }}
              />

              {/* Botón eliminar (solo si hay más de 1) */}
              {tiposBoletos.length > 1 && (
                <button
                  type="button"
                  onClick={() => eliminarTipoBoleto(index)}
                  style={styles.deleteButton}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={agregarTipoBoleto}
            style={styles.addButton}
          >
            + Agregar otro tipo de boleto
          </button>

          <hr
            style={{
              margin: "20px 0",
              border: "0",
              borderTop: "1px solid #eee",
            }}
          />

          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? "Publicando..." : "Publicar Evento"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    padding: "40px 20px",
    minHeight: "80vh",
  },
  card: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "700px",
  },
  title: { textAlign: "center", marginBottom: "20px", color: "#333" },
  subtitle: {
    color: "#444",
    borderBottom: "2px solid #f0f0f0",
    paddingBottom: "5px",
    marginTop: "20px",
    marginBottom: "15px",
  },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "0.95rem",
  },
  error: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "10px",
    borderRadius: "5px",
    textAlign: "center",
    marginBottom: "15px",
  },

  boletoRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "5px",
  },
  addButton: {
    backgroundColor: "#f0f0f0",
    color: "#333",
    border: "1px dashed #999",
    padding: "8px",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "5px",
    fontSize: "0.9rem",
  },
  deleteButton: {
    backgroundColor: "#ff5252",
    color: "white",
    border: "none",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    cursor: "pointer",
    fontWeight: "bold",
  },
  submitButton: {
    marginTop: "10px",
    padding: "15px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default CreateEventPage;
