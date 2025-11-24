import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:3001/api/eventos";

function SellerDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verificar si es admin para mostrar columnas extra
  const isSuper = user?.rol === "SUPER_USER";

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
        "¿Estás seguro de eliminar este evento? Se borrará todo el historial."
      )
    )
      return;

    try {
      // NOTA: Como Super Usuario, la contraseña requerida será la TUYA
      const password = prompt(
        "Por seguridad, ingresa TU contraseña para confirmar el borrado:"
      );
      if (!password) return;

      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const result = await res.json();

      if (res.ok) {
        setEventos(eventos.filter((e) => e.id !== id));
        alert("Evento eliminado.");
      } else {
        alert("Error: " + result.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "#666" }}>
        Cargando panel...
      </div>
    );

  return (
    <div className="dashboard-container">
      <style>{`
        .dashboard-container {
            max-width: 1100px; /* Un poco más ancho para caber la columna extra */
            margin: 0 auto;
            padding: 20px;
            min-height: 80vh;
            font-family: system-ui, -apple-system, sans-serif;
        }
        
        .header-dash {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            background-color: white;
            padding: 25px;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.03);
            border: 1px solid #f1f5f9;
        }
        .header-dash h1 { margin: 0; font-size: 1.6rem; color: #1e293b; font-weight: 800; }
        
        .create-btn {
            background-color: #2563EB; color: white; text-decoration: none;
            padding: 12px 24px; border-radius: 50px; font-weight: bold; font-size: 0.95rem;
            transition: all 0.2s ease; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
            display: inline-flex; align-items: center; gap: 8px;
        }
        .create-btn:hover { background-color: #1d4ed8; transform: translateY(-2px); }

        /* --- TABLA ESCRITORIO --- */
        .desktop-table {
            width: 100%; border-collapse: collapse; background-color: white;
            border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .desktop-table th { background-color: #f8fafc; text-align: left; padding: 18px; color: #64748b; font-size: 0.85rem; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid #e2e8f0; }
        .desktop-table td { padding: 18px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
        
        .event-link { font-weight: 700; color: #0f172a; text-decoration: none; font-size: 1rem; }
        .event-link:hover { color: #2563EB; text-decoration: underline; }

        .vendor-tag {
            background-color: #e0e7ff; color: #3730a3; padding: 4px 10px;
            border-radius: 20px; font-size: 0.75rem; fontWeight: bold; display: inline-block;
        }

        .actions { display: flex; gap: 15px; justify-content: flex-end; }
        .edit-action { color: #d97706; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
        .delete-action { color: #dc2626; background: none; border: none; font-weight: 600; cursor: pointer; font-size: 0.9rem; }

        /* --- TARJETAS MÓVILES --- */
        .mobile-cards { display: none; }

        @media (max-width: 768px) {
            .desktop-table { display: none; }
            .mobile-cards { display: flex; flexDirection: column; gap: 20px; width: 100%; }
            
            .header-dash { flex-direction: column; gap: 20px; text-align: center; padding: 20px; }
            .create-btn { width: 100%; justify-content: center; padding: 15px; box-sizing: border-box; }

            .event-card {
                background: white; padding: 20px; border-radius: 16px;
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; width: 100%; box-sizing: border-box;
            }
            .card-header { margin-bottom: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
            .card-title { font-size: 1.3rem; font-weight: 800; color: #1e293b; text-decoration: none; display: block; }
            
            .card-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; color: #64748b; font-size: 1rem; }
            .card-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px; }
            
            .card-btn { padding: 12px; border-radius: 10px; text-align: center; font-weight: bold; text-decoration: none; cursor: pointer; border: 1px solid transparent; }
            .btn-edit { background: #fff7ed; color: #c2410c; border-color: #ffedd5; }
            .btn-del { background: #fef2f2; color: #b91c1c; border-color: #fee2e2; }
        }
      `}</style>

      <div className="header-dash">
        <h1>📊 {isSuper ? "Super Admin Panel" : "Panel de Vendedor"}</h1>
        <Link to="/create-event" className="create-btn">
          <span style={{ fontSize: "1.2rem", lineHeight: 0 }}>+</span> Nuevo
          Evento
        </Link>
      </div>

      {eventos.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "white",
            borderRadius: "16px",
            color: "#666",
          }}
        >
          <h3>No hay eventos registrados.</h3>
        </div>
      ) : (
        <>
          {/* VISTA DE ESCRITORIO */}
          <table className="desktop-table">
            <thead>
              <tr>
                <th>Evento</th>
                {/* COLUMNA CONDICIONAL: Solo si es Super Usuario */}
                {isSuper && <th>Vendedor</th>}
                <th>Fecha</th>
                <th>Lugar</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((evento) => (
                <tr key={evento.id}>
                  <td>
                    <Link to={`/evento/${evento.id}`} className="event-link">
                      {evento.nombre}
                    </Link>
                  </td>

                  {/* DATO CONDICIONAL */}
                  {isSuper && (
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span
                          style={{ fontWeight: "bold", fontSize: "0.9rem" }}
                        >
                          {evento.vendedor_nombre}
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "#888" }}>
                          {evento.vendedor_email}
                        </span>
                      </div>
                    </td>
                  )}

                  <td>{new Date(evento.fecha).toLocaleDateString()}</td>
                  <td>{evento.lugar}</td>
                  <td className="actions">
                    <Link
                      to={`/edit-event/${evento.id}`}
                      className="edit-action"
                    >
                      ✏️ Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(evento.id)}
                      className="delete-action"
                    >
                      🗑️ Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* VISTA MÓVIL */}
          <div className="mobile-cards">
            {eventos.map((evento) => (
              <div key={evento.id} className="event-card">
                <div className="card-header">
                  <Link to={`/evento/${evento.id}`} className="card-title">
                    {evento.nombre}
                  </Link>
                  {/* Etiqueta de vendedor en móvil */}
                  {isSuper && (
                    <div
                      style={{
                        marginTop: "5px",
                        fontSize: "0.85rem",
                        color: "#666",
                      }}
                    >
                      👤 {evento.vendedor_nombre}
                    </div>
                  )}
                </div>
                <div className="card-row">
                  <span>📅</span> {new Date(evento.fecha).toLocaleDateString()}
                </div>
                <div className="card-row">
                  <span>📍</span> {evento.lugar}
                </div>
                <div className="card-actions">
                  <Link
                    to={`/edit-event/${evento.id}`}
                    className="card-btn btn-edit"
                  >
                    ✏️ Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(evento.id)}
                    className="card-btn btn-del"
                  >
                    🗑️ Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default SellerDashboard;
