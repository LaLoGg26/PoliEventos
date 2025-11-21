// Este archivo obtiene las variables de entorno para la conexión a MySQL
const dbConfig = {
  // Usamos el operador || para un valor de respaldo si la variable no existe
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "root", // Tu usuario de MySQL
  PASSWORD: process.env.DB_PASSWORD || "1234", // Tu contraseña
  DB: process.env.DB_NAME || "poliEventos_db", // El nombre de la base de datos
};

module.exports = dbConfig;
