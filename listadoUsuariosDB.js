// listadoUsuariosDB.js
// -----------------------------
// ESTE SCRIPT LISTA TODOS LOS USUARIOS EN LA BASE DE DATOS
// MUESTRA SU ID Y NOMBRE DE USUARIO Y DETECTA DUPLICADOS
// EN CONSOLA "node listadoUsuariosDB.js" 
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
    // CONSULTA A LA TABLA DE USUARIOS
    // -----------------------------
    // Traemos todos los registros de la tabla "users"
    const [rows] = await db.query("SELECT * FROM users");

    // -----------------------------
    // VERIFICAR SI HAY USUARIOS
    // -----------------------------
    if (rows.length === 0) {
      console.log("No hay usuarios en la base de datos.");
      return; // Salimos si no hay usuarios
    }

    console.log("Usuarios en la base de datos:");

    // Usamos un Set para detectar duplicados de usernames
    const seen = new Set();

    // -----------------------------
    // RECORRER CADA USUARIO
    // -----------------------------
    rows.forEach(user => {
      // Mostramos ID y nombre de usuario
      console.log(`ID: ${user.id}, Usuario: ${user.username}`);

      // Verificamos duplicados
      if (seen.has(user.username)) {
        console.warn(`⚠️ Usuario duplicado detectado: ${user.username}`);
      }

      // Añadimos el usuario al Set para la siguiente iteración
      seen.add(user.username);
    });

    // -----------------------------
    // MOSTRAR TOTAL DE USUARIOS
    // -----------------------------
    console.log(`\nTotal de usuarios: ${rows.length}`);

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