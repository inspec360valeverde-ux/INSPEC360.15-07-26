import { getDb } from './connection.js';
import { v4 as uuidv4 } from 'uuid';

// ═════════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═════════════════════════════════════════════════════════════════════════════

function executeQuery(sql, params = []) {
  const db = getDb();
  try {
    db.run(sql, params);
    return true;
  } catch (error) {
    console.error('SQL Error:', error, sql, params);
    throw new Error(`Database error: ${error.message}`);
  }
}

function queryOne(sql, params = []) {
  const db = getDb();
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  } catch (error) {
    console.error('SQL Error:', error, sql, params);
    throw new Error(`Database error: ${error.message}`);
  }
}

function queryAll(sql, params = []) {
  const db = getDb();
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  } catch (error) {
    console.error('SQL Error:', error, sql, params);
    throw new Error(`Database error: ${error.message}`);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// USERS
// ═════════════════════════════════════════════════════════════════════════════

export function getAllUsers() {
  return queryAll('SELECT * FROM users ORDER BY createdAt DESC');
}

export function getUserById(id) {
  return queryOne('SELECT * FROM users WHERE id = ?', [id]);
}

export function getUserByEmail(email) {
  return queryOne('SELECT * FROM users WHERE email = ?', [email]);
}

export function createUser(data) {
  const id = data.id || uuidv4();
  const createdAt = new Date().toISOString();
  
  executeQuery(
    `INSERT INTO users (id, name, email, password, role, status, createdAt, phone, avatar)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.name, data.email, data.password, data.role || 'tecnico', 'active', createdAt, data.phone || '', data.avatar || '']
  );
  
  return getUserById(id);
}

export function updateUser(id, data) {
  const updatedAt = new Date().toISOString();
  const lastLogin = data.lastLogin || updatedAt;
  
  const fields = [];
  const params = [];
  
  if (data.name) { fields.push('name = ?'); params.push(data.name); }
  if (data.email) { fields.push('email = ?'); params.push(data.email); }
  if (data.password) { fields.push('password = ?'); params.push(data.password); }
  if (data.role) { fields.push('role = ?'); params.push(data.role); }
  if (data.status) { fields.push('status = ?'); params.push(data.status); }
  if (data.phone) { fields.push('phone = ?'); params.push(data.phone); }
  if (data.avatar) { fields.push('avatar = ?'); params.push(data.avatar); }
  
  fields.push('lastLogin = ?');
  params.push(lastLogin);
  params.push(id);
  
  executeQuery(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
  return getUserById(id);
}

// ═════════════════════════════════════════════════════════════════════════════
// STRUCTURES
// ═════════════════════════════════════════════════════════════════════════════

export function getAllStructures() {
  return queryAll('SELECT * FROM structures ORDER BY progressiva ASC');
}

export function getStructureById(id) {
  return queryOne('SELECT * FROM structures WHERE id = ?', [id]);
}

export function createStructure(data) {
  const id = data.id || uuidv4();
  const createdAt = new Date().toISOString();
  
  executeQuery(
    `INSERT INTO structures 
     (id, name, type, classe, coordX, coordY, progressiva, deflexao, alturaUtil, vanFrente, 
      cotaCentro, lt, voltage, cadeiaCondutor, qtdCadeias, cadeiaParaRaios, qtdCadeiasPR, 
      estruturaCritica, status, observation, createdBy, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.name, data.type, data.classe || '', data.coordX || 0, data.coordY || 0, 
     data.progressiva || 0, data.deflexao || 0, data.alturaUtil || 0, data.vanFrente || 0,
     data.cotaCentro || 0, data.lt || '', data.voltage || '', data.cadeiaCondutor || '',
     data.qtdCadeias || 0, data.cadeiaParaRaios || '', data.qtdCadeiasPR || 0,
     data.estruturaCritica ? 1 : 0, data.status || 'pendente', data.observation || '', 
     data.createdBy || '', createdAt]
  );
  
  return getStructureById(id);
}

export function updateStructure(id, data) {
  const fields = [];
  const params = [];
  
  if (data.name) { fields.push('name = ?'); params.push(data.name); }
  if (data.type) { fields.push('type = ?'); params.push(data.type); }
  if (data.status) { fields.push('status = ?'); params.push(data.status); }
  if (data.classe !== undefined) { fields.push('classe = ?'); params.push(data.classe); }
  if (data.deflexao !== undefined) { fields.push('deflexao = ?'); params.push(data.deflexao); }
  if (data.observation !== undefined) { fields.push('observation = ?'); params.push(data.observation); }
  if (data.estruturaCritica !== undefined) { fields.push('estruturaCritica = ?'); params.push(data.estruturaCritica ? 1 : 0); }
  
  if (fields.length === 0) return getStructureById(id);
  
  params.push(id);
  executeQuery(`UPDATE structures SET ${fields.join(', ')} WHERE id = ?`, params);
  return getStructureById(id);
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENTS (REGRAS)
// ═════════════════════════════════════════════════════════════════════════════

export function getAllComponents() {
  return queryAll('SELECT * FROM componentRules ORDER BY name ASC');
}

export function getComponentById(id) {
  return queryOne('SELECT * FROM componentRules WHERE id = ?', [id]);
}

export function createComponent(data) {
  const id = data.id || uuidv4();
  
  executeQuery(
    `INSERT INTO componentRules (id, name, icon, description, anomalies)
     VALUES (?, ?, ?, ?, ?)`,
    [id, data.name, data.icon || '', data.description || '', data.anomalies || '']
  );
  
  return getComponentById(id);
}

// ═════════════════════════════════════════════════════════════════════════════
// SERVICE ORDERS
// ═════════════════════════════════════════════════════════════════════════════

export function getAllServiceOrders() {
  return queryAll('SELECT * FROM serviceOrders ORDER BY createdAt DESC');
}

export function getServiceOrderById(id) {
  return queryOne('SELECT * FROM serviceOrders WHERE id = ?', [id]);
}

export function createServiceOrder(data) {
  const id = data.id || uuidv4();
  const now = new Date().toISOString();
  
  executeQuery(
    `INSERT INTO serviceOrders 
     (id, type, structureId, structureName, supervisorId, supervisorName, technicianId, 
      technicianName, status, startDate, priority, description, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.type || 'inspecao', data.structureId, data.structureName, data.supervisorId, 
     data.supervisorName, data.technicianId || null, data.technicianName || '', 
     data.status || 'pendente', data.startDate || now, data.priority || 'media', 
     data.description || '', now, now]
  );
  
  return getServiceOrderById(id);
}

export function updateServiceOrder(id, data) {
  const fields = [];
  const params = [];
  const updatedAt = new Date().toISOString();
  
  if (data.status) { fields.push('status = ?'); params.push(data.status); }
  if (data.technicianId !== undefined) { fields.push('technicianId = ?'); params.push(data.technicianId); }
  if (data.technicianName) { fields.push('technicianName = ?'); params.push(data.technicianName); }
  if (data.startDate) { fields.push('startDate = ?'); params.push(data.startDate); }
  if (data.endDate) { fields.push('endDate = ?'); params.push(data.endDate); }
  if (data.priority) { fields.push('priority = ?'); params.push(data.priority); }
  if (data.description !== undefined) { fields.push('description = ?'); params.push(data.description); }
  
  fields.push('updatedAt = ?');
  params.push(updatedAt);
  params.push(id);
  
  executeQuery(`UPDATE serviceOrders SET ${fields.join(', ')} WHERE id = ?`, params);
  return getServiceOrderById(id);
}

// ═════════════════════════════════════════════════════════════════════════════
// INSPECTIONS
// ═════════════════════════════════════════════════════════════════════════════

export function getAllInspections() {
  return queryAll('SELECT * FROM inspectionRecords ORDER BY dataHoraAbertura DESC');
}

export function getInspectionById(id) {
  return queryOne('SELECT * FROM inspectionRecords WHERE id = ?', [id]);
}

export function createInspection(data) {
  const id = data.id || uuidv4();
  const now = new Date().toISOString();
  
  executeQuery(
    `INSERT INTO inspectionRecords 
     (id, orderId, estruturaId, estruturaNome, supervisorId, supervisorNome, tecnicoId, 
      tecnicoNome, dataHoraAbertura, status, observacoesGerais, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.orderId, data.estruturaId, data.estruturaNome, data.supervisorId, 
     data.supervisorNome, data.tecnicoId, data.tecnicoNome, data.dataHoraAbertura || now, 
     data.status || 'aberto', data.observacoesGerais || '', now, now]
  );
  
  return getInspectionById(id);
}

export function updateInspection(id, data) {
  const fields = [];
  const params = [];
  const updatedAt = new Date().toISOString();
  
  if (data.status) { fields.push('status = ?'); params.push(data.status); }
  if (data.dataHoraFim) { fields.push('dataHoraFim = ?'); params.push(data.dataHoraFim); }
  if (data.observacoesGerais !== undefined) { fields.push('observacoesGerais = ?'); params.push(data.observacoesGerais); }
  
  fields.push('updatedAt = ?');
  params.push(updatedAt);
  params.push(id);
  
  executeQuery(`UPDATE inspectionRecords SET ${fields.join(', ')} WHERE id = ?`, params);
  return getInspectionById(id);
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT INSPECTIONS
// ═════════════════════════════════════════════════════════════════════════════

export function getAllComponentInspections() {
  return queryAll('SELECT * FROM componentInspections ORDER BY createdAt DESC');
}

export function getComponentInspectionById(id) {
  return queryOne('SELECT * FROM componentInspections WHERE id = ?', [id]);
}

export function getComponentInspectionsByInspectionId(inspectionId) {
  return queryAll('SELECT * FROM componentInspections WHERE inspectionId = ? ORDER BY createdAt DESC', [inspectionId]);
}

export function createComponentInspection(data) {
  const id = data.id || uuidv4();
  const now = new Date().toISOString();
  
  executeQuery(
    `INSERT INTO componentInspections 
     (id, inspectionId, componentId, componentName, status, notes, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, data.inspectionId, data.componentId, data.componentName, 
     data.status || 'pendente', data.notes || '', now]
  );
  
  return getComponentInspectionById(id);
}

export function updateComponentInspection(id, data) {
  const fields = [];
  const params = [];
  
  if (data.status) { fields.push('status = ?'); params.push(data.status); }
  if (data.notes !== undefined) { fields.push('notes = ?'); params.push(data.notes); }
  
  if (fields.length === 0) return getComponentInspectionById(id);
  
  params.push(id);
  executeQuery(`UPDATE componentInspections SET ${fields.join(', ')} WHERE id = ?`, params);
  return getComponentInspectionById(id);
}

// ═════════════════════════════════════════════════════════════════════════════
// ANOMALIES
// ═════════════════════════════════════════════════════════════════════════════

export function getAllAnomalies() {
  return queryAll('SELECT * FROM anomalies ORDER BY createdAt DESC');
}

export function getAnomalyById(id) {
  return queryOne('SELECT * FROM anomalies WHERE id = ?', [id]);
}

export function getAnomaliesByInspectionId(inspectionId) {
  return queryAll('SELECT * FROM anomalies WHERE inspectionId = ? ORDER BY createdAt DESC', [inspectionId]);
}

export function createAnomaly(data) {
  const id = data.id || uuidv4();
  const now = new Date().toISOString();
  
  executeQuery(
    `INSERT INTO anomalies 
     (id, componentInspectionId, inspectionId, anomalyName, severity, phase, isEmenda, 
      safetyRisk, operationalRisk, requiresShutdown, isRecurrent, observation, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.componentInspectionId, data.inspectionId, data.anomalyName, 
     data.severity || 'media', data.phase || 'Geral', data.isEmenda ? 1 : 0,
     data.safetyRisk || '', data.operationalRisk || '', data.requiresShutdown ? 1 : 0,
     data.isRecurrent ? 1 : 0, data.observation || '', now]
  );
  
  return getAnomalyById(id);
}

export function updateAnomaly(id, data) {
  const fields = [];
  const params = [];
  
  if (data.severity) { fields.push('severity = ?'); params.push(data.severity); }
  if (data.safetyRisk !== undefined) { fields.push('safetyRisk = ?'); params.push(data.safetyRisk); }
  if (data.operationalRisk !== undefined) { fields.push('operationalRisk = ?'); params.push(data.operationalRisk); }
  if (data.observation !== undefined) { fields.push('observation = ?'); params.push(data.observation); }
  
  if (fields.length === 0) return getAnomalyById(id);
  
  params.push(id);
  executeQuery(`UPDATE anomalies SET ${fields.join(', ')} WHERE id = ?`, params);
  return getAnomalyById(id);
}

// ═════════════════════════════════════════════════════════════════════════════
// PHOTOS
// ═════════════════════════════════════════════════════════════════════════════

export function getAllPhotos() {
  return queryAll('SELECT * FROM inspectionPhotos ORDER BY timestamp DESC');
}

export function getPhotoById(id) {
  return queryOne('SELECT * FROM inspectionPhotos WHERE id = ?', [id]);
}

export function getPhotosByInspectionId(inspectionId) {
  return queryAll('SELECT * FROM inspectionPhotos WHERE inspectionId = ? ORDER BY timestamp DESC', [inspectionId]);
}

export function createPhoto(data) {
  const id = data.id || uuidv4();
  const now = new Date().toISOString();
  
  executeQuery(
    `INSERT INTO inspectionPhotos 
     (id, inspectionId, componentId, componentName, anomalyId, anomalyName, filePath, storagePath, 
      caption, timestamp, createdAt, latitude, longitude, accuracy)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, 
      data.inspectionId, 
      data.componentId || null, 
      data.componentName || '', 
      data.anomalyId || null,
      data.anomalyName || '',
      data.filePath, 
      data.storagePath || '', 
      data.caption || '', 
      data.timestamp || now, 
      now,
      data.latitude || null,
      data.longitude || null,
      data.accuracy || null
    ]
  );
  
  return getPhotoById(id);
}

// ═════════════════════════════════════════════════════════════════════════════
// PAUSE HISTORY
// ═════════════════════════════════════════════════════════════════════════════

export function createPauseHistory(data) {
  const id = data.id || uuidv4();
  const now = new Date().toISOString();
  
  executeQuery(
    `INSERT INTO pauseHistory 
     (id, inspectionId, pausedAt, motivo, userId, userName, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, data.inspectionId, data.pausedAt || now, data.motivo || '', 
     data.userId, data.userName, now]
  );
  
  return id;
}

export function updatePauseHistory(id, resumedAt) {
  executeQuery('UPDATE pauseHistory SET resumedAt = ? WHERE id = ?', [resumedAt, id]);
}

export function getPauseHistoryByInspectionId(inspectionId) {
  return queryAll('SELECT * FROM pauseHistory WHERE inspectionId = ? ORDER BY pausedAt DESC', [inspectionId]);
}

// ═════════════════════════════════════════════════════════════════════════════
// EXECUTIONS
// ═════════════════════════════════════════════════════════════════════════════

export function getAllExecutions() {
  return queryAll('SELECT * FROM executionRecords ORDER BY dataHoraAbertura DESC');
}

export function getExecutionById(id) {
  return queryOne('SELECT * FROM executionRecords WHERE id = ?', [id]);
}

export function createExecution(data) {
  const id = data.id || uuidv4();
  const now = new Date().toISOString();
  
  executeQuery(
    `INSERT INTO executionRecords 
     (id, orderId, estruturaId, estruturaNome, supervisorId, supervisorNome, tecnicoId, 
      tecnicoNome, dataHoraAbertura, status, observacoesGerais, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.orderId, data.estruturaId, data.estruturaNome, data.supervisorId, 
     data.supervisorNome, data.tecnicoId, data.tecnicoNome, data.dataHoraAbertura || now, 
     data.status || 'aberto', data.observacoesGerais || '', now, now]
  );
  
  return getExecutionById(id);
}

export function updateExecution(id, data) {
  const fields = [];
  const params = [];
  const updatedAt = new Date().toISOString();
  
  if (data.status) { fields.push('status = ?'); params.push(data.status); }
  if (data.dataHoraFim) { fields.push('dataHoraFim = ?'); params.push(data.dataHoraFim); }
  if (data.observacoesGerais !== undefined) { fields.push('observacoesGerais = ?'); params.push(data.observacoesGerais); }
  
  fields.push('updatedAt = ?');
  params.push(updatedAt);
  params.push(id);
  
  executeQuery(`UPDATE executionRecords SET ${fields.join(', ')} WHERE id = ?`, params);
  return getExecutionById(id);
}
