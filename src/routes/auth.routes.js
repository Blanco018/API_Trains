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

module.exports = router;