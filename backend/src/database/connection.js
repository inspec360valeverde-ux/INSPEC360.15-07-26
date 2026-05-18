import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../data/inspec360.db');

let db = null;
let SQL = null;

// ─────────────────────────────────────────────────────────────────────────────
// Inicialização do Banco de Dados
// ─────────────────────────────────────────────────────────────────────────────

export async function initDb() {
  if (!db) {
    console.log('📦 Carregando sql.js...');
    SQL = await initSqlJs();
    
    // Garantir que pasta data existe
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      console.log(`📁 Criando diretório: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Tentar carregar banco existente
    if (fs.existsSync(dbPath)) {
      console.log(`📂 Carregando banco existente: ${dbPath}`);
      const buffer = fs.readFileSync(dbPath);
      db = new SQL.Database(buffer);
      console.log(`✅ Banco carregado (${buffer.length} bytes)`);
    } else {
      // Criar novo banco
      console.log(`🆕 Criando novo banco de dados...`);
      db = new SQL.Database();
      saveDb(); // Salvar banco vazio para garantir arquivo
      console.log(`✅ Banco criado: ${dbPath}`);
    }
  }
  return db;
}

// ─────────────────────────────────────────────────────────────────────────────
// Obter Instância do Banco
// ─────────────────────────────────────────────────────────────────────────────

export function getDb() {
  if (!db) throw new Error('Banco de dados não inicializado. Chame initDb() primeiro.');
  return db;
}

// ─────────────────────────────────────────────────────────────────────────────
// Persistência do Banco de Dados
// ─────────────────────────────────────────────────────────────────────────────

export function saveDb() {
  if (!db) {
    console.warn('⚠️ Tentativa de salvar banco não inicializado');
    return false;
  }
  
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    
    // Garantir que o diretório existe
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Escrever arquivo
    fs.writeFileSync(dbPath, buffer);
    console.log(`💾 Banco salvo: ${dbPath} (${buffer.length} bytes)`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar banco:', error.message);
    return false;
  }
}

export function closeDb() {
  if (db) {
    try {
      saveDb();
      db.close();
      db = null;
      console.log('✅ Banco de dados fechado');
    } catch (error) {
      console.error('❌ Erro ao fechar banco:', error.message);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Executar SQL (sem retorno)
// ─────────────────────────────────────────────────────────────────────────────

export function runSQL(sql, params = []) {
  if (!db) throw new Error('Banco de dados não inicializado');
  
  try {
    db.run(sql, params);
    saveDb(); // Salvar após cada operação
    return { success: true };
  } catch (err) {
    console.error('❌ Erro SQL:', err.message);
    console.error('   SQL:', sql);
    console.error('   Params:', params);
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Query com Resultados
// ─────────────────────────────────────────────────────────────────────────────

export function querySQL(sql, params = []) {
  if (!db) throw new Error('Banco de dados não inicializado');
  
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    
    return results;
  } catch (err) {
    console.error('❌ Erro Query:', err.message);
    console.error('   SQL:', sql);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Query Simples (um resultado)
// ─────────────────────────────────────────────────────────────────────────────

export function querySQLOne(sql, params = []) {
  const results = querySQL(sql, params);
  return results.length > 0 ? results[0] : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilitários de Conversão
// ─────────────────────────────────────────────────────────────────────────────

export function boolToInt(value) {
  return value ? 1 : 0;
}

export function intToBool(value) {
  return value === 1 || value === true;
}

export function parseJson(jsonString, defaultValue = null) {
  try {
    return jsonString ? JSON.parse(jsonString) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Info do Banco de Dados
// ─────────────────────────────────────────────────────────────────────────────

export function getDbInfo() {
  if (!db) return null;
  
  try {
    const fileSizeBytes = fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0;
    const tables = querySQL("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    
    return {
      path: dbPath,
      sizeBytes: fileSizeBytes,
      sizeMB: (fileSizeBytes / (1024 * 1024)).toFixed(2),
      tables: tables.map(t => t.name),
      tableCount: tables.length,
      lastModified: fs.existsSync(dbPath) ? fs.statSync(dbPath).mtime : null
    };
  } catch (error) {
    console.error('Erro ao obter info do banco:', error);
    return null;
  }
}
