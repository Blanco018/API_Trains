// Importamos Express, el framework que nos permite crear servidores web fácilmente
const express = require("express");

// Importamos path, que sirve para trabajar con rutas de archivos (muy importante para HTML)
const path = require("path");

// Creamos la aplicación Express
const app = express();

// Definimos el puerto:
// - Render (o cualquier hosting) usa process.env.PORT
// - En local usamos el 3000
const PORT = process.env.PORT || 3000;

// -----------------------------
// MIDDLEWARE
// -----------------------------

// Esta línea le dice a Express:
// "Todo lo que esté dentro de la carpeta 'public'
// (HTML, CSS, JS, imágenes) puede servirse directamente"
app.use(express.static("public"));

// -----------------------------
// DATOS (nuestra “base de datos”)
// -----------------------------

// Array de objetos con los trenes
// Por ahora está en memoria (más adelante podría ser una BD)
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
// RUTAS DE LA API
// -----------------------------

// Ruta GET /trenes
// Cuando alguien entra a:
// http://localhost:3000/trenes
// devolvemos los datos en formato JSON
app.get("/trenes", (req, res) => {
  res.json(trains);
});

// -----------------------------
// RUTA PRINCIPAL (FRONTEND)
// -----------------------------

// Ruta GET /
// Cuando alguien entra a:
// http://localhost:3000
// enviamos el archivo TRENES.html
app.get("/", (req, res) => {
  //res.sendFile(
  //  path.join(__dirname, "public", "TRENES.html")
  //);
   res.redirect("/TRENES.html"); // fuerza a que cargue el HTML desde public
});

// -----------------------------
// ARRANQUE DEL SERVIDOR
// -----------------------------

// Ponemos el servidor a escuchar en el puerto definido
app.listen(PORT, () => {
  console.log(`API funcionando en http://localhost:${PORT}`);
});