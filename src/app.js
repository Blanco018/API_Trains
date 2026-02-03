// -----------------------------
// DEPENDENCIAS
// -----------------------------
const express = require("express");
const path = require("path"); // Para manejar rutas de archivos
const session = require("express-session"); // Para manejar sesiones de usuario
const bodyParser = require("body-parser"); // Para procesar formularios POST
const bcrypt = require("bcrypt"); // Para encriptar contraseñas
const mysql = require("mysql2/promise"); // Para conectar con MySQL
const fs = require("fs"); // Para leer JSON con los trenes
require("dotenv").config(); // Para variables de entorno

// -----------------------------
// INICIALIZACIÓN DE EXPRESS Y PUERTO
// -----------------------------
const app = express();
const PORT = process.env.PORT || 3000;
const publicPath = path.join(__dirname, "..", "public");

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

//PAA QUE ENVIE JSON (PARA LOS TESTS)
app.use(express.json());


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
//app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(publicPath));

// -----------------------------
// PARA VER SI FUNCIONA LA API
// -----------------------------

// Ruta GET para comprobar que la API está viva
// Se suele usar como health-check
app.get("/api/status", (req, res) => {
  // Enviamos una respuesta HTTP con código 200 (OK)
  // y un JSON con un mensaje informativo
  res.status(200).json({
    message: "API Trenes funcionando"
  });
});

// -----------------------------
// REGISTRO E INICIO DE SESIÓN USANDO MYSQL
// -----------------------------

// Registro de usuario
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.send("Faltan datos");

  try {
    // Comprobar si el usuario ya existe en la base de datos
    const [existing] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    if (existing.length > 0) return res.send("Usuario ya existe");

    // Crear hash de la contraseña
    const hash = await bcrypt.hash(password, 10);

    // Insertar usuario en la base de datos
    await db.query("INSERT INTO users (username, passwordHash) VALUES (?, ?)", [username, hash]);

    res.send("Usuario creado, ahora puedes iniciar sesión");
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Inicio de sesión
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Buscar usuario en la base de datos
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0) return res.send("Usuario no encontrado");

    const user = rows[0];

    // Comparar la contraseña con bcrypt
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.send("Contraseña incorrecta");

    // Guardar info en la sesión
    req.session.user = username;
    res.redirect("/"); // Redirige a la página principal
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

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
  //res.sendFile(path.join(__dirname, "public", "TrenesLogin.html"));
  res.sendFile(path.join(publicPath, "TrenesLogin.html"));
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
  //res.sendFile(path.join(__dirname, "public", "TRENES.html"));
  res.sendFile(path.join(publicPath, "TRENES.html"));
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
    // 🔹 Ya no usamos memoria, cargamos desde un JSON externo o fuente externa
    // Puedes crear un archivo trains.json con un arreglo de trenes
    const trains = JSON.parse(fs.readFileSync("trenes.json", "utf8"));

    // Iteramos por cada tren del JSON y lo insertamos en MySQL
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
    res.json({ ok: true, message: "Todos los trenes insertados en MySQL." });
  } catch (error) {
    // Manejo de errores
    res.status(500).json({ ok: false, error: error.message });
  }
});

//module.exports = {app};
module.exports = app;
module.exports.app = app;
module.exports.db = db; // para MySQL