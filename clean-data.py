#!/usr/bin/env python3
"""
Script para limpar dados simulados do banco de dados PostgreSQL
INSPEC360 v2.2 - Junho 2026
"""

import os
import sys
from pathlib import Path

try:
    import psycopg2
    from psycopg2 import sql
except ImportError:
    print("❌ Erro: psycopg2 não está instalado")
    print("   Execute: pip install psycopg2-binary")
    sys.exit(1)

from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("❌ Erro: DATABASE_URL não configurado")
    sys.exit(1)

USERS_TO_KEEP = [
    'ismar.santos@vale-verde.com',
    'jonson.santos@vale-verde.com',
    'gustavo.santos@vale-verde.com'
]

def clean_database():
    """Executa limpeza do banco de dados"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        print("🧹 Iniciando limpeza de dados simulados...\n")
        
        # Desabilitar constraints
        cursor.execute('SET session_replication_role = REPLICA;')
        print("✅ Constraints desabilitadas")
        
        # Limpar dados (ordem importa por FK)
        tables_order = [
            ('pauses', 'Pauses'),
            ('photos', 'Photos'),
            ('anomalies', 'Anomalias'),
            ('"componentInspections"', 'Component Inspections'),
            ('"inspectionRecords"', 'Inspeções'),
            ('"serviceOrders"', 'Ordens de Serviço'),
            ('executions', 'Execuções'),
            ('structures', 'Estruturas'),
            ('"componentRules"', 'Componentes'),
            ('state', 'Estado'),
        ]
        
        print('🗑️  Limpando dados de inspeções...')
        for table, label in tables_order[:5]:
            cursor.execute(f'DELETE FROM {table};')
            print(f'  ✓ {label} deletadas')
        
        print('🗑️  Limpando outras tabelas...')
        for table, label in tables_order[5:]:
            cursor.execute(f'DELETE FROM {table};')
            print(f'  ✓ {label} deletadas')
        
        # Reabilitar constraints
        cursor.execute('SET session_replication_role = DEFAULT;')
        print('✅ Constraints reabilitadas\n')
        
        # Limpar usuários
        print('👥 Processando usuários...')
        
        # Deletar usuários não-demo
        placeholders = ','.join(['%s'] * len(USERS_TO_KEEP))
        cursor.execute(
            f'DELETE FROM users WHERE email NOT IN ({placeholders})',
            USERS_TO_KEEP
        )
        deleted = cursor.rowcount
        print(f'  ✓ Usuários simulados deletados: {deleted}')
        
        # Corrigir roles
        cursor.execute(
            'UPDATE users SET role = %s WHERE email = %s',
            ('tecnico', 'ismar.santos@vale-verde.com')
        )
        cursor.execute(
            'UPDATE users SET role = %s WHERE email = %s',
            ('supervisor', 'jonson.santos@vale-verde.com')
        )
        cursor.execute(
            'UPDATE users SET role = %s WHERE email = %s',
            ('superadm', 'gustavo.santos@vale-verde.com')
        )
        print('  ✓ Roles dos usuários corrigidas\n')
        
        # Mostrar estatísticas
        print('📊 ESTATÍSTICAS FINAIS:\n')
        
        all_tables = [
            'users', 'structures', 'componentRules', 'serviceOrders',
            'inspectionRecords', 'componentInspections', 'anomalies',
            'photos', 'executions', 'pauses', 'state'
        ]
        
        for table in all_tables:
            cursor.execute(f'SELECT COUNT(*) FROM "{table}";')
            count = cursor.fetchone()[0]
            print(f'  {table:25} : {count} registro(s)')
        
        # Listar usuários
        print('\n👤 USUÁRIOS MANTIDOS:\n')
        cursor.execute('SELECT id, name, email, role FROM users ORDER BY role')
        for user_id, name, email, role in cursor.fetchall():
            role_emoji = '👨‍💼' if role in ('supervisor', 'superadm') else '👷'
            print(f'  {role_emoji} {name:25} ({email}) - {role}')
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print('\n✅ LIMPEZA CONCLUÍDA COM SUCESSO!\n')
        print('📝 Resumo:')
        print('  • Todos dados simulados foram deletados')
        print('  • Apenas 3 usuários de teste foram mantidos')
        print('  • Estrutura do banco permanece intacta')
        print('  • Sistema pronto para dados reais\n')
        
    except psycopg2.Error as error:
        print(f'❌ ERRO ao conectar/executar: {error}')
        sys.exit(1)

if __name__ == '__main__':
    clean_database()
