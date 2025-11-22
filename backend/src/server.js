require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { testConnection } = require("./config/db.connector");
const eventoRoutes = require("./routes/evento.routes"); // Importar rutas
const authRoutes = require("./routes/auth.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Probar la conexión a la DB
testConnection();

// Configuración de Middlewares
app.use(cors());
app.use(express.json()); // Necesario para parsear el body de POST/comprar

// Rutas
app.get("/", (req, res) => {
  res.json({ message: "¡Bienvenido a la API de Ticketera!" });
});

// Rutas de Autenticación
app.use("/api/auth", authRoutes);

// Rutas de Eventos
app.use("/api/eventos", eventoRoutes); // Conectar las rutas de eventos

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Accede a: http://localhost:${PORT}`);
});
