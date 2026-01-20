// -----------------------------
// DEPENDENCIAS
// -----------------------------
const express = require("express");
const path = require("path"); // Para manejar rutas de archivos
const session = require("express-session"); // Para manejar sesiones de usuario
const bodyParser = require("body-parser"); // Para procesar formularios POST
const bcrypt = require("bcrypt"); // Para encriptar contraseñas

// -----------------------------
// INICIALIZACIÓN DE EXPRESS Y PUERTO
// -----------------------------
const app = express();
const PORT = process.env.PORT || 3000;

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

// Datos (tu “base de datos” de trenes y metros)
const trains = [
  {
    serie: "592",
    apodo: "Camello",
    tipo: "Diésel",
    servicio: "Media Distancia",
    operador: "Renfe",
    logo: "",
    descripcionVisual: "Blanco, líneas rojas y moradas, morro rojo inclinado",
    zona: "Murcia, Alicante, C. Valenciana, Extremadura"
  },
  {
    serie: "598",
    apodo: "",
    tipo: "Diésel",
    servicio: "Media Distancia",
    operador: "Renfe",
    logo: "",
    descripcionVisual: "Blanco, líneas moradas y grises, frontal moderno",
    zona: "Galicia, Castilla y León, Aragón"
  },
  {
    serie: "449",
    apodo: "",
    tipo: "Eléctrico",
    servicio: "Media Distancia",
    operador: "Renfe",
    logo: "",
    descripcionVisual: "Blanco con franja morada, ventanas grandes",
    zona: "Madrid–Valencia, Andalucía"
  },
  {
    serie: "447",
    apodo: "",
    tipo: "Eléctrico",
    servicio: "Cercanías",
    operador: "Renfe",
    logo: "",
    descripcionVisual: "Blanco con franjas rojas, muchas puertas",
    zona: "Madrid, Barcelona, Valencia, Sevilla"
  },
  {
    serie: "102",
    apodo: "Pato",
    tipo: "Eléctrico",
    servicio: "AVE",
    operador: "Renfe",
    logo: "",
    descripcionVisual: "Morro muy largo y puntiagudo",
    zona: "Madrid–Barcelona, Málaga"
  },
  {
    serie: "130",
    apodo: "Alvia",
    tipo: "Eléctrico",
    servicio: "Larga Distancia",
    operador: "Renfe",
    logo: "",
    descripcionVisual: "Muy largo, blanco con morado",
    zona: "Galicia, Asturias"
  },
  {
    serie: "ETR 1000",
    apodo: "Frecciarossa",
    tipo: "Eléctrico",
    servicio: "Alta Velocidad",
    operador: "Iryo",
    logo: "",
    descripcionVisual: "Rojo oscuro, diseño aerodinámico",
    zona: "Madrid–Barcelona, Valencia"
  },
  {
    serie: "Euroduplex",
    apodo: "",
    tipo: "Eléctrico",
    servicio: "Alta Velocidad",
    operador: "Ouigo",
    logo: "",
    descripcionVisual: "Azul intenso, doble piso",
    zona: "Madrid–Barcelona, Valencia"
  },
  {
    serie: "Metro Series 3000 / 8000",
    apodo: "",
    tipo: "Metro",
    servicio: "Metro",
    operador: "Metro de Madrid",
    logo: "",
    descripcionVisual: "Blanco con franja azul, moderno",
    zona: "Madrid capital"
  },
  {
    serie: "Metro Series 3000 / 4000",
    apodo: "",
    tipo: "Metro",
    servicio: "Metro",
    operador: "TMB",
    logo: "",
    descripcionVisual: "Blanco con franja roja",
    zona: "Barcelona y alrededores"
  },
  {
    serie: "Metro Series 4300 / 4100",
    apodo: "",
    tipo: "Metro",
    servicio: "Metro",
    operador: "FGV",
    logo: "",
    descripcionVisual: "Blanco con línea verde",
    zona: "Valencia y área metropolitana"
  }
];

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
  if (users.find(u => u.username === username)) {
    return res.send("Usuario ya existe");
  }

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

// RUTA API protegida
app.get("/trenes", authMiddleware, (req, res) => {
  res.json(trains);
});

// -----------------------------
// INICIAR SERVIDOR
// -----------------------------
app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});