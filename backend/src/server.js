import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';
import { initDb, closeDb } from './database/postgres-connection.js';
import { initializeDatabase } from './database/init-postgres.js';
import * as queries from './database/queries-postgres.js';

import usersRouter from './routes/users.js';
import structuresRouter from './routes/structures.js';
import componentsRouter from './routes/components.js';
import serviceOrdersRouter from './routes/serviceOrders.js';
import inspectionsRouter from './routes/inspections.js';
import executionsRouter from './routes/executions.js';
import photosRouter from './routes/photos.js';
import stateRouter from './routes/state.js';
import adminRouter from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((value) => value.trim()).filter(Boolean)
  : true;

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ─────────────────────────────────────────────────────────────────────────────
// HEADERS DE CACHE - Evitar cache agressivo de arquivos críticos
// ─────────────────────────────────────────────────────────────────────────────

app.use((req, res, next) => {
  // Arquivos críticos que NUNCA devem ser cacheados
  if (req.path.match(/\/(index\.html|service-worker\.js|version\.json|manifest\.json)$/)) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate, public, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  // Assets com hash podem ser cacheados por muito tempo
  else if (req.path.match(/\.(js|css|jpg|png|gif|woff|woff2)$/)) {
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 ano
  }
  // API routes nunca devem ser cacheadas
  else if (req.path.startsWith('/api/')) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  
  next();
});

// Servir arquivos estáticos do public
app.use(express.static(path.join(__dirname, '../public')));

// Servir frontend estático (build do Vite)
const distPath = path.join(__dirname, '../../dist');
console.log(`[Server] Verificando dist em: ${distPath}`);
console.log(`[Server] Dist existe? ${fs.existsSync(distPath)}`);

if (fs.existsSync(distPath)) {
  console.log(`[Server] ✅ Servindo arquivos estáticos do dist`);
  app.use(express.static(distPath));
  
  // Fallback para SPA: redirecionar rotas desconhecidas para index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
} else {
  console.warn(`[Server] ⚠️  AVISO: Diretório dist não encontrado em ${distPath}`);
  console.warn(`[Server] Listando diretório raiz:`, fs.readdirSync(path.join(__dirname, '../../')));
}

// ─────────────────────────────────────────────────────────────────────────────
// ROTAS DA API
// ─────────────────────────────────────────────────────────────────────────────

// Debug endpoint para diagnosticar problema de build
app.get('/api/debug/build-info', (req, res) => {
  const distExists = fs.existsSync(distPath);
  const distFiles = distExists ? fs.readdirSync(distPath) : [];
  const distIndexExists = distExists ? fs.existsSync(path.join(distPath, 'index.html')) : false;
  
  const versionFile = path.join(__dirname, '../public/version.json');
  let versionData = null;
  try {
    versionData = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
  } catch (e) {
    versionData = { error: e.message };
  }
  
  res.json({
    timestamp: new Date().toISOString(),
    distPath: distPath,
    distExists: distExists,
    distFiles: distFiles,
    distIndexExists: distIndexExists,
    distSize: distExists ? fs.statSync(distPath).size : 0,
    version: versionData,
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    uptime: process.uptime()
  });
});

