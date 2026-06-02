import express from 'express';
import { runSQL, getQuery } from '../database/postgres-connection.js';

const router = express.Router();

// GET /api/state — load full app state
router.get('/', async (req, res) => {
  try {
    const rows = await getQuery('SELECT value FROM state WHERE key = $1', ['app_data']);
    if (rows.length > 0) {
      res.json({ state: JSON.parse(rows[0].value), found: true });
    } else {
      res.json({ state: null, found: false });
    }
  } catch (error) {
    console.error('❌ Erro ao carregar estado:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/state — save full app state
router.post('/', async (req, res) => {
  try {
    const stateJson = JSON.stringify(req.body.state);
    const now = new Date().toISOString();
    const existing = await getQuery('SELECT key FROM state WHERE key = $1', ['app_data']);
    if (existing.length > 0) {
      await runSQL('UPDATE state SET value = $1, "updatedAt" = $2 WHERE key = $3', [stateJson, now, 'app_data']);
    } else {
      await runSQL('INSERT INTO state (key, value, "updatedAt") VALUES ($1, $2, $3)', ['app_data', stateJson, now]);
    }
    res.json({ success: true, updated_at: now });
  } catch (error) {
    console.error('❌ Erro ao salvar estado:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/state/export — download the state as a JSON file
router.get('/export', async (req, res) => {
  try {
    const rows = await getQuery('SELECT value, "updatedAt" FROM state WHERE key = $1', ['app_data']);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Sem dados para exportar' });
    }
    const state = JSON.parse(rows[0].value);
    const filename = `inspec360_export_${new Date().toISOString().slice(0,10)}.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');
    res.json({
      exported_at: rows[0].updatedAt,
      version: '2.2.0',
      data: state,
    });
  } catch (error) {
    console.error('❌ Erro ao exportar estado:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
