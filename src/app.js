// ==========================================
// 1. DEPENDENCIAS (Solo las necesarias para Express)
// ==========================================
const express = require("express");
const path = require("path");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session); // Almacenamiento de sesiones en MySQL
const bodyParser = require("body-parser");
require("dotenv").config();

// ==========================================
// 2. IMPORTAR MÓDULOS DE NUESTRA ARQUITECTURA
// ==========================================
// Importamos la BD centralizada y los middlewares
const db = require("./config/db");
const authMiddleware = require("./middlewares/auth.middleware");

// Importamos las rutas desde /routes
const authRoutes = require("./routes/auth.routes");
const trenesRoutes = require("./routes/trenes.routes");
const capturasRoutes = require("./routes/capturas.routes");

// ==========================================
// 3. INICIALIZACIÓN Y CONFIGURACIÓN
// ==========================================
const app = express();
const publicPath = path.join(__dirname, "..", "public");

// Middlewares para procesar body y formularios
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// ------------------------------------------
// Configuración del Store de Sesiones con MySQL / Aiven
// ------------------------------------------
const sessionStoreOptions = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 24373,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  createDatabaseTable: true,
  ssl: { rejectUnauthorized: false }
};

const sessionStore = new MySQLStore(sessionStoreOptions);

// Configuración de sesiones persistentes
app.use(session({
  key: "apitren_session",
  secret: process.env.SESSION_SECRET || "clave-secreta-cualquiercosa",
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // Duración de 1 día
  }
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
// Aquí Express engancha todas las rutas de /login, /register, /trenes, /capturas, etc.
app.use(authRoutes);
app.use(trenesRoutes);
app.use(capturasRoutes);

// Ruta raíz (HTML Principal) protegida
app.get("/", authMiddleware, (req, res) => {
  res.status(200).sendFile(path.join(publicPath, "html", "TRENES.html"));
});

// Servir la página TrenCapturado.html (Corregida con publicPath)
app.get('/TrenCapturado.html', authMiddleware, (req, res) => {
  res.sendFile(path.join(publicPath, "html", "TrenCapturado.html"));
});

// Ruta de Perfil de Usuario protegida
app.get("/perfil", authMiddleware, (req, res) => {
  res.status(200).sendFile(path.join(publicPath, "html", "perfil.html"));
});

// ==========================================
// 6. EXPORTACIONES
// ==========================================
module.exports = app;
module.exports.app = app;
module.exports.db = db;