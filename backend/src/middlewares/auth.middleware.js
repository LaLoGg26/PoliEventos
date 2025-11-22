const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function protect(req, res, next) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "No autorizado, token inválido." });
    }
  }
  if (!token) {
    res.status(401).json({ message: "No autorizado, no se encontró token." });
  }
}

function checkSubscription(req, res, next) {
  const allowedRoles = ["VENDEDOR", "SUPER_USER"];
  if (!allowedRoles.includes(req.user.rol)) {
    return res
      .status(403)
      .json({ message: "Permiso denegado. Rol no autorizado." });
  }
  if (req.user.rol === "VENDEDOR" && req.user.suscripcion_activa !== 1) {
    return res
      .status(403)
      .json({ message: "Acceso denegado. Se requiere suscripción activa." });
  }
  next();
}

module.exports = { protect, checkSubscription };
