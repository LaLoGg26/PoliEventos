import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function ProfilePage() {
  const { user, token, updateLocalUser } = useAuth();

  // Estados de formulario
  const [nombre, setNombre] = useState(user?.nombre || "");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(user?.avatar_url);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'success'|'error', text: '' }

  // Manejo de imagen local
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  // 1. Guardar Cambios (Nombre, Password, Avatar)
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const formData = new FormData();
    formData.append("nombre", nombre);
    if (password) formData.append("password", password);
    if (file) formData.append("avatar", file);

    try {
      const res = await fetch(`${API_URL}/api/auth/profile/avatar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        updateLocalUser(data.user); // Actualizar contexto
        setMsg({ type: "success", text: "Perfil actualizado correctamente" });
        setPassword(""); // Limpiar password por seguridad
      } else {
        setMsg({ type: "error", text: data.message });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Error de conexión" });
    } finally {
      setLoading(false);
    }
  };

  // 2. Convertirse en Vendedor
  const handleUpgrade = async () => {
    if (
      !window.confirm(
        "¿Quieres activar tu cuenta de Vendedor para publicar eventos?"
      )
    )
      return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/upgrade`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) {
        updateLocalUser(data.user);
        alert(
          "¡Felicidades! Ahora eres Vendedor. Verás el panel de administración en el menú."
        );
        window.location.reload(); // Recargar para asegurar que el Navbar se actualice
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Configuración de Perfil</h2>

        {msg && (
          <div
            style={msg.type === "success" ? styles.msgSuccess : styles.msgError}
          >
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSave} style={styles.form}>
          {/* SECCIÓN: AVATAR */}
          <div style={styles.avatarSection}>
            <div style={styles.avatarWrapper}>
              <img
                src={
                  preview || `https://ui-avatars.com/api/?name=${user.nombre}`
                }
                alt="Avatar"
                style={styles.avatarImg}
              />
              <label style={styles.avatarOverlay}>
                📷
                <input
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  accept="image/*"
                />
              </label>
            </div>
            <p style={styles.hint}>Toca la foto para cambiarla</p>
          </div>

          {/* SECCIÓN: DATOS */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre Completo</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <input
              value={user.email}
              disabled
              style={{
                ...styles.input,
                backgroundColor: "#f3f4f6",
                color: "#888",
              }}
            />
            <small style={{ color: "#888" }}>
              El correo no se puede cambiar.
            </small>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Nueva Contraseña</label>
            <input
              type="password"
              placeholder="Dejar en blanco para mantener la actual"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.saveBtn}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>

        {/* SECCIÓN: MEMBRESÍA (Solo si es COMPRADOR) */}
        {user.rol === "COMPRADOR" && (
          <div style={styles.upgradeSection}>
            <h3 style={{ margin: "0 0 10px 0" }}>
              ¿Quieres vender tus propios eventos?
            </h3>
            <p style={{ color: "#666", marginBottom: "15px" }}>
              Activa tu cuenta de vendedor y empieza a publicar hoy mismo.
            </p>
            <button onClick={handleUpgrade} style={styles.upgradeBtn}>
              🚀 Convertirme en Vendedor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    padding: "40px 20px",
    minHeight: "85vh",
    backgroundColor: "#f8fafc",
  },
  card: {
    backgroundColor: "white",
    width: "100%",
    maxWidth: "500px",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },
  title: { textAlign: "center", margin: "0 0 30px 0", color: "#1e293b" },

  avatarSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "30px",
  },
  avatarWrapper: {
    width: "120px",
    height: "120px",
    position: "relative",
    borderRadius: "50%",
    overflow: "hidden",
    border: "3px solid #e2e8f0",
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  avatarOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "40%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    cursor: "pointer",
    transition: "0.2s",
  },
  hint: { fontSize: "0.8rem", color: "#94a3b8", marginTop: "8px" },

  form: { display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontWeight: "bold", fontSize: "0.9rem", color: "#475569" },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "1rem",
  },

  saveBtn: {
    padding: "14px",
    backgroundColor: "#2563EB",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
  },

  upgradeSection: {
    marginTop: "40px",
    padding: "20px",
    backgroundColor: "#f0f9ff",
    borderRadius: "12px",
    border: "1px dashed #0ea5e9",
    textAlign: "center",
  },
  upgradeBtn: {
    padding: "10px 20px",
    backgroundColor: "#0284c7",
    color: "white",
    border: "none",
    borderRadius: "50px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  msgSuccess: {
    padding: "10px",
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "8px",
    marginBottom: "20px",
    textAlign: "center",
  },
  msgError: {
    padding: "10px",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "8px",
    marginBottom: "20px",
    textAlign: "center",
  },
};

export default ProfilePage;
