// 1. IMPORTACIONES CORRECTAS
const path = require("path");
const fs = require("fs");
const db = require("../config/db"); // 👈 IMPORTANTE: Traemos la conexión a MySQL desde config/db.js

// Obtener la lista de trenes desde la base de datos
exports.getTrenes = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM trains");
    res.json(rows); // Retornamos el array de trenes en formato JSON al cliente
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// Crear la tabla 'trains' si no existe
exports.createTable = async (req, res) => {
  try {
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
    await db.query(createTableSQL);
    res.json({ ok: true, message: 'Tabla "trains" creada correctamente (si no existía).' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

// Cargar datos iniciales desde el archivo local trenes.json hacia MySQL
exports.seedTrenes = async (req, res) => {
  try {
    // Calculamos la ruta hasta la raíz donde se encuentra 'trenes.json'
    const jsonPath = path.join(__dirname, "..", "..", "trenes.json");
    const trains = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

    for (const tren of trains) {
      await db.query(
        `INSERT INTO trains 
          (serie, apodo, tipo, servicio, operador, logo, descripcionVisual, zona) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [tren.serie, tren.apodo, tren.tipo, tren.servicio, tren.operador, tren.logo, tren.descripcionVisual, tren.zona]
      );
    }
    res.json({ ok: true, message: "Todos los trenes insertados en MySQL." });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};
// Obtener un único tren por su ID para la pantalla de detalle
exports.getTrenPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query("SELECT * FROM trains WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Tren no encontrado" });
    }

    // Devolvemos directamente el objeto del tren
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};