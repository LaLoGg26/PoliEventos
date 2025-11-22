import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav style={styles.nav}>
      {/* Logo / Home */}
      <Link to="/" style={styles.logo}>
        🎟️ PoliEventos MVP
      </Link>

      <div style={styles.linksContainer}>
        {isAuthenticated ? (
          // SI EL USUARIO ESTÁ LOGUEADO
          <>
            {/* Saludo (con texto cortado si es muy largo) */}
            <span style={styles.welcome} title={`Hola, ${user.nombre}`}>
              Hola, {user.nombre} ({user.rol})
            </span>

            {/* Botón Dashboard: Solo para Vendedores o Super Usuarios */}
            {(user.rol === "VENDEDOR" || user.rol === "SUPER_USER") && (
              <Link to="/dashboard" style={styles.dashboardBtn}>
                ⚙️ Mis Eventos
              </Link>
            )}

            <button onClick={logout} style={styles.logoutButton}>
              Logout
            </button>
          </>
        ) : (
          // SI EL USUARIO NO ESTÁ LOGUEADO
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
    padding: "20px 20px", // Padding lateral seguro
    backgroundColor: "#333", // Fondo oscuro
    color: "white",
    width: "100%",
    boxSizing: "border-box", // ⭐️ CLAVE: Evita que la barra se salga de la pantalla
    minHeight: "3rem",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)", // Sombra suave inferior
  },
  logo: {
    color: "white",
    textDecoration: "none",
    fontSize: "2rem",
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
    maxWidth: "200px", // Limita el ancho si el nombre es muy largo
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "inline-block",
    verticalAlign: "middle",
    cursor: "default",
  },
  // Estilo para el botón del Dashboard (Gestión)
  dashboardBtn: {
    backgroundColor: "#F59E0B", // Color ámbar para diferenciar gestión
    color: "white",
    textDecoration: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    fontSize: "0.85rem",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  logoutButton: {
    backgroundColor: "#dc3545", // Rojo
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
