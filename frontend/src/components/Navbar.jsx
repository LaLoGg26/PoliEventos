import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Importar el hook de autenticación

function Navbar() {
  // Obtener el estado y la función de logout del contexto
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    // Llama a la función de logout del contexto
    logout();
    // Opcional: Podrías usar navigate('/') aquí si quieres redirigir a la home después
  };

  return (
    <nav style={styles.nav}>
      {/* 1. Logo/Home */}
      <Link to="/" style={styles.logo}>
        🎟️ Poli Eventos MVP
      </Link>

      <div style={styles.linksContainer}>
        {isAuthenticated ? (
          // 2. Si el usuario está autenticado
          <>
            <span style={styles.welcome}>
              Hola, {user.nombre} ({user.rol})
            </span>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
            {/* Opcional: Botón para crear evento, visible solo para VENDEDORES */}
            {(user.rol === "VENDEDOR" || user.rol === "SUPER_USER") && (
              <Link to="/create-event" style={styles.createEventButton}>
                Crear Evento
              </Link>
            )}
          </>
        ) : (
          // 3. Si el usuario NO está autenticado
          <>
            <Link to="/login" style={styles.navLink}>
              Login
            </Link>
            <Link to="/register" style={styles.navLink}>
              Registro
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

// ... al final de frontend/src/components/Navbar.jsx

// En frontend/src/components/Navbar.jsx

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 20px", // Padding horizontal equilibrado
    backgroundColor: "#333",
    color: "white",

    // ⭐️ CORRECCIONES CLAVE ⭐️
    width: "100%",
    boxSizing: "border-box", // 👈 ESTO SOLUCIONA EL DESBORDAMIENTO

    minHeight: "3rem",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
  },
  logo: {
    color: "white",
    textDecoration: "none",
    fontSize: "2rem", // Un poco más pequeño para que no empuje tanto
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  linksContainer: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexShrink: 0, // Evita que se aplaste
  },
  navLink: {
    color: "white",
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    transition: "background-color 0.3s",
  },
  welcome: {
    marginRight: "10px",
    color: "#ccc",
    fontSize: "0.9rem", // Texto un poco más pequeño para ganar espacio
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "300px", // Si el nombre es larguísimo, pondrá "..."
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "8px 15px",
    borderRadius: "4px",
    cursor: "pointer",
    whiteSpace: "nowrap", // Asegura que el texto del botón no se rompa
  },
  createEventButton: {
    backgroundColor: "#28a745",
    color: "white",
    textDecoration: "none",
    padding: "8px 15px",
    borderRadius: "4px",
    whiteSpace: "nowrap",
  },
};
export default Navbar;
