import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:3001/api/eventos";

function SellerDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "¿Estás seguro de eliminar este evento? No se puede deshacer."
      )
    )
      return;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // Recargar lista
        setEventos(eventos.filter((e) => e.id !== id));
        alert("Evento eliminado.");
      } else {
        alert("Error al eliminar");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Cargando panel...
      </div>
    );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>📊 Panel de Administración</h1>
        <Link to="/create-event" style={styles.createBtn}>
          + Nuevo Evento
        </Link>
      </div>

      {eventos.length === 0 ? (
        <div style={styles.emptyState}>
          <h3>Aún no tienes eventos creados.</h3>
          <p>¡Empieza a vender boletos hoy mismo!</p>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.trHead}>
              <th style={styles.th}>Evento</th>
              <th style={styles.th}>Fecha</th>
              <th style={styles.th}>Lugar</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {eventos.map((evento) => (
              <tr key={evento.id} style={styles.tr}>
                <td style={styles.td}>
                  <Link to={`/evento/${evento.id}`} style={styles.linkName}>
                    {evento.nombre}
                  </Link>
                </td>
                <td style={styles.td}>
                  {new Date(evento.fecha).toLocaleDateString()}
                </td>
                <td style={styles.td}>{evento.lugar}</td>
                <td style={styles.td}>
                  <Link to={`/edit-event/${evento.id}`} style={styles.editBtn}>
                    ✏️ Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(evento.id)}
                    style={styles.deleteBtn}
                  >
                    🗑️ Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "40px 20px",
    minHeight: "80vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  createBtn: {
    backgroundColor: "#2563EB",
    color: "white",
    textDecoration: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "bold",
  },
  emptyState: {
    textAlign: "center",
    padding: "50px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  trHead: { backgroundColor: "#f3f4f6", borderBottom: "2px solid #e5e7eb" },
  th: { padding: "15px", textAlign: "left", color: "#555" },
  tr: { borderBottom: "1px solid #eee" },
  td: { padding: "15px", color: "#333" },
  linkName: { fontWeight: "bold", color: "#2563EB", textDecoration: "none" },
  editBtn: {
    marginRight: "10px",
    textDecoration: "none",
    color: "#F59E0B",
    fontWeight: "bold",
    fontSize: "0.9rem",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#EF4444",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.9rem",
  },
};

export default SellerDashboard;
