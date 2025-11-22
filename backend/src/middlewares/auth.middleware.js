const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware para verificar si el usuario está autenticado y guardar los datos del usuario en req.user
 */
function protect(req, res, next) {
  let token;

  // 1. Buscar el token en el header Authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extraer el token (Bearer [token])
      token = req.headers.authorization.split(" ")[1];

      // 2. Decodificar/Verificar el token
      const decoded = jwt.verify(token, JWT_SECRET);

      // 3. Adjuntar los datos del usuario al objeto de solicitud (req.user)
      req.user = decoded;
      next();
    } catch (error) {
      // Error si el token es inválido o expiró
      res.status(401).json({ message: "No autorizado, token inválido." });
    }
  }

  if (!token) {
    res.status(401).json({ message: "No autorizado, no se encontró token." });
  }
}

/**
 * Middleware para restringir el acceso basado en roles.
 * Ejemplo: authorize('SUPER_USER', 'VENDEDOR')
 */
function authorize(...roles) {
  return (req, res, next) => {
    // req.user viene del middleware protect
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        message: `Acceso denegado. Rol ${req.user.rol} no autorizado para esta acción.`,
      });
    }
    next();
  };
}

function checkSubscription(req, res, next) {
  // 1. Verificar Rol: Debe ser VENDEDOR o SUPER_USER
  const allowedRoles = ["VENDEDOR", "SUPER_USER"];
  if (!allowedRoles.includes(req.user.rol)) {
    return res.status(403).json({
      message:
        "Permiso denegado. Solo Vendedores y Super Usuarios pueden realizar esta acción.",
    });
  }

  // 2. Verificar Suscripción (solo para VENDEDORES)
  if (req.user.rol === "VENDEDOR" && req.user.suscripcion_activa !== 1) {
    return res.status(403).json({
      message:
        "Acceso denegado. Se requiere una suscripción activa para crear eventos.",
    });
  }

  // Si pasa ambas verificaciones
  next();
}

module.exports = {
  protect,
  authorize,
  checkSubscription,
};
