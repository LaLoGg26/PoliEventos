const express = require("express");
const router = express.Router();
const eventoController = require("../controllers/evento.controller");
const upload = require("../config/cloudinary.config");
const {
  protect,
  checkSubscription,
} = require("../middlewares/auth.middleware");

// RUTAS ESPECÍFICAS
router.get(
  "/dashboard/mis-eventos",
  protect,
  checkSubscription,
  eventoController.getDashboardEvents
);
router.get("/usuario/mis-tickets", protect, eventoController.getMisTickets);
router.post(
  "/usuario/reenviar-correo",
  protect,
  eventoController.postReenviarCorreo
);
router.post(
  "/ticket/validar",
  protect,
  checkSubscription,
  eventoController.postValidarTicket
); // 👈 NUEVA RUTA
router.post("/comprar", protect, eventoController.postComprarBoletos);

router.post(
  "/usuario/reenviar-whatsapp",
  protect,
  eventoController.postReenviarWhatsapp
);

// RUTAS GENERALES
router.get("/", eventoController.getEventos);
router.post(
  "/",
  protect,
  checkSubscription,
  upload.single("imagen"),
  eventoController.postCreateEvento
);
router.get("/:id", eventoController.getEventoById);
router.delete(
  "/:id",
  protect,
  checkSubscription,
  eventoController.deleteEvento
);
router.put(
  "/:id",
  protect,
  checkSubscription,
  upload.single("imagen"),
  eventoController.updateEvento
);

module.exports = router;
