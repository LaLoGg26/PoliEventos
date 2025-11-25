import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const { register, isLoading, error } = useAuth();
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    try {
      await register(nombre, email, password, telefono);
      setSuccess("¡Cuenta creada! Ahora puedes iniciar sesión.");
      setNombre("");
      setEmail("");
      setPassword("");
      setTelefono("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <h2 style={styles.title}>Crear Cuenta 🚀</h2>
        {success && <div style={styles.successAlert}>{success}</div>}
        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre Completo</label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {/* ⭐️ CAMPO TELÉFONO ⭐️ */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              WhatsApp (con lada, ej: +52155...)
            </label>
            <input
              type="tel"
              placeholder="+5215512345678"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
              style={styles.input}
            />
            <small style={{ fontSize: "0.7rem", color: "#666" }}>
              *IMPORTANTE: Para recibir mensajes en modo prueba, tu número debe
              unirse al Sandbox de Twilio.
            </small>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? "Registrando..." : "Registrarse"}
          </button>
        </form>
        <p style={styles.footerText}>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" style={styles.link}>
            Inicia Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "90vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    padding: "20px",
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    margin: "0 0 20px 0",
    color: "#333",
    textAlign: "center",
    fontSize: "1.8rem",
  },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "0.9rem", fontWeight: "600", color: "#444" },
  input: {
    padding: "12px 15px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    outline: "none",
    backgroundColor: "#fafafa",
  },
  button: {
    padding: "14px",
    backgroundColor: "#10B981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    marginTop: "10px",
  },
  errorAlert: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "0.9rem",
    textAlign: "center",
    marginBottom: "10px",
  },
  successAlert: {
    backgroundColor: "#D1FAE5",
    color: "#065F46",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "0.9rem",
    textAlign: "center",
    marginBottom: "10px",
  },
  footerText: {
    marginTop: "25px",
    textAlign: "center",
    fontSize: "0.9rem",
    color: "#666",
  },
  link: { color: "#10B981", textDecoration: "none", fontWeight: "600" },
};

export default RegisterPage;
