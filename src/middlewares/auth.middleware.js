function authMiddleware(req, res, next) {
  // Comprobamos si la sesión existe y si tiene guardado un nombre de usuario
  if (req.session && req.session.user) {
    next(); // 'next()' le dice a Express: "Todo en regla, dale paso a la siguiente función o vista"
  } else {
    res.redirect("/login"); // Si no está autenticado, lo redirigimos al Login
  }
}

// Exportamos la función middleware para usarla en las rutas
module.exports = authMiddleware;