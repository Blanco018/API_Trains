const express = require('express');
const router = express.Router();
const capturasController = require('../controllers/capturas.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Endpoints de capturas
router.get('/api/capturas/mis-capturas', authMiddleware, capturasController.getMisCapturas);
router.get('/api/capturas/estado/:trenId', authMiddleware, capturasController.checkCapturaStatus);
router.post('/api/capturas/toggle', authMiddleware, capturasController.toggleCaptura);

module.exports = router;