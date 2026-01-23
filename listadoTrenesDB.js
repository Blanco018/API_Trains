// listadoTrenesDB.js
// -----------------------------
// ESTE SCRIPT LISTA TODOS LOS TRENES EN LA BASE DE DATOS
// MUESTRA SU ID, SERIE, APODO, TIPO Y OTROS DETALLES
// EN CONSOLA "node listadoTrenesDB.js" 
// -----------------------------

// Importamos la librería mysql2 en modo promise
const mysql = require("mysql2/promise");

// Cargamos las variables de entorno desde el archivo .env
require("dotenv").config();

// Función principal asíncrona
async function main() {
  try {
    // -----------------------------
    // CONEXIÓN A LA BASE DE DATOS
    // -----------------------------
    const db = mysql.createPool({
      host: process.env.DB_HOST,       // Host de la base de datos
      user: process.env.DB_USER,       // Usuario de la base de datos
      password: process.env.DB_PASSWORD, // Contraseña de la base de datos
      database: process.env.DB_NAME,   // Nombre de la base de datos
      port: process.env.DB_PORT || 3306, // Puerto (por defecto 3306)
    });

    // -----------------------------
    // CONSULTA A LA TABLA DE TRENES
    // -----------------------------
    // Traemos todos los registros de la tabla "trains"
    const [rows] = await db.query("SELECT * FROM trains");

    // -----------------------------
    // VERIFICAR SI HAY TRENES
    // -----------------------------
    if (rows.length === 0) {
      console.log("No hay trenes en la base de datos.");
      return; // Salimos si no hay trenes
    }

    console.log("Trenes en la base de datos:");

    // -----------------------------
    // RECORRER CADA TREN
    // -----------------------------
    rows.forEach(tren => {
      console.log(`ID: ${tren.id}, Serie: ${tren.serie}, Apodo: ${tren.apodo}, Tipo: ${tren.tipo}, Servicio: ${tren.servicio}, Operador: ${tren.operador}, Zona: ${tren.zona}`);
    });

    // -----------------------------
    // MOSTRAR TOTAL DE TRENES
    // -----------------------------
    console.log(`\nTotal de trenes: ${rows.length}`);

    // -----------------------------
    // CERRAR CONEXIÓN
    // -----------------------------
    await db.end();

  } catch (error) {
    // Manejo de errores
    console.error("Error al conectarse a la base de datos:", error.message);
  }
}

// Ejecutamos la función principal
main();