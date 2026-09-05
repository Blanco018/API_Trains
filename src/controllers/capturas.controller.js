const db = require('../config/db');

// Función auxiliar para extraer el ID de usuario sin importar la estructura de la sesión
const getUserId = (req) => {
  if (req.session?.userId) return req.session.userId;
  if (req.session?.user?.id) return req.session.user.id;
  return null;
};

// Obtener todas las capturas del usuario autenticado
exports.getMisCapturas = async (req, res) => {
  try {
    const usuarioId = getUserId(req);
    if (!usuarioId) {
      return res.status(401).json({ ok: false, message: 'No autorizado' });
    }

    const [rows] = await db.query(
      `SELECT c.id AS captura_id, c.fecha_captura, c.nota, t.* 
       FROM capturas c 
       JOIN trains t ON c.tren_id = t.id 
       WHERE c.usuario_id = ? 
       ORDER BY c.fecha_captura DESC`,
      [usuarioId]
    );

    res.json({ ok: true, capturas: rows });
  } catch (error) {
    console.error('Error al obtener capturas:', error);
    res.status(500).json({ ok: false, message: 'Error del servidor' });
  }
};

// Toggle Captura (Añadir o Eliminar de la colección)
exports.toggleCaptura = async (req, res) => {
  try {
    const usuarioId = getUserId(req);
    const { trenId } = req.body;

    if (!usuarioId) {
      return res.status(401).json({ ok: false, message: 'No autorizado' });
    }

    if (!trenId) {
      return res.status(400).json({ ok: false, message: 'ID de tren requerido' });
    }

    const [existente] = await db.query(
      'SELECT id FROM capturas WHERE usuario_id = ? AND tren_id = ?',
      [usuarioId, trenId]
    );

    if (existente.length > 0) {
      await db.query(
        'DELETE FROM capturas WHERE usuario_id = ? AND tren_id = ?',
        [usuarioId, trenId]
      );
      return res.json({ ok: true, capturado: false, message: 'Tren eliminado de tus capturas' });
    } else {
      await db.query(
        'INSERT INTO capturas (usuario_id, tren_id) VALUES (?, ?)',
        [usuarioId, trenId]
      );
      return res.json({ ok: true, capturado: true, message: '¡Tren capturado con éxito!' });
    }
  } catch (error) {
    console.error('Error al registrar captura:', error);
    res.status(500).json({ ok: false, message: 'Error en la base de datos' });
  }
};

// Comprobar si un tren específico ya está capturado
exports.checkCapturaStatus = async (req, res) => {
  try {
    const usuarioId = getUserId(req);
    const { trenId } = req.params;

    if (!usuarioId) {
      return res.json({ ok: true, capturado: false });
    }

    const [rows] = await db.query(
      'SELECT id FROM capturas WHERE usuario_id = ? AND tren_id = ?',
      [usuarioId, trenId]
    );

    res.json({ ok: true, capturado: rows.length > 0 });
  } catch (error) {
    console.error('Error al verificar estado de la captura:', error);
    res.status(500).json({ ok: false, message: 'Error del servidor' });
  }
};