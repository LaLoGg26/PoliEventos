require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { testConnection } = require("./config/db.connector");

// Importar rutas
const eventoRoutes = require("./routes/evento.routes");
const authRoutes = require("./routes/auth.routes"); // Rutas de Auth

const app = express();
const PORT = process.env.PORT || 3000;

// Probar conexión DB
testConnection();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.get("/", (req, res) => {
  res.json({ message: "¡Bienvenido a la API de Ticketera!" });
});

app.use("/api/auth", authRoutes); // Endpoint de Autenticación
app.use("/api/eventos", eventoRoutes); // Endpoint de Eventos

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
