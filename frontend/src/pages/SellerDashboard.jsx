import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:3001/api/eventos";

function SellerDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  // ⭐️ ESTADOS PARA EL MODAL DE BORRADO ⭐️
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null); // Guardamos ID y Nombre para mostrar
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user || (user.rol !== "VENDEDOR" && user.rol !== "SUPER_USER")) {
      navigate("/");
    } else {
      cargarMisEventos();
    }
  }, [user]);

  const cargarMisEventos = async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard/mis-eventos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setEventos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Abrir Modal
  const openDeleteModal = (id, nombre) => {
    setEventToDelete({ id, nombre });
    setPassword("");
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  // 2. Confirmar Borrado (Llamada al API)
  const confirmDelete = async (e) => {
    e.preventDefault();
    if (!password) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`${API_URL}/${eventToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }), // 👈 Enviamos la contraseña
      });

      const data = await res.json();

      if (res.ok) {
        // Éxito: Quitamos el evento de la lista y cerramos modal
        setEventos(eventos.filter((e) => e.id !== eventToDelete.id));
        setDeleteModalOpen(false);
        setEventToDelete(null);
      } else {
        // Error: Mostramos mensaje (ej. "Contraseña incorrecta")
        setDeleteError(data.message);
      }
    } catch (err) {
      setDeleteError("Error de conexión.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Cargando panel...
      </div>
    );

  return (
    <div className="dashboard-container">
      {/* ⭐️ MODAL DE SEGURIDAD ⭐️ */}
      {deleteModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={styles.modalTitle}>⚠️ Borrar Evento</h3>
            <p style={styles.modalText}>
              Estás a punto de eliminar{" "}
              <strong>"{eventToDelete?.nombre}"</strong>. Esta acción borrará
              todas las compras y boletos asociados y
              <span style={{ color: "#d32f2f", fontWeight: "bold" }}>
                {" "}
                NO se puede deshacer.
              </span>
            </p>

            <form onSubmit={confirmDelete}>
              <label style={styles.label}>
                Ingresa tu contraseña para confirmar:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                style={styles.inputPass}
                autoFocus
              />

              {deleteError && <div style={styles.errorMsg}>{deleteError}</div>}

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  style={styles.cancelBtn}
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={styles.confirmDeleteBtn}
                  disabled={isDeleting || !password}
                >
                  {isDeleting ? "Borrando..." : "Sí, Borrar Evento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ESTILOS */}
      <style>{`
        .dashboard-container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px 20px;
            min-height: 80vh;
            font-family: system-ui, -apple-system, sans-serif;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 15px;
        }
        .header h1 { margin: 0; font-size: 1.8rem; color: #111; }
        
        .create-btn {
            background-color: #2563EB;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: bold;
            white-space: nowrap;
            transition: background 0.3s;
            box-shadow: 0 2px 5px rgba(37, 99, 235, 0.3);
        }
        .create-btn:hover { background-color: #1d4ed8; }

        /* TABLA ESCRITORIO */
        .responsive-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            background-color: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            border: 1px solid #e5e7eb;
        }
        .responsive-table thead { background-color: #f9fafb; }
        .responsive-table th { padding: 18px; text-align: left; color: #64748b; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
        .responsive-table td { padding: 18px; color: #334155; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .responsive-table tr:last-child td { border-bottom: none; }
        
        .link-name { font-weight: 600; color: #0f172a; text-decoration: none; font-size: 1rem; }
        .link-name:hover { color: #2563EB; text-decoration: underline; }
        
        .action-btn-group { display: flex; gap: 15px; align-items: center; justify-content: flex-end; }
        .edit-btn { text-decoration: none; color: #d97706; font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 5px; }
        .delete-btn { background: none; border: none; color: #ef4444; cursor: pointer; font-weight: 600; font-size: 0.9rem; padding: 0; display: flex; align-items: center; gap: 5px; }

        /* MÓVIL */
        @media (max-width: 768px) {
            .header { flex-direction: column; align-items: stretch; }
            .header h1 { text-align: center; margin-bottom: 10px; }
            .create-btn { text-align: center; }
            .responsive-table, .responsive-table thead, .responsive-table tbody, .responsive-table th, .responsive-table td, .responsive-table tr { display: block; }
            .responsive-table thead { display: none; }
            .responsive-table { background: transparent; box-shadow: none; border: none; }
            .responsive-table tr { background-color: white; margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 15px; }
            .responsive-table td { border: none; border-bottom: 1px solid #f1f5f9; position: relative; padding: 12px 0; text-align: left; display: flex; justify-content: space-between; align-items: center; }
            .responsive-table td:last-child { border-bottom: none; padding-bottom: 0; padding-top: 15px; }
            .responsive-table td:before { content: attr(data-label); font-weight: bold; color: #94a3b8; font-size: 0.75rem; text-transform: uppercase; margin-right: 10px; }
            .responsive-table td[data-label="Evento"] { font-size: 1.1rem; display: block; }
            .responsive-table td[data-label="Evento"]:before { display: none; }
            .action-btn-group { justify-content: space-between; width: 100%; }
            .edit-btn, .delete-btn { padding: 10px 20px; border-radius: 6px; background-color: #f8fafc; border: 1px solid #e2e8f0; width: 48%; justify-content: center; }
        }
      `}</style>

      <div className="header">
        <h1>📊 Panel de Administración</h1>
        <Link to="/create-event" className="create-btn">
          + Nuevo Evento
        </Link>
      </div>

      {eventos.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "50px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <h3>Aún no tienes eventos creados.</h3>
          <p style={{ color: "#666" }}>¡Empieza a vender boletos hoy mismo!</p>
        </div>
      ) : (
        <table className="responsive-table">
          <thead>
            <tr>
              <th style={{ width: "40%" }}>Evento</th>
              <th>Fecha</th>
              <th>Lugar</th>
              <th style={{ textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {eventos.map((evento) => (
              <tr key={evento.id}>
                <td data-label="Evento">
                  <Link to={`/evento/${evento.id}`} className="link-name">
                    {evento.nombre}
                  </Link>
                </td>
                <td data-label="Fecha">
                  {new Date(evento.fecha).toLocaleDateString()}
                </td>
                <td data-label="Lugar">
                  <span
                    style={{
                      display: "inline-block",
                      maxWidth: "150px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      verticalAlign: "bottom",
                    }}
                  >
                    {evento.lugar}
                  </span>
                </td>
                <td data-label="Acciones">
                  <div className="action-btn-group">
                    <Link to={`/edit-event/${evento.id}`} className="edit-btn">
                      ✏️ Editar
                    </Link>

                    {/* Botón modificado para abrir modal */}
                    <button
                      onClick={() => openDeleteModal(evento.id, evento.nombre)}
                      className="delete-btn"
                    >
                      🗑️ Borrar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ESTILOS DEL MODAL Y OBJETOS
const styles = {
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
    backdropFilter: "blur(4px)",
  },
  modalCard: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "16px",
    textAlign: "center",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  modalTitle: { marginTop: 0, color: "#B91C1C" },
  modalText: { color: "#555", fontSize: "0.95rem", lineHeight: "1.5" },
  label: {
    display: "block",
    textAlign: "left",
    fontWeight: "bold",
    marginTop: "20px",
    fontSize: "0.9rem",
    color: "#333",
  },
  inputPass: {
    width: "100%",
    padding: "12px",
    marginTop: "5px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  errorMsg: {
    color: "red",
    fontSize: "0.9rem",
    marginBottom: "15px",
    fontWeight: "bold",
  },
  modalActions: { display: "flex", gap: "10px", marginTop: "10px" },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#E5E7EB",
    color: "#374151",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  confirmDeleteBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#DC2626",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default SellerDashboard;