app.use('/api/users', usersRouter);
app.use('/api/structures', structuresRouter);
app.use('/api/components', componentsRouter);
app.use('/api/service-orders', serviceOrdersRouter);
app.use('/api/inspections', inspectionsRouter);
app.use('/api/executions', executionsRouter);
app.use('/api/photos', photosRouter);
app.use('/api/state', stateRouter);
app.use('/api/admin', adminRouter);

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'postgresql',
    timestamp: new Date().toISOString(),
    version: '2.2.0',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DIAGNÓSTICO - Contagem de Dados
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/diagnostics/stats', async (req, res) => {
  try {
    const stats = {
      usuarios: (await queries.getAllUsers()).length,
      estruturas: (await queries.getAllStructures()).length,
      componentes: (await queries.getAllComponents()).length,
      ordensServico: (await queries.getAllServiceOrders()).length,
      inspecoes: (await queries.getAllInspections()).length,
      anomalias: (await queries.getAllAnomalies()).length,
      fotos: (await queries.getAllPhotos()).length,
      execucoes: (await queries.getAllExecutions()).length
    };
    
    res.json({
      status: 'ok',
      database: 'postgresql',
      stats,
      total: Object.values(stats).reduce((a, b) => a + b, 0),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao gerar estatísticas:', error.message);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DIAGNÓSTICO - Teste de Conectividade
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/diagnostics/connection', async (req, res) => {
  try {
    // Testar conexão com uma query simples
    const result = await queries.getAllUsers();
    res.json({
      status: 'ok',
      database: 'postgresql',
      connection: 'success',
      sample: result.length > 0 ? `${result.length} usuários no banco` : 'Banco vazio (OK)',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    res.status(500).json({
      status: 'error',
      error: error.message,
      database: 'postgresql',
      connection: 'failed',
      timestamp: new Date().toISOString()
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// VERSÃO / BUILD INFO
// Retorna o conteúdo de public/version.json e, quando possível, a data do último commit git
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/version', (req, res) => {
  try {
    const versionPath = path.join(__dirname, '../public/version.json');
    let data = null;
    if (fs.existsSync(versionPath)) {
      data = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
    }

    // Tentar obter último commit via git (se disponível)
    let gitDate = null;
    try {
      const out = execSync('git log -1 --format=%cI', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
      if (out) gitDate = out;
    } catch (err) {
      // Ignore - git pode não estar disponível em ambiente de build
      gitDate = null;
    }

    const result = {
      version: data?.version || 'unknown',
      buildDate: data?.buildDate || gitDate || new Date().toISOString(),
      lastUpdate: data?.lastUpdate || null,
      gitDate
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SPA FALLBACK - Redirecionar todas as rotas não-API para index.html
// ─────────────────────────────────────────────────────────────────────────────

app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../../dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Frontend not built. Run: npm run build' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// INICIALIZAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

async function startServer() {
  try {
    console.log('🔧 Inicializando banco de dados PostgreSQL...');
    await initializeDatabase();
    console.log('✅ Banco de dados inicializado com sucesso!');
    
    const server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║          🚀 INSPEC360 v2.2 - Backend Operacional           ║
╚════════════════════════════════════════════════════════════╝

📡 Servidor em: http://localhost:${PORT}
🔧 API em: http://localhost:${PORT}/api
🏥 Health Check: http://localhost:${PORT}/api/health
📊 Estatísticas: http://localhost:${PORT}/api/diagnostics/stats
🔍 Teste Conexão: http://localhost:${PORT}/api/diagnostics/connection
🏞️  Imagens: http://localhost:${PORT}/images/inspections
✅ Banco: PostgreSQL (Remoto)
🔒 CORS: ${typeof corsOrigins === 'boolean' ? 'all origins' : corsOrigins.join(', ')}

Rotas da API disponíveis:
  ├─ POST   /api/users              → Criar usuário
  ├─ POST   /api/users/login        → Login
  ├─ GET    /api/users              → Listar usuários
  ├─ GET    /api/structures         → Listar estruturas
  ├─ POST   /api/structures         → Criar estrutura
  ├─ GET    /api/components         → Listar componentes
  ├─ GET    /api/service-orders     → Listar ordens
  ├─ POST   /api/service-orders     → Criar ordem
  ├─ GET    /api/inspections        → Listar inspeções
  ├─ POST   /api/inspections        → Criar inspeção
  ├─ POST   /api/photos/upload      → Upload de foto
  ├─ GET    /api/executions         → Listar execuções
  └─ POST   /api/executions         → Criar execução

Pressione Ctrl+C para parar

Variáveis de ambiente:
  - PORT: ${process.env.PORT}
  - CORS_ORIGIN: ${process.env.CORS_ORIGIN}
  - DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Configurada' : '❌ NÃO CONFIGURADA'}
      `);
    });
    
    return server;
  } catch (error) {
    console.error('❌ ERRO ao iniciar servidor:', error.message);
    console.error('📝 Stack:', error.stack);
    process.exit(1);
  }
}

startServer().catch(err => {
  console.error('❌ Erro fatal ao iniciar servidor:', err);
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
