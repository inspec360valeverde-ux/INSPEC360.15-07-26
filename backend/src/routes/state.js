import express from 'express';
import { runSQL, querySQL } from '../database/connection.js';

const router = express.Router();

// GET /api/state — load full app state
router.get('/', (req, res) => {
  try {
    const rows = querySQL('SELECT value FROM app_state WHERE key = ?', ['app_data']);
    if (rows.length > 0) {
      res.json({ state: JSON.parse(rows[0].value), found: true });
    } else {
      res.json({ state: null, found: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/state — save full app state
router.post('/', (req, res) => {
  try {
    const stateJson = JSON.stringify(req.body.state);
    const now = new Date().toISOString();
    const existing = querySQL('SELECT key FROM app_state WHERE key = ?', ['app_data']);
    if (existing.length > 0) {
      runSQL('UPDATE app_state SET value = ?, updated_at = ? WHERE key = ?', [stateJson, now, 'app_data']);
    } else {
      runSQL('INSERT INTO app_state (key, value, updated_at) VALUES (?, ?, ?)', ['app_data', stateJson, now]);
    }
    res.json({ success: true, updated_at: now });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/state/export — download the state as a JSON file
router.get('/export', (req, res) => {
  try {
    const rows = querySQL('SELECT value, updated_at FROM app_state WHERE key = ?', ['app_data']);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Sem dados para exportar' });
    }
    const state = JSON.parse(rows[0].value);
    const filename = `inspec360_export_${new Date().toISOString().slice(0,10)}.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');
    res.json({
      exported_at: rows[0].updated_at,
      version: '2.2.0',
      data: state,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
