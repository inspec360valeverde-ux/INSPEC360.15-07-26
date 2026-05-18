import express from 'express';
import * as queries from '../database/queries.js';

const router = express.Router();

// GET /api/components - Obter todos os componentes
router.get('/', (req, res) => {
  try {
    const components = queries.getAllComponents();
    res.json(components);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/components/:id - Obter componente por ID
router.get('/:id', (req, res) => {
  try {
    const component = queries.getComponentById(req.params.id);
    if (!component) {
      return res.status(404).json({ error: 'Componente não encontrado' });
    }
    res.json(component);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/components - Criar novo componente
router.post('/', (req, res) => {
  try {
    const component = queries.createComponent(req.body);
    res.status(201).json(component);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
