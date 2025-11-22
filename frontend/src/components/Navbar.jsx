import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav style={styles.nav}>
      {/* Logo / Home (Visible para todos) */}
      <Link to="/" style={styles.logo}>
        🎟️ PoliEventos MVP
      </Link>

      <div style={styles.linksContainer}>
        {/* 🔒 LÓGICA DE PROTECCIÓN: Solo mostramos esto si hay usuario logueado */}
        {isAuthenticated && user ? (
          <>
            {/* 1. Saludo */}
            <span style={styles.welcome} title={`Hola, ${user.nombre}`}>
              Hola, {user.nombre} ({user.rol})
            </span>

            {/* 2. Botón Dashboard (Solo Vendedores/Admin) */}
            {(user.rol === "VENDEDOR" || user.rol === "SUPER_USER") && (
              <Link to="/dashboard" style={styles.dashboardBtn}>
                ⚙️ Mis Eventos
              </Link>
            )}

            {/* 3. Botón Wallet (Para TODOS los usuarios logueados: Compradores y Vendedores) */}
            <Link to="/mis-tickets" style={styles.walletBtn}>
              🎟️ Mis Tickets
            </Link>

            {/* 4. Logout */}
            <button onClick={logout} style={styles.logoutButton}>
              Logout
            </button>
          </>
        ) : (
          // 🔓 SI NO ESTÁ LOGUEADO: Mostrar Login/Registro
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

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 20px",
    backgroundColor: "#333",
    color: "white",
    width: "100%",
    boxSizing: "border-box",
    minHeight: "3rem",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  },
  logo: {
    color: "white",
    textDecoration: "none",
    fontSize: "1.5rem",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  linksContainer: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexShrink: 0,
  },
  navLink: {
    color: "white",
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    transition: "background-color 0.3s",
    fontSize: "0.9rem",
  },
  welcome: {
    marginRight: "5px",
    color: "#ccc",
    fontSize: "0.85rem",
    whiteSpace: "nowrap",
    maxWidth: "150px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "inline-block",
    verticalAlign: "middle",
    cursor: "default",
  },
  // Estilo para botón Dashboard (Amarillo/Naranja)
  dashboardBtn: {
    backgroundColor: "#F59E0B",
    color: "white",
    textDecoration: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    fontSize: "0.85rem",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  // Estilo para botón Wallet (Azul)
  walletBtn: {
    backgroundColor: "#2563EB",
    color: "white",
    textDecoration: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    fontSize: "0.85rem",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  // Estilo Logout (Rojo)
  logoutButton: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontSize: "0.85rem",
    fontWeight: "bold",
  },
};

export default Navbar;
