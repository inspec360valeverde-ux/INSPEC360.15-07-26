import type { ComponentRule, SeverityOption } from './types';

export const INITIAL_INSPECTION_COMPONENTS: ComponentRule[] = [
  {
    id: 'fundacao',
    name: 'Fundação',
    icon: '🏗️',
    description: 'Inspeção da base e fundação da estrutura',
    anomalies: [
      'Erosão do solo próxima à fundação',
      'Trinca ou fissura no concreto',
      'Exposição de armação metálica',
      'Subsidência / afundamento do terreno',
      'Acúmulo de água na base',
      'Vegetação sobre a fundação',
      'Dano por impacto de veículo',
    ],
  },
  {
    id: 'estrutura-metalica',
    name: 'Estrutura Metálica (Torre)',
    icon: '🗼',
    description: 'Inspeção do corpo metálico da estrutura',
    anomalies: [
      'Corrosão em perfis metálicos',
      'Deformação de membros estruturais',
      'Parafuso / porca faltante ou solto',
      'Solda com trinca ou deterioração',
      'Pintura deteriorada ou ausente',
      'Impacto físico externo (colisão)',
      'Inclinação fora do padrão',
      'Fratura ou ruptura de membro',
    ],
  },
  {
    id: 'isoladores',
    name: 'Isoladores',
    icon: '⚡',
    description: 'Inspeção das cadeias de isoladores',
    anomalies: [
      'Isolador quebrado',
      'Isolador trincado',
      'Contaminação severa',
      'Marcas de flashover / arco elétrico',
      'Disco faltante na cadeia',
      'Desvio da vertical superior a 5°',
      'Pino / grampo de fixação solto ou ausente',
      'Ferragem de fixação corroída',
    ],
  },
  {
    id: 'cabos-condutores',
    name: 'Cabos Condutores',
    icon: '🔌',
    description: 'Inspeção dos cabos de energia',
    anomalies: [
      'Rompimento de fios',
      'Emenda preformada danificada',
      'Flecha fora do padrão (muito baixa ou alta)',
      'Contato com vegetação',
      'Vibração excessiva',
      'Ponto de amortecimento danificado',
      'Abaulamento ou deformação no cabo',
      'Corrosão severa no cabo',
    ],
  },
  {
    id: 'cabo-para-raios',
    name: 'Cabo Para-raios / OPGW',
    icon: '⛈️',
    description: 'Inspeção do cabo de proteção contra descargas',
    anomalies: [
      'Rompimento de fios',
      'Ponto de emenda danificado',
      'Flecha fora do padrão',
      'Corrosão severa',
      'Dano ao cabo óptico (OPGW)',
      'Fixação ao isolador de âncora danificada',
    ],
  },
  {
    id: 'ferragens-conectores',
    name: 'Ferragens e Conectores',
    icon: '🔩',
    description: 'Inspeção de grampos, conectores e ferragens',
    anomalies: [
      'Corrosão severa',
      'Deformação de ferragem',
      'Peça ausente',
      'Folga excessiva',
      'Pino de segurança ausente',
      'Trinca em grampo ou conector',
    ],
  },
  {
    id: 'aterramento',
    name: 'Aterramento',
    icon: '🔋',
    description: 'Inspeção do sistema de aterramento',
    anomalies: [
      'Cabo de aterramento solto ou ausente',
      'Conector corroído',
      'Eletrodo ausente ou danificado',
      'Pino de aterramento danificado',
      'Medição de resistência fora do padrão',
    ],
  },
  {
    id: 'sinalizacao',
    name: 'Sinalização e Balizamento',
    icon: '🚨',
    description: 'Inspeção das placas e equipamentos de balizamento',
    anomalies: [
      'Placa de identificação ausente ou ilegível',
      'Esfera de balizamento danificada ou ausente',
      'Luz de obstáculo com falha',
      'Placa de perigo ausente ou danificada',
      'Número da torre ausente',
      'Pintura de balizamento deteriorada',
    ],
  },
  {
    id: 'faixa-servidao',
    name: 'Faixa de Servidão',
    icon: '🌿',
    description: 'Inspeção da faixa de proteção da LT',
    anomalies: [
      'Vegetação com altura inadequada na faixa',
      'Construção irregular na faixa',
      'Acesso à estrutura obstruído',
      'Cercamento danificado ou ausente',
      'Plantação irregular (eucalipto, cana, etc.)',
      'Queimada na faixa',
      'Depósito de material inflamável',
    ],
  },
  {
    id: 'emenda-preformada',
    name: 'Emenda Preformada',
    icon: '🔗',
    description: 'Inspeção dos pontos de emenda dos cabos',
    anomalies: [
      'Corrosão na emenda',
      'Desalinhamento da emenda',
      'Dano mecânico',
      'Encordoamento solto ou ausente',
      'Ponto quente detectado (termografia)',
      'Emenda incorretamente instalada',
    ],
  },
  {
    id: 'amortecedores',
    name: 'Amortecedores de Vibração',
    icon: '📳',
    description: 'Inspeção dos amortecedores tipo Stockbridge',
    anomalies: [
      'Amortecedor ausente',
      'Amortecedor deslocado do ponto correto',
      'Amortecedor danificado',
      'Quantidade insuficiente de amortecedores',
    ],
  },
  {
    id: 'espacadores',
    name: 'Espaçadores e Espaçadores-Amortecedores',
    icon: '↔️',
    description: 'Inspeção dos espaçadores de feixes de condutores',
    anomalies: [
      'Espaçador ausente',
      'Espaçador danificado',
      'Espaçador deslocado da posição correta',
      'Braço quebrado do espaçador',
    ],
  },
];

export const INSPECTION_COMPONENTS = INITIAL_INSPECTION_COMPONENTS;

export const INITIAL_SEVERITY_OPTIONS: SeverityOption[] = [
  { id: 'leve', label: 'Leve', color: '#16a34a', description: 'Anomalia de baixo impacto, ação corretiva programada' },
  { id: 'moderada', label: 'Moderada', color: '#AA8933', description: 'Anomalia relevante, requer atenção em breve' },
  { id: 'critica', label: 'Crítica', color: '#ea580c', description: 'Anomalia crítica, ação prioritária necessária' },
  { id: 'grave', label: 'Grave', color: '#dc2626', description: 'Anomalia grave, ação imediata necessária' },
];

// Keep for backwards compat
export const SEVERITY_OPTIONS = INITIAL_SEVERITY_OPTIONS;

export const PHASE_OPTIONS: { value: string; label: string }[] = [
  { value: 'A', label: 'Fase A' },
  { value: 'B', label: 'Fase B' },
  { value: 'C', label: 'Fase C' },
  { value: 'N', label: 'Neutro' },
  { value: 'Geral', label: 'Geral' },
];
