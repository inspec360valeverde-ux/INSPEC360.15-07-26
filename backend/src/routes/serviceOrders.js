import express from 'express';
import * as queries from '../database/queries.js';

const router = express.Router();

// GET /api/service-orders - Obter todas as ordens de serviço
router.get('/', (req, res) => {
  try {
    const orders = queries.getAllServiceOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/service-orders/:id - Obter ordem por ID
router.get('/:id', (req, res) => {
  try {
    const order = queries.getServiceOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Ordem não encontrada' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/service-orders - Criar nova ordem
router.post('/', (req, res) => {
  try {
    const order = queries.createServiceOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/service-orders/:id - Atualizar ordem
router.put('/:id', (req, res) => {
  try {
    const order = queries.updateServiceOrder(req.params.id, req.body);
    if (!order) {
      return res.status(404).json({ error: 'Ordem não encontrada' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
