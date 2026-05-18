import express from 'express';
import * as queries from '../database/queries.js';

const router = express.Router();

// GET /api/structures - Obter todas as estruturas
router.get('/', (req, res) => {
  try {
    const structures = queries.getAllStructures();
    res.json(structures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/structures/:id - Obter estrutura por ID
router.get('/:id', (req, res) => {
  try {
    const structure = queries.getStructureById(req.params.id);
    if (!structure) {
      return res.status(404).json({ error: 'Estrutura não encontrada' });
    }
    res.json(structure);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/structures - Criar nova estrutura
router.post('/', (req, res) => {
  try {
    const structure = queries.createStructure(req.body);
    res.status(201).json(structure);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/structures/:id - Atualizar estrutura
router.put('/:id', (req, res) => {
  try {
    const structure = queries.updateStructure(req.params.id, req.body);
    if (!structure) {
      return res.status(404).json({ error: 'Estrutura não encontrada' });
    }
    res.json(structure);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
