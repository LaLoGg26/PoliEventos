const { pool } = require("../config/db.connector");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Obtener la clave secreta del .env
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10; // Número de rondas de sal para bcrypt

// 1. Funcion para Registra un nuevo usuario en la DB.
async function registerUser(
  nombre,
  email,
  password,
  telefono,
  rol = "COMPRADOR"
) {
  const connection = await pool.getConnection();
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query =
      "INSERT INTO usuarios (nombre, email, password, telefono, rol) VALUES (?, ?, ?, ?, ?)";
    const [result] = await connection.query(query, [
      nombre,
      email,
      hashedPassword,
      telefono,
      rol,
    ]);

    return { id: result.insertId, nombre, email, telefono, rol };
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("El correo electrónico ya está registrado.");
    }
    throw error;
  } finally {
    connection.release();
  }
}

// 2.Funcion para Loguea un usuario y genera un JWT.

async function loginUser(email, password) {
  const connection = await pool.getConnection();
  try {
    // 1. Buscar usuario por email
    const query =
      "SELECT id, nombre, email, password, rol, suscripcion_activa, avatar_url FROM usuarios WHERE email = ?";
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
        suscripcion_activa: user.suscripcion_activa,
        avatar_url: user.avatar_url,
      },
    };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

// 3. Función Genérica para Actualizar Perfil (Nombre, Password, Avatar)
async function updateUserProfile(userId, data) {
  const connection = await pool.getConnection();
  try {
    // Construcción dinámica de la query
    let fields = [];
    let values = [];

    if (data.nombre) {
      fields.push("nombre = ?");
      values.push(data.nombre);
    }
    if (data.avatar_url) {
      fields.push("avatar_url = ?");
      values.push(data.avatar_url);
    }
    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      fields.push("password = ?");
      values.push(hashedPassword);
    }

    if (fields.length === 0) return null; // Nada que actualizar

    values.push(userId); // El ID va al final para el WHERE

    const query = `UPDATE usuarios SET ${fields.join(", ")} WHERE id = ?`;
    await connection.query(query, values);

    // Devolver usuario actualizado (sin password) para refrescar el token/frontend
    const [rows] = await connection.query(
      "SELECT id, nombre, email, rol, suscripcion_activa, avatar_url FROM usuarios WHERE id = ?",
      [userId]
    );
    return rows[0];
  } finally {
    connection.release();
  }
}

// 4. Función para "Comprar" Membresía de Vendedor
async function upgradeToSeller(userId) {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      "UPDATE usuarios SET rol = 'VENDEDOR', suscripcion_activa = 1 WHERE id = ?",
      [userId]
    );
    // Devolver usuario actualizado
    const [rows] = await connection.query(
      "SELECT id, nombre, email, rol, suscripcion_activa, avatar_url FROM usuarios WHERE id = ?",
      [userId]
    );
    return rows[0];
  } finally {
    connection.release();
  }
}

module.exports = {
  registerUser,
  loginUser,
  updateUserProfile,
  upgradeToSeller,
};
