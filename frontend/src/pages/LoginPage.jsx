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
      // Navegar a la página principal después del login exitoso
      navigate("/");
    } catch (err) {
      // El error ya se maneja en el Contexto
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Iniciar Sesión 🚪</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {error && <p style={styles.error}>{error}</p>}

        <input
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" disabled={isLoading} style={styles.button}>
          {isLoading ? "Cargando..." : "Login"}
        </button>
      </form>
      <p style={styles.linkText}>
        ¿No tienes cuenta?{" "}
        <Link to="/register" style={styles.link}>
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}
export default LoginPage;
// Estilos simples para una visualización rápida:
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px",
    maxWidth: "400px",
    margin: "50px auto",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: "15px",
  },
  input: { padding: "10px", borderRadius: "4px", border: "1px solid #ccc" },
  button: {
    padding: "10px",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
  error: { color: "red", marginBottom: "10px" },
  linkText: { marginTop: "20px" },
  link: { color: "#007BFF", textDecoration: "none" },
};
