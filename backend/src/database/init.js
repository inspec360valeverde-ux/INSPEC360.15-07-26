import { initDb, runSQL } from './connection.js';

export async function initializeDatabase() {
  console.log('🔧 Inicializando banco de dados...');
  
  await initDb();
  console.log('✅ Conexão estabelecida');

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. TABELA DE USUÁRIOS
  // ─────────────────────────────────────────────────────────────────────────────
  runSQL(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('tecnico', 'supervisor', 'superadm')),
      status TEXT NOT NULL CHECK(status IN ('active', 'inactive')),
      lastLogin TEXT,
      avatar TEXT,
      phone TEXT,
      createdAt TEXT NOT NULL
    )
  `);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. TABELA DE ESTRUTURAS
  // ─────────────────────────────────────────────────────────────────────────────
  runSQL(`
    CREATE TABLE IF NOT EXISTS structures (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('Suspensão', 'Ancoragem', 'Transposição', 'Terminal', 'Ângulo', 'Estaiada')),
      classe TEXT,
      coordX REAL NOT NULL,
      coordY REAL NOT NULL,
      progressiva REAL NOT NULL,
      deflexao REAL,
      alturaUtil REAL,
      vanFrente REAL,
      cotaCentro REAL,
      lt TEXT NOT NULL,
      voltage TEXT NOT NULL,
      cadeiaCondutor TEXT,
      qtdCadeias INTEGER,
      cadeiaParaRaios TEXT,
      qtdCadeiasPR INTEGER,
      estruturaCritica INTEGER DEFAULT 0,
      status TEXT NOT NULL CHECK(status IN ('pendente', 'em-andamento', 'concluido', 'anomalia', 'atrasado')),
      observation TEXT,
      createdBy TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(createdBy) REFERENCES users(id)
    )
  `);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. TABELA DE REGRAS DE COMPONENTES
  // ─────────────────────────────────────────────────────────────────────────────
  runSQL(`
    CREATE TABLE IF NOT EXISTS componentRules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      description TEXT,
      anomalies TEXT NOT NULL
    )
  `);

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. TABELA DE ORDENS DE SERVIÇO
  // ─────────────────────────────────────────────────────────────────────────────
  runSQL(`
    CREATE TABLE IF NOT EXISTS serviceOrders (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('inspecao', 'execucao')),
      structureId TEXT NOT NULL,
      structureName TEXT NOT NULL,
      supervisorId TEXT NOT NULL,
      supervisorName TEXT NOT NULL,
      technicianId TEXT,
      technicianName TEXT,
      status TEXT NOT NULL CHECK(status IN ('pendente', 'em-andamento', 'pausado', 'concluido', 'cancelado')),
      startDate TEXT,
      endDate TEXT,
      priority TEXT CHECK(priority IN ('baixa', 'media', 'alta', 'critica')),
      description TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY(structureId) REFERENCES structures(id),
      FOREIGN KEY(supervisorId) REFERENCES users(id),
      FOREIGN KEY(technicianId) REFERENCES users(id)
    )
  `);

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. TABELA DE INSPEÇÕES
  // ─────────────────────────────────────────────────────────────────────────────
  runSQL(`
    CREATE TABLE IF NOT EXISTS inspectionRecords (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      estruturaId TEXT NOT NULL,
      estruturaNome TEXT NOT NULL,
      supervisorId TEXT NOT NULL,
      supervisorNome TEXT NOT NULL,
      tecnicoId TEXT NOT NULL,
      tecnicoNome TEXT NOT NULL,
      dataHoraAbertura TEXT NOT NULL,
      dataHoraFim TEXT,
      status TEXT NOT NULL CHECK(status IN ('aberto', 'em-andamento', 'pausado', 'concluido', 'cancelado')),
      observacoesGerais TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY(orderId) REFERENCES serviceOrders(id),
      FOREIGN KEY(estruturaId) REFERENCES structures(id),
      FOREIGN KEY(supervisorId) REFERENCES users(id),
      FOREIGN KEY(tecnicoId) REFERENCES users(id)
    )
  `);

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. TABELA DE COMPONENTES INSPECIONADOS
  // ─────────────────────────────────────────────────────────────────────────────
  runSQL(`
    CREATE TABLE IF NOT EXISTS componentInspections (
      id TEXT PRIMARY KEY,
      inspectionId TEXT NOT NULL,
      componentId TEXT NOT NULL,
      componentName TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pendente', 'ok', 'anomalia', 'nao-aplicavel')),
      notes TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(inspectionId) REFERENCES inspectionRecords(id),
      FOREIGN KEY(componentId) REFERENCES componentRules(id)
    )
  `);

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. TABELA DE ANOMALIAS
  // ─────────────────────────────────────────────────────────────────────────────
  runSQL(`
    CREATE TABLE IF NOT EXISTS anomalies (
      id TEXT PRIMARY KEY,
      componentInspectionId TEXT NOT NULL,
      inspectionId TEXT NOT NULL,
      anomalyName TEXT NOT NULL,
      severity TEXT CHECK(severity IN ('baixa', 'media', 'alta', 'critica')),
      phase TEXT CHECK(phase IN ('A', 'B', 'C', 'N', 'Geral')),
      isEmenda INTEGER DEFAULT 0,
      safetyRisk TEXT,
      operationalRisk TEXT,
      requiresShutdown INTEGER DEFAULT 0,
      isRecurrent INTEGER DEFAULT 0,
      observation TEXT,
      photoId TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(componentInspectionId) REFERENCES componentInspections(id),
      FOREIGN KEY(inspectionId) REFERENCES inspectionRecords(id)
    )
  `);

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. TABELA DE FOTOS (com Georeferenciamento)
  // ─────────────────────────────────────────────────────────────────────────────
  runSQL(`
    CREATE TABLE IF NOT EXISTS inspectionPhotos (
      id TEXT PRIMARY KEY,
      inspectionId TEXT NOT NULL,
      componentId TEXT,
      componentName TEXT,
      anomalyId TEXT,
      anomalyName TEXT,
      filePath TEXT NOT NULL,
      storagePath TEXT,
      caption TEXT,
      timestamp TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      accuracy REAL,
      FOREIGN KEY(inspectionId) REFERENCES inspectionRecords(id),
      FOREIGN KEY(componentId) REFERENCES componentRules(id),
      FOREIGN KEY(anomalyId) REFERENCES anomalies(id)
    )
  `);

  // Adicionar colunas de GPS se não existirem (para banco existente)
  runSQL(`
    PRAGMA table_info(inspectionPhotos);
  `).then(columns => {
    const hasLatitude = columns.some(col => col.name === 'latitude');
    if (!hasLatitude) {
      runSQL('ALTER TABLE inspectionPhotos ADD COLUMN latitude REAL');
      runSQL('ALTER TABLE inspectionPhotos ADD COLUMN longitude REAL');
      runSQL('ALTER TABLE inspectionPhotos ADD COLUMN accuracy REAL');
      runSQL('ALTER TABLE inspectionPhotos ADD COLUMN anomalyName TEXT');
    }
  }).catch(() => {
    // Ignorar erros ao verificar
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. TABELA DE HISTÓRICO DE PAUSAS
  // ─────────────────────────────────────────────────────────────────────────────
  runSQL(`
    CREATE TABLE IF NOT EXISTS pauseHistory (
      id TEXT PRIMARY KEY,
      inspectionId TEXT NOT NULL,
      pausedAt TEXT NOT NULL,
      resumedAt TEXT,
      motivo TEXT,
      userId TEXT NOT NULL,
      userName TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(inspectionId) REFERENCES inspectionRecords(id),
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `);

  // ─────────────────────────────────────────────────────────────────────────────
  // 10. TABELA DE EXECUÇÕES
  // ─────────────────────────────────────────────────────────────────────────────
  runSQL(`
    CREATE TABLE IF NOT EXISTS executionRecords (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      estruturaId TEXT NOT NULL,
      estruturaNome TEXT NOT NULL,
      supervisorId TEXT NOT NULL,
      supervisorNome TEXT NOT NULL,
      tecnicoId TEXT NOT NULL,
      tecnicoNome TEXT NOT NULL,
      dataHoraAbertura TEXT NOT NULL,
      dataHoraFim TEXT,
      status TEXT NOT NULL CHECK(status IN ('aberto', 'em-andamento', 'pausado', 'concluido', 'cancelado')),
      observacoesGerais TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY(orderId) REFERENCES serviceOrders(id),
      FOREIGN KEY(estruturaId) REFERENCES structures(id),
      FOREIGN KEY(supervisorId) REFERENCES users(id),
      FOREIGN KEY(tecnicoId) REFERENCES users(id)
    )
  `);

  // ─────────────────────────────────────────────────────────────────────────────
  // DADOS INICIAIS
  // ─────────────────────────────────────────────────────────────────────────────

  // Usuários padrão
  const usuarios = [
    ['admin@inspec360.com', 'Administrador', 'admin123', 'superadm', 'active'],
    ['supervisor@inspec360.com', 'Supervisor Valdez', 'sup123', 'supervisor', 'active'],
    ['tecnico@inspec360.com', 'Técnico Silva', 'tec123', 'tecnico', 'active']
  ];

  usuarios.forEach((u, i) => {
    runSQL(
      'INSERT OR IGNORE INTO users (id, email, name, password, role, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [`usr_${i}`, u[0], u[1], u[2], u[3], u[4], new Date().toISOString()]
    );
  });

  // Componentes padrão
  const components = [
    ['isoladores', 'Isoladores', '🔌', 'Isoladores de porcelana ou vidro', JSON.stringify(['Trinca', 'Rachadura', 'Descascamento', 'Contaminação', 'Acúmulo de sujeira'])],
    ['ferragens', 'Ferragens', '🔩', 'Estrutura metálica e parafusos', JSON.stringify(['Corrosão', 'Soltura', 'Flexão', 'Fissura', 'Oxidação'])],
    ['cadeias', 'Cadeias de Isoladores', '⛓️', 'Cadeias de isoladores', JSON.stringify(['Emenda', 'Isolador quebrado', 'Ferragem danificada'])],
    ['para_raios', 'Para-Raios', '⚡', 'Proteção contra raios', JSON.stringify(['Desalinhamento', 'Corrosão', 'Soltura de parafusos'])],
    ['condutores', 'Condutores', '🔌', 'Fios e cabos condutores', JSON.stringify(['Dano na isolação', 'Corrosão', 'Flecha excessiva', 'Galho sobre condutor'])],
    ['estrutura', 'Estrutura', '🏗️', 'Estrutura metálica principal', JSON.stringify(['Fissura na solda', 'Corrosão avançada', 'Deformação'])]
  ];

  components.forEach(component => {
    runSQL(
      'INSERT OR IGNORE INTO componentRules (id, name, icon, description, anomalies) VALUES (?, ?, ?, ?, ?)',
      component
    );
  });

  console.log('✅ Banco de dados inicializado com sucesso!');
}

export default initializeDatabase;
