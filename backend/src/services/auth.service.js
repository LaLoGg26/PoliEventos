const { pool } = require("../config/db.connector");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Obtener la clave secreta del .env
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10; // Número de rondas de sal para bcrypt

/**
 * Registra un nuevo usuario en la DB.
 */
async function registerUser(nombre, email, password, rol = "COMPRADOR") {
  const connection = await pool.getConnection();
  try {
    // 1. Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 2. Insertar en la DB
    const query =
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)";
    const [result] = await connection.query(query, [
      nombre,
      email,
      hashedPassword,
      rol,
    ]);

    // Retornar el ID del nuevo usuario
    return { id: result.insertId, nombre, email, rol };
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("El correo electrónico ya está registrado.");
    }
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Loguea un usuario y genera un JWT.
 */
async function loginUser(email, password) {
  const connection = await pool.getConnection();
  try {
    // 1. Buscar usuario por email
    const query =
      "SELECT id, nombre, email, password, rol, suscripcion_activa FROM usuarios WHERE email = ?";
    const [rows] = await connection.query(query, [email]);

    if (rows.length === 0) {
      throw new Error("Credenciales inválidas.");
    }

    const user = rows[0];

    // 2. Comparar la contraseña ingresada con el hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Credenciales inválidas.");
    }

    // 3. Generar el JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol: user.rol,
        suscripcion_activa: user.suscripcion_activa,
      },
      JWT_SECRET,
      { expiresIn: "1h" } // El token expira en 1 hora
    );

    // Retornar el token y la información básica del usuario
    return {
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        suscripcion_activa: user.suscripcion_activa, // ⭐️ NUEVO CAMPO ⭐️
      },
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  registerUser,
  loginUser,
};
