// -----------------------------
// DEPENDENCIAS
// -----------------------------
const express = require("express");
const path = require("path"); // Para manejar rutas de archivos
const session = require("express-session"); // Para manejar sesiones de usuario
const bodyParser = require("body-parser"); // Para procesar formularios POST
const bcrypt = require("bcrypt"); // Para encriptar contraseñas
const mysql = require("mysql2/promise"); // Para conectar con MySQL
require("dotenv").config(); // Para variables de entorno

// -----------------------------
// INICIALIZACIÓN DE EXPRESS Y PUERTO
// -----------------------------
const app = express();
const PORT = process.env.PORT || 3000;

// -----------------------------
// CONEXIÓN A MYSQL
// -----------------------------
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

// -----------------------------
// MIDDLEWARES
// -----------------------------

// Para procesar datos de formularios
app.use(bodyParser.urlencoded({ extended: false }));

// Configuración de sesiones
app.use(session({
  secret: "clave-secreta-cualquiercosa", // Cambiar por una clave más segura
  resave: false,
  saveUninitialized: false
}));

// 🔽 ESTA LÍNEA ES CLAVE PARA LOS HTML/CSS/JS
// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, "public")));

// -----------------------------
// DATOS EN MEMORIA
// -----------------------------

// Usuarios almacenados en memoria (solo para pruebas)
const users = []; // Cada usuario: { username, passwordHash }

// -----------------------------
// MIDDLEWARE DE AUTENTICACIÓN
// -----------------------------
function authMiddleware(req, res, next) {
  // Verifica si hay usuario logueado en la sesión
  if (req.session.user) {
    next(); // Usuario autenticado → continuar
  } else {
    res.redirect("/login"); // No autenticado → enviar al login
  }
}

// -----------------------------
// RUTAS DE AUTENTICACIÓN
// -----------------------------

// Mostrar página de login / registro
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "TrenesLogin.html"));
});

// Registro de usuario
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.send("Faltan datos");

  // Comprobar si usuario ya existe
  if (users.find(u => u.username === username)) return res.send("Usuario ya existe");

  // Crear hash de la contraseña para almacenar de forma segura
  const hash = await bcrypt.hash(password, 10);
  users.push({ username, passwordHash: hash });

  res.send("Usuario creado, ahora puedes iniciar sesión");
});

// Inicio de sesión
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (!user) return res.send("Usuario no encontrado");

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.send("Contraseña incorrecta");

  // Guardar info en la sesión
  req.session.user = username;
  res.redirect("/"); // Redirige a la página principal
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(); // Elimina la sesión del usuario
  res.redirect("/login");
});

// -----------------------------
// RUTAS PROTEGIDAS
// -----------------------------

// Página principal protegida
app.get("/", authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "TRENES.html"));
});

// -----------------------------
// RUTA API protegida
// -----------------------------
app.get("/trenes", authMiddleware, async (req, res) => {
  try {
    // Traer todos los trenes desde la base de datos MySQL
    const [rows] = await db.query("SELECT * FROM trains");
    res.json(rows);
  } catch (error) {
    // Enviar error en caso de fallo
    res.status(500).json({ ok: false, error: error.message });
  }
});

// -----------------------------
// RUTA PARA CREAR TABLA DE TRENES EN MYSQL
// -----------------------------
app.get("/create-trains-table", async (req, res) => {
  try {
    // SQL para crear la tabla 'trains' si no existe
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS trains (
        id INT AUTO_INCREMENT PRIMARY KEY,
        serie VARCHAR(100),
        apodo VARCHAR(100),
        tipo VARCHAR(50),
        servicio VARCHAR(50),
        operador VARCHAR(50),
        logo VARCHAR(255),
        descripcionVisual VARCHAR(255),
        zona VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Ejecuta la consulta usando la conexión 'db'
    await db.query(createTableSQL);

    // Enviar respuesta de éxito al cliente
    res.json({ ok: true, message: 'Tabla "trains" creada correctamente (si no existía).' });
  } catch (error) {
    // En caso de error, enviar mensaje al cliente
    res.status(500).json({ ok: false, error: error.message });
  }
});

// -----------------------------
// RUTA DE PRUEBA DE CONEXIÓN A MYSQL
// -----------------------------
app.get("/test-db", async (req, res) => {
  try {
    // Ejecuta una consulta simple para verificar conexión
    const [rows] = await db.query("SELECT 1 + 1 AS result");
    res.json({ ok: true, result: rows[0].result });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// -----------------------------
// RUTA PARA INSERTAR TODOS LOS TRENES EN MYSQL
// -----------------------------
app.get("/seed-trains", async (req, res) => {
  try {
    // Iteramos por cada tren definido en memoria
    for (const tren of trains) {
      // Insertamos todos los campos en la tabla 'trains'
      await db.query(
        `INSERT INTO trains 
          (serie, apodo, tipo, servicio, operador, logo, descripcionVisual, zona) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [tren.serie, tren.apodo, tren.tipo, tren.servicio, tren.operador, tren.logo, tren.descripcionVisual, tren.zona]
      );
    }

    // Respuesta de éxito
    res.json({ ok: true, message: "Todos los trenes de memoria se insertaron en MySQL." });
  } catch (error) {
    // Manejo de errores
    res.status(500).json({ ok: false, error: error.message });
  }
});

// -----------------------------
// INICIAR SERVIDOR
// -----------------------------
app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});