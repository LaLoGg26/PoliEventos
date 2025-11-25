const authService = require("../services/auth.service");

// Controlador POST /api/auth/register
async function register(req, res) {
  const { nombre, email, password, telefono, rol } = req.body; // 👈 Recibir telefono

  if (!nombre || !email || !password || !telefono) {
    // 👈 Validar telefono
    return res
      .status(400)
      .json({ message: "Todos los campos son requeridos." });
  }

  try {
    const defaultRol = rol || "COMPRADOR";

    const newUser = await authService.registerUser(
      nombre,
      email,
      password,
      telefono,
      defaultRol
    );
    res.status(201).json({
      message: "Registro exitoso.",
      user: newUser,
    });
  } catch (error) {
    if (error.message.includes("correo electrónico")) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: "Error interno del servidor." });
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

// Actualizar Perfil
async function updateProfile(req, res) {
  try {
    const updates = {
      nombre: req.body.nombre,
      password: req.body.password,
    };

    // Si Multer procesó una imagen, la agregamos
    if (req.file) {
      updates.avatar_url = req.file.path;
    }

    const updatedUser = await authService.updateUserProfile(
      req.user.id,
      updates
    );

    if (!updatedUser) {
      return res
        .status(400)
        .json({ message: "No se enviaron datos para actualizar." });
    }

    res.json({ message: "Perfil actualizado", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Mejorar Plan a Vendedor
async function upgradeUser(req, res) {
  try {
    // Aquí podrías integrar Stripe en el futuro. Por ahora es directo.
    const updatedUser = await authService.upgradeToSeller(req.user.id);
    res.json({
      message: "¡Felicidades! Ahora eres Vendedor.",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  register,
  login,
  updateProfile, // 👈 Nuevo
  upgradeUser, // 👈 Nuevo
};
