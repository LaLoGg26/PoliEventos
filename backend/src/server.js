// 1. Cargar variables de entorno inmediatamente
require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Importa el conector a la base de datos
const { testConnection } = require("./config/db.connector");

const app = express();
const PORT = process.env.PORT || 3000; // Tomar el puerto del .env o usar 3000

// 2. Configuración de Middlewares
app.use(cors()); // Permite peticiones desde otros dominios (tu frontend)
app.use(express.json()); // Permite que el servidor entienda peticiones con body JSON

// Importar el módulo de rutas de eventos
const eventoRoutes = require("./routes/evento.routes");

// 3. Ruta de prueba (Endpoint de bienvenida)
app.get("/", (req, res) => {
  res.json({ message: "¡Bienvenido a la API de Ticketera!" });
});

// Nota: Aquí se agregarán las rutas de eventos más tarde:
// const eventoRoutes = require('./routes/evento.routes');
// app.use('/api/eventos', eventoRoutes);

// 4. Conectar las rutas de eventos bajo el prefijo /api/eventos
app.use("/api/eventos", eventoRoutes);

// 5. Iniciar el servidor...
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Accede a: http://localhost:${PORT}`);
});
