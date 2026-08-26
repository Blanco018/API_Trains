const express = require("express");
const router = express.Router();
const trenesController = require("../controllers/trenes.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Aplicamos 'authMiddleware' justo antes de 'getTrenes' para proteger la API de datos
router.get("/trenes", authMiddleware, trenesController.getTrenes);

// Rutas de administración y utilidades de base de datos (sin protección por ahora)
router.get("/create-trains-table", trenesController.createTable);
router.get("/seed-trains", trenesController.seedTrenes);

module.exports = router;