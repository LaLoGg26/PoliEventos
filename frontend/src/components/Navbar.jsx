import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* ESTILOS CSS AVANZADOS PARA MÓVIL */}
      <style>{`
        /* Escritorio */
        .desktop-links { display: flex; align-items: center; gap: 15px; }
        .mobile-hamburger { display: none; }
        .mobile-menu-overlay { display: none; }

        /* Animación de entrada */
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Móvil (menos de 768px) */
        @media (max-width: 768px) {
          .desktop-links { display: none; }
          .mobile-hamburger { display: block; cursor: pointer; z-index: 1001; }
          
          /* Contenedor Principal del Menú */
          .mobile-menu-overlay {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 3.5rem; /* Justo debajo de la barra */
            left: 0;
            width: 100%;
            height: calc(100vh - 3.5rem);
            background-color: rgba(18, 18, 18, 0.98);
            backdrop-filter: blur(10px);
            padding: 30px 20px;
            box-sizing: border-box;
            z-index: 999;
            animation: slideDown 0.3s ease-out;
            align-items: center;
            gap: 20px;
          }

          .mobile-profile-card {
            background-color: rgba(255, 255, 255, 0.1);
            padding: 15px 25px;
            border-radius: 12px;
            text-align: center;
            width: 100%;
            margin-bottom: 10px;
            border: 1px solid rgba(255,255,255,0.1);
          }
        }
      `}</style>

      <nav style={styles.nav}>
        {/* 1. Logo */}
        <Link to="/" style={styles.logo} onClick={closeMenu}>
          🎟️ PoliEventos MVP
        </Link>

        {/* 2. Botón Hamburguesa */}
        <div className="mobile-hamburger" onClick={toggleMenu}>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </div>

        {/* 3. Enlaces Escritorio */}
        <div className="desktop-links">
          <NavLinks
            isAuthenticated={isAuthenticated}
            user={user}
            logout={logout}
            closeMenu={closeMenu}
            isMobile={false}
          />
        </div>
      </nav>

      {/* 4. Menú Móvil */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay">
          <NavLinks
            isAuthenticated={isAuthenticated}
            user={user}
            logout={logout}
            closeMenu={closeMenu}
            isMobile={true}
          />
        </div>
      )}
    </>
  );
}

// Componente Auxiliar
function NavLinks({ isAuthenticated, user, logout, closeMenu, isMobile }) {
  const btnStyle = isMobile ? styles.mobileBtn : styles.navLink;
  const actionBtnStyle = isMobile
    ? styles.mobileActionBtn
    : styles.dashboardBtn;
  const walletBtnStyle = isMobile ? styles.mobileActionBtn : styles.walletBtn;

  if (isAuthenticated && user) {
    return (
      <>
        {isMobile ? (
          <div className="mobile-profile-card">
            <div style={{ fontSize: "2rem", marginBottom: "5px" }}>👤</div>
            <div
              style={{ color: "white", fontWeight: "bold", fontSize: "1.1rem" }}
            >
              {user.nombre}
            </div>
            <div
              style={{
                color: "#aaa",
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {user.rol}
            </div>
          </div>
        ) : (
          <span style={styles.welcome} title={`Hola, ${user.nombre}`}>
            Hola, {user.nombre.split(" ")[0]}
          </span>
        )}

        {(user.rol === "VENDEDOR" || user.rol === "SUPER_USER") && (
          <Link
            to="/dashboard"
            style={{ ...actionBtnStyle, backgroundColor: "#F59E0B" }}
            onClick={closeMenu}
          >
            ⚙️ Gestionar Eventos
          </Link>
        )}

        <Link
          to="/mis-tickets"
          style={{ ...walletBtnStyle, backgroundColor: "#2563EB" }}
          onClick={closeMenu}
        >
          🎟️ Mis Tickets
        </Link>

        <button
          onClick={() => {
            logout();
            closeMenu();
          }}
          style={isMobile ? styles.mobileLogout : styles.logoutButton}
        >
          Cerrar Sesión
        </button>
      </>
    );
  }

  return (
    <>
      <Link
        to="/login"
        style={isMobile ? styles.mobileBigLink : styles.navLink}
        onClick={closeMenu}
      >
        Iniciar Sesión
      </Link>
      <Link
        to="/register"
        style={isMobile ? styles.mobileBigLinkOutline : styles.navLink}
        onClick={closeMenu}
      >
        Crear Cuenta
      </Link>
    </>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",
    backgroundColor: "#111",
    color: "white",
    width: "100%",
    boxSizing: "border-box",
    minHeight: "3.5rem",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
  },
  logo: {
    color: "white",
    textDecoration: "none",
    fontSize: "1.3rem",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    whiteSpace: "nowrap",
  },

  // Estilos Escritorio
  navLink: {
    color: "#ccc",
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    transition: "0.2s",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  welcome: {
    marginRight: "10px",
    color: "#888",
    fontSize: "0.85rem",
    whiteSpace: "nowrap",
    cursor: "default",
  },
  dashboardBtn: {
    color: "white",
    textDecoration: "none",
    padding: "6px 15px",
    borderRadius: "50px",
    fontSize: "0.85rem",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  walletBtn: {
    color: "white",
    textDecoration: "none",
    padding: "6px 15px",
    borderRadius: "50px",
    fontSize: "0.85rem",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  logoutButton: {
    backgroundColor: "transparent",
    color: "#ef4444",
    border: "1px solid #ef4444",
    padding: "5px 15px",
    borderRadius: "50px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: "bold",
    transition: "0.2s",
  },

  // Estilos Móviles
  mobileActionBtn: {
    display: "block",
    width: "100%",
    padding: "15px",
    borderRadius: "12px",
    color: "white",
    textDecoration: "none",
    fontSize: "1.1rem",
    fontWeight: "bold",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
  },
  mobileLogout: {
    width: "100%",
    padding: "15px",
    borderRadius: "12px",
    backgroundColor: "transparent",
    color: "#ef4444",
    border: "2px solid #ef4444",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "auto",
  },
  mobileBigLink: {
    display: "block",
    width: "100%",
    padding: "15px",
    borderRadius: "12px",
    backgroundColor: "white",
    color: "black",
    textDecoration: "none",
    fontSize: "1.1rem",
    fontWeight: "bold",
    textAlign: "center",
  },
  mobileBigLinkOutline: {
    display: "block",
    width: "100%",
    padding: "15px",
    borderRadius: "12px",
    border: "2px solid white",
    color: "white",
    textDecoration: "none",
    fontSize: "1.1rem",
    fontWeight: "bold",
    textAlign: "center",
  },
};

export default Navbar;
