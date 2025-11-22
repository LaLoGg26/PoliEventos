import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LocationPicker from "../components/LocationPicker";

const API_URL = "http://localhost:3001/api/eventos";

function EditEventPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    fecha: "",
    lugar: "",
    imagen_url: "",
  });
  const [newImageFile, setNewImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [coords, setCoords] = useState(null);
  const [boletos, setBoletos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para el modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (!user) return navigate("/login");
    if (user.rol !== "VENDEDOR" && user.rol !== "SUPER_USER") navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    fetch(`${API_URL}/${id}`)
      .then((res) => res.json())
      .then((data) => {
        const date = new Date(data.fecha);
        const offset = date.getTimezoneOffset() * 60000;
        const localISOTime = new Date(date - offset).toISOString().slice(0, 16);

        setFormData({
          nombre: data.nombre,
          descripcion: data.descripcion,
          lugar: data.lugar,
          fecha: localISOTime,
          imagen_url: data.imagen_url,
        });

        if (data.latitud && data.longitud) {
          setCoords({
            lat: parseFloat(data.latitud),
            lng: parseFloat(data.longitud),
          });
        }

        const boletosCargados = data.boletos.map((b) => ({
          ...b,
          nombre_zona: b.zona,
          activo: b.activo === 1 || b.activo === true,
        }));
        setBoletos(boletosCargados);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleBoletoChange = (index, field, value) => {
    const nuevos = [...boletos];
    nuevos[index][field] = value;
    setBoletos(nuevos);
  };

  const agregarNuevoBoleto = () => {
    setBoletos([
      ...boletos,
      {
        nombre_zona: "",
        precio: "",
        cantidad_total: "",
        activo: true,
        isNew: true,
      },
    ]);
  };

  const eliminarBoletoNuevo = (index) => {
    const nuevos = boletos.filter((_, i) => i !== index);
    setBoletos(nuevos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("nombre", formData.nombre);
    data.append("descripcion", formData.descripcion);
    data.append("fecha", formData.fecha);
    data.append("lugar", formData.lugar);

    if (newImageFile) {
      data.append("imagen", newImageFile);
    } else {
      // Si la imagen ya existe, enviamos la URL anterior
      if (formData.imagen_url) {
        data.append("imagen_url", formData.imagen_url);
      }
    }

    if (coords) {
      data.append("latitud", coords.lat);
      data.append("longitud", coords.lng);
    }

    const boletosProcesados = boletos.map((b) => ({
      id: b.id,
      nombre_zona: b.nombre_zona,
      precio: parseFloat(b.precio),
      cantidad_total: parseInt(b.cantidad_total),
      activo: b.activo,
    }));
    data.append("tiposBoletos", JSON.stringify(boletosProcesados));

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      if (res.ok) {
        setShowSuccessModal(true);
      } else {
        const errorData = await res.json();
        alert("Error: " + errorData.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>Cargando...</p>
    );

  return (
    <div style={styles.container}>
      {/* MODAL DE ÉXITO */}
      {showSuccessModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.iconWrapper}>✨</div>
            <h2 style={styles.modalTitle}>¡Cambios Guardados!</h2>
            <p style={styles.modalText}>
              El evento <strong>"{formData.nombre}"</strong> ha sido actualizado
              correctamente.
            </p>

            <div style={styles.modalActions}>
              <Link to={`/evento/${id}`} style={styles.primaryBtn}>
                Ver Cambios
              </Link>
              <button
                onClick={() => navigate("/dashboard")}
                style={styles.secondaryBtn}
              >
                Volver al Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.card}>
        <h2>✏️ Editar Evento</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Nombre</label>
          <input
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            style={styles.input}
          />

          {/* Sección Imagen */}
          <div style={styles.imageSection}>
            <label style={styles.label}>Imagen de Portada</label>
            <div style={styles.imagePreviewContainer}>
              {previewUrl || formData.imagen_url ? (
                <img
                  src={previewUrl || formData.imagen_url}
                  alt="Portada"
                  style={styles.imagePreview}
                />
              ) : (
                <div style={styles.noImage}>Sin imagen</div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ marginTop: "10px" }}
            />
          </div>

          <label style={styles.label}>Descripción</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows="3"
            style={styles.textarea}
          />

          <label style={styles.label}>Fecha</label>
          <input
            name="fecha"
            type="datetime-local"
            value={formData.fecha}
            onChange={handleChange}
            style={styles.input}
          />

          <label style={styles.label}>Lugar</label>
          <input
            name="lugar"
            value={formData.lugar}
            onChange={handleChange}
            style={styles.input}
          />

          <div style={{ marginTop: "10px" }}>
            <label style={styles.label}>Modificar Ubicación</label>
            <LocationPicker
              onLocationSelect={setCoords}
              initialPosition={coords}
            />
          </div>

          <h3
            style={{
              marginTop: "30px",
              borderBottom: "1px solid #eee",
              paddingBottom: "10px",
            }}
          >
            Gestionar Boletos
          </h3>

          <div style={styles.boletosContainer}>
            {boletos.map((boleto, index) => (
              <div
                key={index}
                style={
                  boleto.activo ? styles.boletoCard : styles.boletoCardInactive
                }
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      color: boleto.isNew ? "#2563EB" : "#333",
                    }}
                  >
                    {boleto.isNew
                      ? "🆕 Nuevo Boleto"
                      : `🎫 ${boleto.nombre_zona}`}
                  </span>

                  {boleto.isNew ? (
                    <button
                      type="button"
                      onClick={() => eliminarBoletoNuevo(index)}
                      style={styles.deleteBtn}
                    >
                      Eliminar
                    </button>
                  ) : (
                    <label style={{ fontSize: "0.9rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={boleto.activo}
                        onChange={(e) =>
                          handleBoletoChange(index, "activo", e.target.checked)
                        }
                      />
                      {boleto.activo ? " Activo" : " Inactivo"}
                    </label>
                  )}
                </div>

                <div style={styles.gridBoletos}>
                  <input
                    placeholder="Zona"
                    value={boleto.nombre_zona}
                    onChange={(e) =>
                      handleBoletoChange(index, "nombre_zona", e.target.value)
                    }
                    disabled={!boleto.isNew}
                    style={boleto.isNew ? styles.input : styles.inputDisabled}
                  />
                  <input
                    type="number"
                    placeholder="Precio"
                    value={boleto.precio}
                    onChange={(e) =>
                      handleBoletoChange(index, "precio", e.target.value)
                    }
                    disabled={!boleto.isNew}
                    style={boleto.isNew ? styles.input : styles.inputDisabled}
                  />
                  <input
                    type="number"
                    placeholder="Cantidad"
                    value={boleto.cantidad_total}
                    onChange={(e) =>
                      handleBoletoChange(
                        index,
                        "cantidad_total",
                        e.target.value
                      )
                    }
                    disabled={!boleto.isNew}
                    style={boleto.isNew ? styles.input : styles.inputDisabled}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={agregarNuevoBoleto}
            style={styles.addBtn}
          >
            + Agregar Nuevo Tipo de Boleto
          </button>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              style={styles.cancelBtn}
            >
              Cancelar
            </button>
            <button type="submit" style={styles.saveBtn}>
              Guardar Cambios
            </button>
          </div>
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
    backgroundColor: "#f4f4f4",
  },
  card: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "700px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginTop: "20px",
  },
  label: { fontWeight: "bold", fontSize: "0.9rem", color: "#555" },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    width: "100%",
    boxSizing: "border-box",
  },
  inputDisabled: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #eee",
    backgroundColor: "#f9f9f9",
    color: "#777",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
  },

  imageSection: {
    border: "1px dashed #ccc",
    padding: "15px",
    borderRadius: "8px",
    backgroundColor: "#fafafa",
  },
  imagePreviewContainer: {
    width: "100%",
    height: "200px",
    backgroundColor: "#eee",
    borderRadius: "8px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "10px",
  },
  imagePreview: { width: "100%", height: "100%", objectFit: "cover" },
  noImage: { color: "#999", fontStyle: "italic" },

  boletosContainer: { display: "flex", flexDirection: "column", gap: "10px" },
  boletoCard: {
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#fff",
  },
  boletoCardInactive: {
    padding: "15px",
    border: "1px solid #eee",
    borderRadius: "8px",
    backgroundColor: "#fcecec",
    opacity: 0.8,
  },
  gridBoletos: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: "10px",
  },
  addBtn: {
    padding: "10px",
    backgroundColor: "#e0e7ff",
    color: "#3730a3",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  deleteBtn: {
    color: "red",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "0.85rem",
    textDecoration: "underline",
  },
  actions: { display: "flex", gap: "10px", marginTop: "20px" },
  saveBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#2563EB",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#e5e7eb",
    color: "#333",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },

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
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  iconWrapper: { fontSize: "3rem", marginBottom: "15px" },
  modalTitle: { fontSize: "1.5rem", color: "#111", margin: "0 0 10px 0" },
  modalText: { color: "#666", marginBottom: "30px" },
  modalActions: { display: "flex", flexDirection: "column", gap: "10px" },
  primaryBtn: {
    display: "block",
    padding: "12px",
    backgroundColor: "#F59E0B",
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

export default EditEventPage;
