import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { initDb, closeDb, getDbInfo } from './database/connection.js';
import { initializeDatabase } from './database/init.js';
import * as queries from './database/queries.js';

import usersRouter from './routes/users.js';
import structuresRouter from './routes/structures.js';
import componentsRouter from './routes/components.js';
import serviceOrdersRouter from './routes/serviceOrders.js';
import inspectionsRouter from './routes/inspections.js';
import executionsRouter from './routes/executions.js';
import photosRouter from './routes/photos.js';
import stateRouter from './routes/state.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// ─────────────────────────────────────────────────────────────────────────────
// ROTAS DA API
// ─────────────────────────────────────────────────────────────────────────────

app.use('/api/users', usersRouter);
app.use('/api/structures', structuresRouter);
app.use('/api/components', componentsRouter);
app.use('/api/service-orders', serviceOrdersRouter);
app.use('/api/inspections', inspectionsRouter);
app.use('/api/executions', executionsRouter);
app.use('/api/photos', photosRouter);
app.use('/api/state', stateRouter);

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.2.0'
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DIAGNÓSTICO - Informações do Banco de Dados
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/diagnostics/database', (req, res) => {
  try {
    const dbInfo = getDbInfo();
    
    if (!dbInfo) {
      return res.status(500).json({
        error: 'Banco de dados não está pronto',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      status: 'ok',
      database: {
        path: dbInfo.path,
        sizeBytes: dbInfo.sizeBytes,
        sizeMB: dbInfo.sizeMB,
        tableCount: dbInfo.tableCount,
        tables: dbInfo.tables,
        lastModified: dbInfo.lastModified
      },
      dataLocations: {
        banco: dbInfo.path,
        fotos: path.join(__dirname, '../public/images/inspections'),
        logs: path.join(__dirname, '../../data/logs')
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DIAGNÓSTICO - Contagem de Dados
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/diagnostics/stats', (req, res) => {
  try {
    const stats = {
      usuarios: queries.getAllUsers().length,
      estruturas: queries.getAllStructures().length,
      componentes: queries.getAllComponents().length,
      ordensServico: queries.getAllServiceOrders().length,
      inspecoes: queries.getAllInspections().length,
      anomalias: queries.getAllAnomalies().length,
      fotos: queries.getAllPhotos().length,
      execucoes: queries.getAllExecutions ? queries.getAllExecutions().length : 0
    };
    
    res.json({
      status: 'ok',
      stats,
      total: Object.values(stats).reduce((a, b) => a + b, 0),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// INICIALIZAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

async function startServer() {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║          🚀 INSPEC360 v2.2 - Backend Iniciado              ║
╚════════════════════════════════════════════════════════════╝

📡 Server em: http://localhost:${PORT}
🔧 API em: http://localhost:${PORT}/api
🏥 Health: http://localhost:${PORT}/api/health
📸 Imagens: http://localhost:${PORT}/images/inspections
✅ Banco de dados: SQLite Local

Rotas disponíveis:
  - GET    /api/users
  - POST   /api/users/login
  - GET    /api/structures
  - GET    /api/components
  - GET    /api/service-orders
  - GET    /api/inspections
  - POST   /api/inspections/:id/photos
  - GET    /api/executions
  - POST   /api/photos/upload

Pressione Ctrl+C para parar
    `);
  });
}

startServer().catch(err => {
  console.error('❌ Erro ao iniciar servidor:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📴 Encerrando servidor...');
  closeDb();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n📴 Encerrando servidor...');
  closeDb();
  process.exit(0);
});
