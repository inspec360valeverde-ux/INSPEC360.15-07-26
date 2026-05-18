import express from 'express';
import * as queries from '../database/queries.js';

const router = express.Router();

// GET /api/inspections - Obter todas as inspeções
router.get('/', (req, res) => {
  try {
    const inspections = queries.getAllInspections();
    res.json(inspections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inspections/:id - Obter inspeção por ID
router.get('/:id', (req, res) => {
  try {
    const inspection = queries.getInspectionById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspeção não encontrada' });
    }
    res.json(inspection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inspections - Criar nova inspeção
router.post('/', (req, res) => {
  try {
    const inspection = queries.createInspection(req.body);
    res.status(201).json(inspection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/inspections/:id - Atualizar inspeção
router.put('/:id', (req, res) => {
  try {
    const inspection = queries.updateInspection(req.params.id, req.body);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspeção não encontrada' });
    }
    res.json(inspection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inspections/:id/components - Adicionar componente à inspeção
router.post('/:id/components', (req, res) => {
  try {
    const component = queries.createComponentInspection({
      inspectionId: req.params.id,
      ...req.body
    });
    res.status(201).json(component);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inspections/:id/anomalies - Adicionar anomalia
router.post('/:id/anomalies', (req, res) => {
  try {
    const anomaly = queries.createAnomaly({
      inspectionId: req.params.id,
      ...req.body
    });
    res.status(201).json(anomaly);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inspections/:id/photos - Adicionar foto
router.post('/:id/photos', (req, res) => {
  try {
    const photo = queries.createPhoto({
      inspectionId: req.params.id,
      ...req.body
    });
    res.status(201).json(photo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inspections/:id/pause - Pausar inspeção
router.post('/:id/pause', (req, res) => {
  try {
    const pause = queries.createPause({
      inspectionId: req.params.id,
      ...req.body
    });
    res.status(201).json(pause);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/inspections/pause/:pauseId/resume - Retomar inspeção
router.put('/pause/:pauseId/resume', (req, res) => {
  try {
    const pause = queries.resumePause(req.params.pauseId);
    res.json(pause);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
