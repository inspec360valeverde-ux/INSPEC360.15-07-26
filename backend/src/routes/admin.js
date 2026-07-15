import express from 'express';
import { runSQL, getQuery } from '../database/postgres-connection.js';

const router = express.Router();

// Chave de segurança para limpeza de dados
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'inspec360-admin-2026';

// Usuários padrão do sistema - nomes genéricos sem informações pessoais
const DEFAULT_USERS = [
  { email: 'admin@inspec360.com', name: 'Administrator', password: 'admin123', role: 'superadm' },
  { email: 'supervisor@inspec360.com', name: 'Supervisor', password: 'sup123', role: 'supervisor' },
  { email: 'tecnico@inspec360.com', name: 'Technician', password: 'tec123', role: 'tecnico' }
];

/**
 * POST /api/admin/clean-data
 * Limpa todos os dados simulados do banco, mantendo apenas usuários de teste
 * 
 * Body: { secret: "chave-administrador" }
 */
router.post('/clean-data', async (req, res) => {
  try {
    const { secret } = req.body;

    // Validar chave
    if (secret !== ADMIN_SECRET) {
      console.warn('⚠️  Tentativa de limpeza com chave inválida');
      return res.status(401).json({ 
        error: 'Chave de administrador inválida',
        timestamp: new Date().toISOString()
      });
    }

    console.log('🧹 Iniciando limpeza de dados simulados...\n');

    // Desabilitar constraints
    await runSQL('SET session_replication_role = REPLICA;');
    console.log('✅ Constraints desabilitadas');

    // Limpar dados (ordem importa por FK)
    const deletionOrder = [
      'pauses',
      'photos',
      'anomalies',
      '"componentInspections"',
      '"inspectionRecords"',
      '"serviceOrders"',
      'executions',
      'structures',
      'users',  // Deletar TODOS os usuários
      '"componentRules"',
      'state'
    ];

    console.log('🗑️  Limpando dados...');
    for (const table of deletionOrder) {
      await runSQL(`DELETE FROM ${table};`);
      console.log(`  ✓ ${table} deletada`);
    }

    // Reabilitar constraints
    await runSQL('SET session_replication_role = DEFAULT;');
    console.log('✅ Constraints reabilitadas\n');

    // Recriar componentes padrão
    console.log('🔧 Recriando componentes padrão...');
    const components = [
      ['isoladores', 'Isoladores', '🔌', 'Isoladores de porcelana ou vidro', JSON.stringify(['Trinca', 'Rachadura', 'Descascamento', 'Contaminação', 'Acúmulo de sujeira'])],
      ['ferragens', 'Ferragens', '🔩', 'Estrutura metálica e parafusos', JSON.stringify(['Corrosão', 'Soltura', 'Flexão', 'Fissura', 'Oxidação'])],
      ['cadeias', 'Cadeias de Isoladores', '⛓️', 'Cadeias de isoladores', JSON.stringify(['Emenda', 'Isolador quebrado', 'Ferragem danificada'])],
      ['para_raios', 'Para-Raios', '⚡', 'Proteção contra raios', JSON.stringify(['Desalinhamento', 'Corrosão', 'Soltura de parafusos'])],
      ['condutores', 'Condutores', '🔌', 'Fios e cabos condutores', JSON.stringify(['Dano na isolação', 'Corrosão', 'Flecha excessiva', 'Galho sobre condutor'])],
      ['estrutura', 'Estrutura', '🏗️', 'Estrutura metálica principal', JSON.stringify(['Fissura na solda', 'Corrosão avançada', 'Deformação'])]
    ];

    for (const component of components) {
      await runSQL(
        'INSERT INTO "componentRules" (id, name, icon, description, anomalies) VALUES ($1, $2, $3, $4, $5)',
        component
      );
    }
    console.log(`  ✓ ${components.length} componentes recriados\n`);

    // Recriar usuários padrão
    console.log('👥 Recriando usuários padrão...');
    for (let i = 0; i < DEFAULT_USERS.length; i++) {
      const u = DEFAULT_USERS[i];
      await runSQL(
        'INSERT INTO users (id, email, name, password, role, status, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [`usr_${i}`, u.email, u.name, u.password, u.role, 'active', new Date().toISOString()]
      );
    }
    console.log(`  ✓ ${DEFAULT_USERS.length} usuários recriados\n`);

    // Coletar estatísticas finais
    console.log('📊 ESTATÍSTICAS FINAIS:\n');
    
    const allTables = [
      'users', 'structures', 'componentRules', 'serviceOrders',
      'inspectionRecords', 'componentInspections', 'anomalies',
      'photos', 'executions', 'pauses', 'state'
    ];

    const stats = {};
    for (const table of allTables) {
      const result = await getQuery(`SELECT COUNT(*) as count FROM "${table}";`);
      stats[table] = result[0]?.count || 0;
    }

    // Listar usuários mantidos
    const users = await getQuery(
      'SELECT id, name, email, role FROM users ORDER BY role'
    );

    console.log('✅ LIMPEZA CONCLUÍDA COM SUCESSO!\n');
    console.log('📝 Resumo:');
    console.log('  • TODOS dados simulados foram deletados (100% limpeza)');
    console.log('  • 3 usuários padrão foram recriados com nomes genéricos');
    console.log('  • Componentes de inspeção foram reestabelecidos');
    console.log('  • Sistema pronto para dados reais\n');

    res.json({
      success: true,
      message: 'Limpeza completa concluída! Sistema resetado com 3 usuários padrão.',
      stats: stats,
      users: users,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ ERRO durante limpeza:', error.message);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
