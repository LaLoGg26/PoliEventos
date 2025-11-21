const express = require("express");
const router = express.Router();
const eventoController = require("../controllers/evento.controller");

// Ruta GET /
router.get("/", eventoController.getEventos);

// Ruta GET /:id
router.get("/:id", eventoController.getEventoById);

module.exports = router;
