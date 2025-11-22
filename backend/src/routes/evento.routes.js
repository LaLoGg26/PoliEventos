const express = require("express");
const router = express.Router();
const eventoController = require("../controllers/evento.controller");
const upload = require("../config/cloudinary.config");
// ⭐️ IMPORTAMOS los middlewares de protección ⭐️
const {
  protect,
  checkSubscription,
} = require("../middlewares/auth.middleware");

// ==========================================
// 1. RUTAS PÚBLICAS (COMPRADORES Y VISITANTES)
// ==========================================

// Ver mis eventos (Dashboard)
router.get(
  "/dashboard/mis-eventos",
  protect,
  checkSubscription,
  eventoController.getDashboardEvents
);

// POST /api/eventos/comprar - Procesar la compra de boletos (Cualquier usuario o visitante)
router.post("/comprar", eventoController.postComprarBoletos);

// GET /api/eventos - Obtener lista de todos los eventos
router.get("/", eventoController.getEventos);

// GET /api/eventos/:id - Obtener detalle de un evento específico
router.get("/:id", eventoController.getEventoById);

// Eliminar evento (Dueño o Admin)
router.delete(
  "/:id",
  protect,
  checkSubscription,
  eventoController.deleteEvento
);

// Editar evento (Dueño o Admin)
router.put("/:id", protect, checkSubscription, eventoController.updateEvento);

// ======================================================
// 2. RUTA PROTEGIDA (VENDEDORES CON SUSCRIPCIÓN ACTIVA)
// ======================================================

// POST /api/eventos - Crear un nuevo evento
// Requiere:
// 1. estar logueado (protect)
// 2. ser VENDEDOR o SUPER_USER Y tener suscripción activa (checkSubscription)
router.post(
  "/",
  protect,
  checkSubscription,
  upload.single("imagen"),
  eventoController.postCreateEvento
);

module.exports = router;
