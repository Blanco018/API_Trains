const express = require("express");
const router = express.Router(); // Router permite definir rutas de forma aislada
const path = require("path");
const authController = require("../controllers/auth.controller");

// Calculamos la ruta a la carpeta 'public'
const publicPath = path.join(__dirname, "..", "..", "public");

// Rutas tipo POST para procesar credenciales
router.post("/register", authController.register);
router.post("/login", authController.login);

// Ruta tipo GET para cerrar sesión
router.get("/logout", authController.logout);

// Ruta GET para servir el archivo HTML del formulario de login
router.get("/login", (req, res) => {
  res.sendFile(path.join(publicPath, "html", "TrenesLogin.html"));
});

// Obtener los datos del usuario logueado desde la sesión
router.get("/api/me", (req, res) => {
  if (req.session && req.session.user) {
    // Si existe la sesión, devolvemos su nombre (o email)
    return res.json({ 
      logged: true, 
      username: req.session.user.username || req.session.user.nombre || req.session.user.email 
    });
  }
  
  res.status(401).json({ logged: false, message: "No hay sesión activa" });
});

module.exports = router;