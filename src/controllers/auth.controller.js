const bcrypt = require("bcrypt");
const db = require("../config/db"); // Importamos la conexión centralizada a MySQL

// Lógica de Registro
exports.register = async (req, res) => {
  // Leemos las claves reales enviadas por el formulario de registro
  const { usernameRegister: username, passwordRegister: password } = req.body; 
  
  if (!username || !password) return res.status(400).send("Faltan datos");

  try {
    // 1. Verificamos si el usuario ya existe en la tabla 'users'
    const [existing] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    if (existing.length > 0) return res.send("Usuario ya existe");

    // 2. Encriptamos la contraseña con Bcrypt
    const hash = await bcrypt.hash(password, 10);

    // 3. Insertamos el usuario con la clave ya encriptada
    await db.query("INSERT INTO users (username, passwordHash) VALUES (?, ?)", [username, hash]);

    res.send("Usuario creado, ahora puedes iniciar sesión");
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// Lógica de Login
exports.login = async (req, res) => {
  // Leemos las claves reales enviadas por el formulario de login
  const { usernameLogIn: username, passwordLogIn: password } = req.body;

  if (!username || !password) return res.status(400).send("Faltan datos de inicio de sesión");

  try {
    // 1. Buscamos al usuario en MySQL
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0) return res.send("Usuario no encontrado");

    const user = rows[0];

    // 2. Comparamos la clave enviada con el hash guardado en MySQL
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.send("Contraseña incorrecta");

    // 3. Guardamos la sesión
    req.session.user = {
      id: user.id,
      username: user.username
    };

    res.redirect("/"); // Redirigimos a la página principal
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// Obtener datos del usuario activo
exports.getCurrentUser = (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ logged: true, username: req.session.user.username });
  }
  res.status(401).json({ logged: false, message: "No hay sesión activa" });
};

// Lógica de Logout
exports.logout = (req, res) => {
  // Destruimos la cookie/sesión del usuario activo
  req.session.destroy();
  res.redirect("/login");
};