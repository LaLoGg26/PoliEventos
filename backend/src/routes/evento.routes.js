const express = require("express");
const router = express.Router();
const eventoController = require("../controllers/evento.controller");
const upload = require("../config/cloudinary.config"); // Middleware de imágenes
const {
  protect,
  checkSubscription,
} = require("../middlewares/auth.middleware");

// ==========================================
// 🚨 RUTAS ESPECÍFICAS (VAN PRIMERO) 🚨
// ==========================================

// 1. Dashboard (Vendedor)
router.get(
  "/dashboard/mis-eventos",
  protect,
  checkSubscription,
  eventoController.getDashboardEvents
);

// 2. Wallet (Comprador - Mis Tickets)
router.get("/usuario/mis-tickets", protect, eventoController.getMisTickets);

// 3. Reenviar Correo (ESTA ES LA QUE FALTABA O ESTABA MAL UBICADA)
router.post(
  "/usuario/reenviar-correo",
  protect,
  eventoController.postReenviarCorreo
);

// 4. Procesar compra
router.post("/comprar", protect, eventoController.postComprarBoletos);

// ==========================================
// RUTAS GENERALES Y DINÁMICAS (VAN DESPUÉS)
// ==========================================

// 5. Obtener lista de eventos (Home)
router.get("/", eventoController.getEventos);

// 6. Crear evento (Vendedor)
router.post(
  "/",
  protect,
  checkSubscription,
  upload.single("imagen"),
  eventoController.postCreateEvento
);

// 7. Obtener detalle por ID (¡Cuidado! Esta ruta captura todo lo que parezca un ID)
router.get("/:id", eventoController.getEventoById);

// 8. Eliminar evento
router.delete(
  "/:id",
  protect,
  checkSubscription,
  eventoController.deleteEvento
);

// 9. Editar evento
router.put(
  "/:id",
  protect,
  checkSubscription,
  upload.single("imagen"),
  eventoController.updateEvento
);

// 10. Validar ticket
router.post(
  "/ticket/validar",
  protect,
  checkSubscription,
  eventoController.postValidarTicket
);

module.exports = router;
