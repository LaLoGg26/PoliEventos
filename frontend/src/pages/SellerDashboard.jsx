import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:3001") + "/api/eventos";

function SellerDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleDelete = async (id, nombreEvento) => {
    if (!window.confirm(`¿Eliminar "${nombreEvento}"?`)) return;
    try {
      const password = prompt("🔒 Confirma con tu contraseña:");
      if (!password) return;
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setEventos((prev) => prev.filter((e) => e.id !== id));
        alert("Evento eliminado.");
      } else {
        alert("Error al eliminar");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- ESTADÍSTICAS ---
  const eventosFiltrados = useMemo(
    () =>
      eventos.filter((e) =>
        e.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [eventos, searchTerm]
  );

  const stats = useMemo(() => {
    const totalGanancias = eventos.reduce(
      (acc, curr) => acc + curr.ganancias,
      0
    );
    const totalBoletos = eventos.reduce((acc, curr) => acc + curr.vendidos, 0);
    return { totalGanancias, totalBoletos, totalEventos: eventos.length };
  }, [eventos]);

  // Gráfica simplificada: Solo Ingresos por Evento
  const dataGrafica = eventos.slice(0, 8).map((e) => ({
    name: e.nombre.length > 10 ? e.nombre.substring(0, 10) + "..." : e.nombre,
    Ingresos: e.ganancias,
  }));

  if (loading)
    return (
      <div style={{ padding: "60px", textAlign: "center" }}>Cargando...</div>
    );

  return (
    <div className="dashboard-container">
      <style>{`
        .dashboard-container { max-width: 1200px; margin: 40px auto; padding: 0 20px; min-height: 80vh; font-family: 'Segoe UI', system-ui, sans-serif; }
        
        /* Header */
        .header-dash { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; gap: 20px; }
        .header-title h1 { margin: 0; font-size: 1.8rem; color: #1e293b; font-weight: 800; }
        .search-input { padding: 10px 20px; border-radius: 50px; border: 1px solid #e2e8f0; width: 300px; outline: none; }
        
        .action-group { display: flex; gap: 10px; }
        .create-btn { background: #2563EB; color: white; padding: 10px 20px; border-radius: 50px; text-decoration: none; font-weight: bold; display: flex; align-items: center; gap: 5px; }
        .scan-btn { background: #1e293b; color: white; padding: 10px 20px; border-radius: 50px; text-decoration: none; font-weight: bold; display: flex; align-items: center; gap: 5px; }

        /* Stats Cards */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; text-align: center; }
        .stat-val { font-size: 1.8rem; font-weight: 800; color: #0f172a; }
        .stat-lbl { font-size: 0.85rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }

        /* Gráfica */
        .chart-section { background: white; padding: 25px; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 4px 15px rgba(0,0,0,0.03); margin-bottom: 40px; height: 350px; }
        
        /* Tabla */
        .table-container { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
        .responsive-table { width: 100%; border-collapse: collapse; }
        .responsive-table th { background: #f8fafc; padding: 15px; text-align: left; color: #64748b; font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
        .responsive-table td { padding: 15px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
        
        /* Estilos del Desglose de Boletos */
        .ticket-breakdown { display: flex; flex-direction: column; gap: 5px; }
        .breakdown-item { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; }
        .zone-name { font-weight: 600; color: #475569; }
        .zone-count { background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 10px; font-weight: bold; font-size: 0.75rem; }
        .progress-bg { width: 100px; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; margin-left: 10px; }
        .progress-fill { height: 100%; background: #2563EB; border-radius: 3px; }

        .action-icons { display: flex; gap: 10px; justify-content: flex-end; }
        .btn-icon { cursor: pointer; background: none; border: none; font-size: 1.1rem; transition: transform 0.2s; }
        .btn-icon:hover { transform: scale(1.2); }

        /* Móvil */
        .mobile-cards { display: none; }
        @media (max-width: 768px) {
            .desktop-table { display: none; }
            .mobile-cards { display: flex; flexDirection: column; gap: 15px; }
            .event-card { background: white; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; }
            .card-title { font-size: 1.1rem; font-weight: 800; color: #2563EB; display: block; margin-bottom: 10px; text-decoration: none; }
            .header-dash { flex-direction: column; text-align: center; }
            .search-input { width: 100%; box-sizing: border-box; }
        }
      `}</style>

      {/* Header */}
      <div className="header-dash">
        <div className="header-title">
          <h1>📊 {isSuper ? "Admin Global" : "Tu Panel"}</h1>
        </div>
        <input
          type="text"
          placeholder="🔎 Filtrar eventos..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="action-group">
          <Link to="/scanner" className="scan-btn">
            📷 Escáner
          </Link>
          <Link to="/create-event" className="create-btn">
            <span>+</span> Crear
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-lbl">Ingresos Totales</div>
          <div className="stat-val" style={{ color: "#10B981" }}>
            ${stats.totalGanancias.toLocaleString()}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Boletos Vendidos</div>
          <div className="stat-val" style={{ color: "#3B82F6" }}>
            {stats.totalBoletos}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">Eventos</div>
          <div className="stat-val" style={{ color: "#6366f1" }}>
            {stats.totalEventos}
          </div>
        </div>
      </div>

      {/* Gráfica (Solo Ingresos) */}
      {eventos.length > 0 && (
        <div className="chart-section">
          <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>
            💰 Ingresos por Evento
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataGrafica}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b" }}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  borderRadius: "10px",
                  border: "none",
                  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                }}
              />
              <Bar
                dataKey="Ingresos"
                fill="#10B981"
                radius={[6, 6, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabla con Desglose */}
      {eventosFiltrados.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "50px",
            background: "white",
            borderRadius: "16px",
          }}
        >
          No hay eventos.
        </div>
      ) : (
        <>
          <div className="table-container desktop-table">
            <table className="responsive-table">
              <thead>
                <tr>
                  <th style={{ width: "25%" }}>Evento</th>
                  <th>Desglose de Ventas</th>
                  <th>Total $</th>
                  <th>Fecha</th>
                  <th style={{ textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {eventosFiltrados.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <Link to={`/evento/${e.id}`} className="event-link">
                        {e.nombre}
                      </Link>
                    </td>

                    {/* COLUMNA NUEVA: DESGLOSE VISUAL */}
                    <td>
                      <div className="ticket-breakdown">
                        {e.desglose &&
                          e.desglose.map((tipo, idx) => (
                            <div key={idx} className="breakdown-item">
                              <span className="zone-name">{tipo.zona}</span>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <span className="zone-count">
                                  {tipo.vendidos}/{tipo.total}
                                </span>
                                {/* Barrita de progreso mini */}
                                <div className="progress-bg">
                                  <div
                                    className="progress-fill"
                                    style={{
                                      width: `${Math.min(
                                        (tipo.vendidos / tipo.total) * 100,
                                        100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </td>

                    <td style={{ fontWeight: "bold", color: "#10B981" }}>
                      ${e.ganancias.toLocaleString()}
                    </td>
                    <td>{new Date(e.fecha).toLocaleDateString()}</td>

                    <td className="actions-cell">
                      <Link
                        to={`/edit-event/${e.id}`}
                        className="btn-icon"
                        title="Editar"
                      >
                        ✏️
                      </Link>
                      <button
                        onClick={() => handleDelete(e.id, e.nombre)}
                        className="btn-icon"
                        title="Borrar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Móvil (Simplificado) */}
          <div className="mobile-cards">
            {eventosFiltrados.map((e) => (
              <div key={e.id} className="event-card">
                <Link to={`/evento/${e.id}`} className="card-title">
                  {e.nombre}
                </Link>
                <div
                  style={{
                    margin: "10px 0",
                    padding: "10px",
                    background: "#f8fafc",
                    borderRadius: "8px",
                  }}
                >
                  {e.desglose &&
                    e.desglose.map((tipo, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.85rem",
                          marginBottom: "5px",
                        }}
                      >
                        <span>{tipo.zona}</span>
                        <strong>{tipo.vendidos} vendidos</strong>
                      </div>
                    ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "10px",
                  }}
                >
                  <Link
                    to={`/edit-event/${e.id}`}
                    style={{
                      color: "#d97706",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    ✏️ Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(e.id, e.nombre)}
                    style={{
                      color: "#dc2626",
                      background: "none",
                      border: "none",
                      fontWeight: "bold",
                    }}
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
