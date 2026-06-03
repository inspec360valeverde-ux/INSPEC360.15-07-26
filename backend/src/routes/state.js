import express from 'express';
import { runSQL, getQuery } from '../database/postgres-connection.js';

const router = express.Router();

// GET /api/state — load full app state
router.get('/', async (req, res) => {
  try {
    try {
      const rows = await getQuery('SELECT value FROM state WHERE key = $1', ['app_data']);
      if (rows.length > 0) {
        res.json({ state: JSON.parse(rows[0].value), found: true });
      } else {
        res.json({ state: null, found: false });
      }
    } catch (dbError) {
      // Se falhar banco de dados, retornar sem estado
      console.warn('⚠️ Aviso ao carregar estado do BD:', dbError.message);
      res.json({ state: null, found: false, offline: true });
    }
  } catch (error) {
    console.error('❌ Erro ao processar GET state:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/state — save full app state
router.post('/', async (req, res) => {
  try {
    const stateJson = JSON.stringify(req.body.state);
    const now = new Date().toISOString();
    
    try {
      const existing = await getQuery('SELECT key FROM state WHERE key = $1', ['app_data']);
      if (existing.length > 0) {
        await runSQL('UPDATE state SET value = $1, "updatedAt" = $2 WHERE key = $3', [stateJson, now, 'app_data']);
      } else {
        await runSQL('INSERT INTO state (key, value, "updatedAt") VALUES ($1, $2, $3)', ['app_data', stateJson, now]);
      }
    } catch (dbError) {
      // Se falhar banco de dados, apenas log e continue (localStorage é fallback)
      console.warn('⚠️ Aviso ao salvar estado no BD:', dbError.message);
    }
    
    // Sempre retornar sucesso - o frontend tem localStorage como fallback
    res.json({ success: true, updated_at: now });
  } catch (error) {
    console.error('❌ Erro ao processar estado:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/state/export — download the state as a JSON file
router.get('/export', async (req, res) => {
  try {
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
    } catch (dbError) {
      console.warn('⚠️ Aviso ao exportar estado:', dbError.message);
      return res.status(503).json({ error: 'Banco de dados indisponível', offline: true });
    }
  } catch (error) {
    console.error('❌ Erro ao processar export:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
