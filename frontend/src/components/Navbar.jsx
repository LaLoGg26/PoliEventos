import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <style>{`
        /* --- ANIMACIONES Y ESTILOS GLOBALES --- */
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        
        /* Logo con Gradiente */
        .brand-gradient {
            background: linear-gradient(90deg, #ff0080, #7928ca);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 900;
        }

        /* Hover en enlaces */
        .nav-hover:hover { color: #fff !important; text-shadow: 0 0 10px rgba(255,255,255,0.5); }

        /* Dropdown */
        .dropdown-menu {
            position: absolute; top: 60px; right: 0;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            width: 260px; border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden; display: flex; flex-direction: column;
            animation: fadeIn 0.2s ease-out; border: 1px solid rgba(255,255,255,0.2);
            z-index: 2000;
        }
        .dropdown-item {
            padding: 14px 20px; color: #333; text-decoration: none;
            font-size: 0.95rem; transition: all 0.2s; display: flex; align-items: center; gap: 10px;
            border-bottom: 1px solid #f0f0f0; font-weight: 500;
        }
        .dropdown-item:hover { background-color: #f8f9fa; padding-left: 25px; color: #7928ca; }
        
        /* Estilos Móviles */
        .desktop-links { display: flex; align-items: center; }
        .mobile-hamburger { display: none; }
        .mobile-menu-overlay { display: none; }

        @media (max-width: 768px) {
          .desktop-links { display: none; }
          .mobile-hamburger { display: block; cursor: pointer; }
          .mobile-menu-overlay {
            display: flex; flex-direction: column; position: fixed;
            top: 4rem; left: 0; width: 100%; height: calc(100vh - 4rem);
            background: rgba(10, 10, 10, 0.95); backdrop-filter: blur(15px);
            padding: 20px; box-sizing: border-box; z-index: 999; gap: 15px;
            border-top: 1px solid #333;
          }
          .mobile-nav-link {
              color: #eee; text-decoration: none; font-size: 1.2rem; padding: 15px;
              border-bottom: 1px solid #333; display: block; width: 100%; font-weight: 600;
          }
        }
      `}</style>

      <nav style={styles.nav}>
        {/* LOGO MEJORADO */}
        <Link to="/" style={styles.logo}>
          🎟️ <span className="brand-gradient">Poli</span>Eventos
        </Link>

        {/* ESCRITORIO */}
        <div className="desktop-links">
          {!isAuthenticated ? (
            <>
              <Link to="/login" style={styles.navLink} className="nav-hover">
                Iniciar Sesión
              </Link>
              <Link to="/register" style={styles.primaryBtn}>
                Crear Cuenta
              </Link>
            </>
          ) : (
            <div
              className="profile-container"
              style={{ position: "relative", marginLeft: "20px" }}
              ref={dropdownRef}
            >
              {/* Avatar con borde brillante */}
              <div
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={styles.avatarBtn}
              >
                <img
                  src={
                    user.avatar_url ||
                    `https://ui-avatars.com/api/?name=${user.nombre}&background=0D8ABC&color=fff`
                  }
                  alt="Avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              {/* Dropdown */}
              {isProfileOpen && (
                <div className="dropdown-menu">
                  <div
                    style={{
                      padding: "20px",
                      background:
                        "linear-gradient(135deg, #f6f8fd 0%, #f1f4f9 100%)",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        color: "#1e293b",
                        fontSize: "1.1rem",
                      }}
                    >
                      {user.nombre}
                    </strong>
                    <div
                      style={{
                        marginTop: "5px",
                        display: "inline-block",
                        padding: "2px 8px",
                        background: "#e0e7ff",
                        color: "#4338ca",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                      }}
                    >
                      {user.rol}
                    </div>
                  </div>

                  <Link
                    to="/perfil"
                    className="dropdown-item"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    👤 Mi Perfil
                  </Link>
                  <Link
                    to="/mis-tickets"
                    className="dropdown-item"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    🎟️ Mis Tickets
                  </Link>

                  {(user.rol === "VENDEDOR" || user.rol === "SUPER_USER") && (
                    <Link
                      to="/dashboard"
                      className="dropdown-item"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      ⚙️ Gestión de Eventos
                    </Link>
                  )}

                  <div
                    className="dropdown-item"
                    onClick={() => {
                      logout();
                      setIsProfileOpen(false);
                    }}
                    style={{
                      cursor: "pointer",
                      color: "#ef4444",
                      fontWeight: "bold",
                    }}
                  >
                    🚪 Cerrar Sesión
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* HAMBURGUESA */}
        <div
          className="mobile-hamburger"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isMobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </div>
      </nav>

      {/* MÓVIL EXPANDIDO */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          {isAuthenticated ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  padding: "15px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                }}
              >
                <img
                  src={
                    user.avatar_url ||
                    `https://ui-avatars.com/api/?name=${user.nombre}&background=random`
                  }
                  alt="Avatar"
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    border: "2px solid white",
                  }}
                />
                <div>
                  <div
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                    }}
                  >
                    {user.nombre}
                  </div>
                  <div style={{ color: "#aaa", fontSize: "0.8rem" }}>
                    {user.email}
                  </div>
                </div>
              </div>
              <Link
                to="/perfil"
                className="mobile-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                👤 Mi Perfil
              </Link>
              <Link
                to="/mis-tickets"
                className="mobile-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🎟️ Mis Tickets
              </Link>
              {(user.rol === "VENDEDOR" || user.rol === "SUPER_USER") && (
                <Link
                  to="/dashboard"
                  className="mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ⚙️ Gestión de Eventos
                </Link>
              )}
              <div
                className="mobile-nav-link"
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                style={{ color: "#ef4444", borderBottom: "none" }}
              >
                🚪 Cerrar Sesión
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="mobile-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="mobile-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Crear Cuenta
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 30px", // Más aire a los lados
    // ⭐️ EFECTO GLASSMORPHISM (Negro Transparente) ⭐️
    backgroundColor: "rgba(10, 10, 10, 0.85)",
    backdropFilter: "blur(12px)", // Esto hace el efecto borroso detrás
    borderBottom: "1px solid rgba(255,255,255,0.1)", // Línea sutil

    width: "100%",
    boxSizing: "border-box",
    height: "4rem", // Un poco más alta
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
    transition: "all 0.3s ease",
  },
  logo: {
    color: "white",
    textDecoration: "none",
    fontSize: "1.6rem",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  navLink: {
    color: "#ccc",
    textDecoration: "none",
    padding: "8px 16px",
    fontWeight: "500",
    fontSize: "0.95rem",
    transition: "0.3s",
  },
  primaryBtn: {
    background: "linear-gradient(90deg, #ff0080, #7928ca)", // Botón con gradiente
    color: "white",
    padding: "10px 24px",
    borderRadius: "50px",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "0.9rem",
    boxShadow: "0 4px 15px rgba(121, 40, 202, 0.4)",
    transition: "transform 0.2s",
  },
  avatarBtn: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.2)",
    cursor: "pointer",
    overflow: "hidden",
    transition: "all 0.2s",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
  },
};

export default Navbar;
