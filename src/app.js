// ==========================================
// 1. DEPENDENCIAS (Solo las necesarias para Express)
// ==========================================
const express = require("express");
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
require("dotenv").config();

// ==========================================
// 2. IMPORTAR MÓDULOS DE NUESTRA ARQUITECTURA
// ==========================================
// Importamos la BD centralizada y los middlewares
const db = require("./config/db");
const authMiddleware = require("./middlewares/auth.middleware");

// Importamos las rutas que aislamos en la carpeta /routes
const authRoutes = require("./routes/auth.routes");
const trenesRoutes = require("./routes/trenes.routes");

// ==========================================
// 3. INICIALIZACIÓN Y CONFIGURACIÓN
// ==========================================
const app = express();
const publicPath = path.join(__dirname, "..", "public");

// Middlewares para procesar body y formularios
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Configuración de sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || "clave-secreta-cualquiercosa",
  resave: false,
  saveUninitialized: false
}));

// Archivos estáticos
app.use(express.static(publicPath));

// ==========================================
// 4. RUTAS DIRECTAS / ESTADO
// ==========================================
app.get("/api/status", (req, res) => {
  res.status(200).json({ message: "API Trenes funcionando" });
});

app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS result");
    res.json({ ok: true, result: rows[0].result });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// ==========================================
// 5. REGISTRO DE RUTAS MODULARIZADAS
// ==========================================
// Aquí Express engancha todas las rutas de /login, /register, /trenes, etc.
app.use(authRoutes);
app.use(trenesRoutes);

// Ruta raíz (HTML Principal) protegida
app.get("/", authMiddleware, (req, res) => {
  res.status(200).sendFile(path.join(publicPath, "html", "TRENES.html"));
});

// ==========================================
// 6. EXPORTACIONES
// ==========================================
module.exports = app;
module.exports.app = app;
module.exports.db = db;