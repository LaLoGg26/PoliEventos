import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <h2 style={styles.title}>Bienvenido de nuevo 👋</h2>
        <p style={styles.subtitle}>Ingresa tus credenciales para continuar</p>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
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
            {isLoading ? "Entrando..." : "Iniciar Sesión"}
          </button>
        </form>
        <p style={styles.footerText}>
          ¿No tienes cuenta?{" "}
          <Link to="/register" style={styles.link}>
            Regístrate aquí
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
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", // Fondo sutil
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
    margin: "0 0 10px 0",
    color: "#333",
    textAlign: "center",
    fontSize: "1.8rem",
  },
  subtitle: {
    margin: "0 0 30px 0",
    color: "#666",
    textAlign: "center",
    fontSize: "0.95rem",
  },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "0.9rem", fontWeight: "600", color: "#444" },
  input: {
    padding: "12px 15px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    outline: "none",
    transition: "border 0.3s",
    backgroundColor: "#fafafa",
  },
  button: {
    padding: "14px",
    backgroundColor: "#2563EB",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "background 0.3s",
    marginTop: "10px",
  },
  errorAlert: {
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "0.9rem",
    textAlign: "center",
    border: "1px solid #FCA5A5",
    marginBottom: "20px",
  },
  footerText: {
    marginTop: "25px",
    textAlign: "center",
    fontSize: "0.9rem",
    color: "#666",
  },
  link: { color: "#2563EB", textDecoration: "none", fontWeight: "600" },
};
export default LoginPage;
