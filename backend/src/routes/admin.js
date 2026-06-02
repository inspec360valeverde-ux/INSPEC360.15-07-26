import express from 'express';
import { runSQL, getQuery } from '../database/postgres-connection.js';

const router = express.Router();

// Chave de segurança para limpeza de dados
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'inspec360-admin-2026';

const USERS_TO_KEEP = [
  'ismar.santos@vale-verde.com',
  'jonson.santos@vale-verde.com',
  'gustavo.santos@vale-verde.com'
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

    // Limpar usuários simulados
    console.log('👥 Processando usuários...');
    
    const placeholders = USERS_TO_KEEP.map((_, i) => `$${i + 1}`).join(',');
    const deleteResult = await runSQL(
      `DELETE FROM users WHERE email NOT IN (${placeholders});`,
      USERS_TO_KEEP
    );
    console.log(`  ✓ Usuários simulados deletados: ${deleteResult.changes}`);

    // Corrigir roles
    await runSQL(
      'UPDATE users SET role = $1 WHERE email = $2',
      ['tecnico', 'ismar.santos@vale-verde.com']
    );
    await runSQL(
      'UPDATE users SET role = $1 WHERE email = $2',
      ['supervisor', 'jonson.santos@vale-verde.com']
    );
    await runSQL(
      'UPDATE users SET role = $1 WHERE email = $2',
      ['superadm', 'gustavo.santos@vale-verde.com']
    );
    console.log('  ✓ Roles dos usuários corrigidas\n');

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
    console.log('  • Todos dados simulados foram deletados');
    console.log('  • Apenas 3 usuários de teste foram mantidos');
    console.log('  • Estrutura do banco permanece intacta');
    console.log('  • Sistema pronto para dados reais\n');

    res.json({
      success: true,
      message: 'Limpeza de dados concluída com sucesso!',
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
