import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import * as queries from '../database/queries.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// Configurar multer para upload de imagens
const uploadDir = path.join(__dirname, '../../public/images/inspections');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens JPEG, PNG ou WEBP são permitidas'));
    }
  }
});

// POST /api/photos/upload - Upload de foto para inspeção (com Georeferenciamento)
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const { 
      inspectionId, 
      componentId, 
      anomalyId, 
      caption,
      latitude,
      longitude,
      accuracy,
      componentName,
      anomalyName
    } = req.body;
    
    if (!inspectionId) {
      return res.status(400).json({ error: 'inspectionId é obrigatório' });
    }

    // Criar legenda estratégica com data/hora
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
    const timeFormat = now.toLocaleTimeString('pt-BR', { hour12: false }).replace(/:/g, '');
    
    // Organizar pastas: inspections/{inspectionId}/{componentName}/{anomalyName}/{timestamp}_{componentId}_{anomalyId}.jpg
    let folderPath = `inspections/${inspectionId}`;
    let fileName = req.file.filename;
    
    if (componentId) {
      folderPath += `/${componentName || componentId}`;
      if (anomalyId) {
        folderPath += `/${anomalyName || anomalyId}`;
        // Nome descritivo: TIMESTAMP_COMPONENT_ANOMALY_UUID.jpg
        const ext = path.extname(req.file.filename);
        fileName = `${timestamp}_${componentId}_${anomalyId}_${uuidv4()}${ext}`;
      } else {
        const ext = path.extname(req.file.filename);
        fileName = `${timestamp}_${componentId}_${uuidv4()}${ext}`;
      }
    } else {
      folderPath += `/geral`;
      const ext = path.extname(req.file.filename);
      fileName = `${timestamp}_geral_${uuidv4()}${ext}`;
    }

    const filePath = `/images/inspections/${folderPath}/${fileName}`;

    const photo = queries.createPhoto({
      inspectionId,
      componentId: componentId || null,
      componentName: componentName || null,
      anomalyId: anomalyId || null,
      anomalyName: anomalyName || null,
      filePath,
      storagePath: folderPath,
      caption: caption || `${componentName || 'Geral'} - ${now.toLocaleString('pt-BR')}`,
      timestamp: now.toISOString(),
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      accuracy: accuracy ? parseFloat(accuracy) : null
    });

    res.status(201).json({
      ...photo,
      url: filePath
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/photos/:inspectionId - Obter fotos da inspeção
router.get('/:inspectionId', (req, res) => {
  try {
    const inspection = queries.getInspectionById(req.params.inspectionId);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspeção não encontrada' });
    }
    
    res.json(inspection.photos || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
