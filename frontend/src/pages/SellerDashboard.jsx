import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:3001/api/eventos"; // Ajusta esto a tu VITE_API_URL si estás en producción

function SellerDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verificar si es admin para mostrar columnas extra
  const isSuper = user?.rol === "SUPER_USER";

  // Protección de ruta
  useEffect(() => {
    if (!user || (user.rol !== "VENDEDOR" && user.rol !== "SUPER_USER")) {
      navigate("/");
    } else {
      cargarMisEventos();
    }
  }, [user]);

  // Cargar eventos desde el backend
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

  // Función para borrar evento (con confirmación de contraseña)
  const handleDelete = async (id, nombreEvento) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar el evento "${nombreEvento}"? Se borrará TODO el historial de compras y boletos asociados.`
      )
    )
      return;

    try {
      const password = prompt(
        "Por seguridad, ingresa TU contraseña para confirmar el borrado:"
      );
      if (!password) return; // Si cancela el prompt

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
        // Borrado exitoso: quitar de la lista localmente
        setEventos(eventos.filter((e) => e.id !== id));
        alert("Evento eliminado correctamente.");
      } else {
        // Error (ej. contraseña incorrecta)
        alert("Error: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión.");
    }
  };

  if (loading)
    return (
      <div
        style={{
          padding: "60px",
          textAlign: "center",
          color: "#666",
          fontSize: "1.2rem",
        }}
      >
        Cargando panel...
      </div>
    );

  return (
    <div className="dashboard-container">
      {/* ESTILOS CSS INTEGRADOS */}
      <style>{`
        .dashboard-container {
            max-width: 1200px;
            margin: 40px auto;
            padding: 0 20px;
            min-height: 80vh;
            font-family: system-ui, -apple-system, sans-serif;
        }
        
        /* CABECERA DEL DASHBOARD */
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
            flex-wrap: wrap; gap: 20px;
        }
        .header-dash h1 { margin: 0; font-size: 1.8rem; color: #1e293b; font-weight: 800; }
        
        .header-actions { display: flex; gap: 15px; }

        .action-btn {
            text-decoration: none; padding: 12px 24px; border-radius: 50px; font-weight: bold; font-size: 0.95rem;
            transition: all 0.2s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            display: inline-flex; align-items: center; gap: 8px; cursor: pointer; border: none;
        }
        .create-btn { background-color: #2563EB; color: white; }
        .create-btn:hover { background-color: #1d4ed8; transform: translateY(-2px); }
        .scan-btn { background-color: #111; color: white; }
        .scan-btn:hover { background-color: #333; transform: translateY(-2px); }

        /* --- TABLA ESCRITORIO (Se oculta en móvil) --- */
        .desktop-table {
            width: 100%; border-collapse: collapse; background-color: white;
            border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            border: 1px solid #e2e8f0;
        }
        .desktop-table th { 
            background-color: #f8fafc; text-align: left; padding: 18px; 
            color: #64748b; font-size: 0.85rem; text-transform: uppercase; 
            font-weight: 700; border-bottom: 1px solid #e2e8f0; 
        }
        .desktop-table td { 
            padding: 18px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; 
        }
        .desktop-table tr:last-child td { border-bottom: none; }
        
        .event-link { font-weight: 700; color: #0f172a; text-decoration: none; font-size: 1.05rem; }
        .event-link:hover { color: #2563EB; text-decoration: underline; }

        .actions-cell { display: flex; gap: 15px; justify-content: flex-end; }
        .table-btn {
            text-decoration: none; font-weight: 600; font-size: 0.9rem; 
            display: inline-flex; align-items: center; gap: 5px;
            padding: 8px 12px; border-radius: 8px; transition: background 0.2s;
        }
        .edit-action { color: #d97706; background: #fff7ed; }
        .edit-action:hover { background: #ffedd5; }
        .delete-action { color: #dc2626; background: #fef2f2; border: none; cursor: pointer; }
        .delete-action:hover { background: #fee2e2; }

        /* --- TARJETAS MÓVILES (Se ocultan en escritorio) --- */
        .mobile-cards { display: none; }

        /* MEDIA QUERY: MÓVIL */
        @media (max-width: 768px) {
            .dashboard-container { margin: 20px auto; }
            .desktop-table { display: none; } /* Ocultar tabla */
            .mobile-cards { display: flex; flexDirection: column; gap: 20px; width: 100%; } /* Mostrar tarjetas */
            
            .header-dash { flex-direction: column; text-align: center; padding: 20px; }
            .header-actions { flex-direction: column; width: 100%; }
            .action-btn { width: 100%; justify-content: center; }

            .event-card {
                background: white; padding: 20px; border-radius: 16px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; 
            }
            .card-header { margin-bottom: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
            .card-title { font-size: 1.3rem; font-weight: 800; color: #1e293b; text-decoration: none; display: block; }
            
            .card-data { display: flex; flex-direction: column; gap: 8px; color: #64748b; }
            .card-data span { display: flex; align-items: center; gap: 8px; }
            
            .card-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px; }
            .card-btn { padding: 12px; border-radius: 10px; text-align: center; font-weight: bold; text-decoration: none; cursor: pointer; border: 1px solid transparent; }
            .btn-edit { background: #fff7ed; color: #c2410c; border-color: #ffedd5; }
            .btn-del { background: #fef2f2; color: #b91c1c; border-color: #fee2e2; }
        }
      `}</style>

      <div className="header-dash">
        <h1>📊 {isSuper ? "Super Admin Panel" : "Panel de Vendedor"}</h1>
        <div className="header-actions">
          {/* Botón Escáner */}
          <Link to="/scanner" className="action-btn scan-btn">
            📷 Escanear Boletos
          </Link>
          {/* Botón Nuevo Evento */}
          <Link to="/create-event" className="action-btn create-btn">
            <span style={{ fontSize: "1.2rem", lineHeight: 0 }}>+</span> Nuevo
            Evento
          </Link>
        </div>
      </div>

      {eventos.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            backgroundColor: "white",
            borderRadius: "16px",
            color: "#666",
            border: "2px dashed #e2e8f0",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🎟️</div>
          <h3>No tienes eventos activos.</h3>
          <p>¡Crea tu primer evento y empieza a vender!</p>
        </div>
      ) : (
        <>
          {/* --- VISTA DE ESCRITORIO (TABLA) --- */}
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
                  <td style={{ fontWeight: "500" }}>
                    <Link to={`/evento/${evento.id}`} className="event-link">
                      {evento.nombre}
                    </Link>
                  </td>

                  {/* DATO CONDICIONAL */}
                  {isSuper && (
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span
                          style={{
                            fontWeight: "700",
                            fontSize: "0.95rem",
                            color: "#334155",
                          }}
                        >
                          {evento.vendedor_nombre}
                        </span>
                        <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                          {evento.vendedor_email}
                        </span>
                      </div>
                    </td>
                  )}

                  <td>
                    {new Date(evento.fecha).toLocaleDateString(undefined, {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td>{evento.lugar}</td>
                  <td>
                    <div className="actions-cell">
                      <Link
                        to={`/edit-event/${evento.id}`}
                        className="table-btn edit-action"
                      >
                        ✏️ Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(evento.id, evento.nombre)}
                        className="table-btn delete-action"
                      >
                        🗑️ Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* --- VISTA MÓVIL (TARJETAS) --- */}
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
                        marginTop: "8px",
                        fontSize: "0.9rem",
                        color: "#666",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      👤{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {evento.vendedor_nombre}
                      </span>{" "}
                      ({evento.vendedor_email})
                    </div>
                  )}
                </div>

                <div className="card-data">
                  <span>
                    📅{" "}
                    {new Date(evento.fecha).toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span>📍 {evento.lugar}</span>
                </div>

                <div className="card-actions">
                  <Link
                    to={`/edit-event/${evento.id}`}
                    className="card-btn btn-edit"
                  >
                    ✏️ Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(evento.id, evento.nombre)}
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
