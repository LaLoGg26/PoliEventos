const authService = require("../services/auth.service");

// Controlador POST /api/auth/register
async function register(req, res) {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password) {
    return res
      .status(400)
      .json({ message: "Todos los campos son requeridos." });
  }

  try {
    // Si no se especifica el rol, se registra como COMPRADOR por defecto
    const defaultRol = rol || "COMPRADOR";

    // Nota: En una aplicación real, solo un SUPER_USER podría asignar otros roles.
    // Aquí permitiremos crear usuarios por defecto.

    const newUser = await authService.registerUser(
      nombre,
      email,
      password,
      defaultRol
    );
    res.status(201).json({
      message: "Registro exitoso.",
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email,
        rol: newUser.rol,
      },
    });
  } catch (error) {
    // Manejar el error de duplicidad de email
    if (error.message.includes("correo electrónico")) {
      return res.status(409).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: "Error interno del servidor durante el registro." });
  }
}

// Controlador POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email y contraseña son requeridos." });
  }

  try {
    const { token, user } = await authService.loginUser(email, password);
    res.json({ token, user });
  } catch (error) {
    // Manejar el error de credenciales inválidas
    if (error.message.includes("Credenciales inválidas")) {
      return res.status(401).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: "Error interno del servidor durante el login." });
  }
}

module.exports = {
  register,
  login,
};
