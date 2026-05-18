import express from 'express';
import * as queries from '../database/queries.js';

const router = express.Router();

// GET /api/executions - Obter todas as execuções
router.get('/', (req, res) => {
  try {
    const executions = queries.getAllExecutions();
    res.json(executions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/executions/:id - Obter execução por ID
router.get('/:id', (req, res) => {
  try {
    const execution = queries.getExecutionById(req.params.id);
    if (!execution) {
      return res.status(404).json({ error: 'Execução não encontrada' });
    }
    res.json(execution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/executions - Criar nova execução
router.post('/', (req, res) => {
  try {
    const execution = queries.createExecution(req.body);
    res.status(201).json(execution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/executions/:id - Atualizar execução
router.put('/:id', (req, res) => {
  try {
    const execution = queries.updateExecution(req.params.id, req.body);
    if (!execution) {
      return res.status(404).json({ error: 'Execução não encontrada' });
    }
    res.json(execution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
