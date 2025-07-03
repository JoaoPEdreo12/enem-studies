
import { useState } from 'react';
import { CheckCircle, Clock, Play, Sparkles, Smile, Trophy, Target, BookOpen, Star } from 'lucide-react';
import { useSupabaseEnemJourney } from '../hooks/useSupabaseEnemJourney';

// Dados dos conteúdos do ENEM organizados por área
const ENEM_CONTENTS = [
  {
    area: 'Matemática',
    color: '#3B82F6',
    icon: '🔢',
    difficulty: 'Básico ao Avançado',
    topics: [
      { name: 'Operações Básicas', percentage: '8%', difficulty: 'Básico' },
      { name: 'Porcentagem', percentage: '12%', difficulty: 'Básico' },
      { name: 'Razão e Proporção', percentage: '8%', difficulty: 'Básico' },
      { name: 'Regra de Três', percentage: '6%', difficulty: 'Básico' },
      { name: 'Funções do 1º grau', percentage: '9%', difficulty: 'Intermediário' },
      { name: 'Funções do 2º grau', percentage: '8%', difficulty: 'Intermediário' },
      { name: 'Equações e Inequações', percentage: '7%', difficulty: 'Intermediário' },
      { name: 'Progressões (PA e PG)', percentage: '6%', difficulty: 'Intermediário' },
      { name: 'Geometria Plana', percentage: '10%', difficulty: 'Intermediário' },
      { name: 'Estatística Básica', percentage: '9%', difficulty: 'Intermediário' },
      { name: 'Geometria Espacial', percentage: '11%', difficulty: 'Avançado' },
      { name: 'Trigonometria', percentage: '8%', difficulty: 'Avançado' },
      { name: 'Probabilidade', percentage: '9%', difficulty: 'Avançado' },
      { name: 'Análise Combinatória', percentage: '5%', difficulty: 'Avançado' },
      { name: 'Logaritmos', percentage: '4%', difficulty: 'Avançado' },
      { name: 'Matrizes e Determinantes', percentage: '3%', difficulty: 'Avançado' }
    ]
  },
  {
    area: 'Linguagens',
    color: '#EF4444',
    icon: '📚',
    difficulty: 'Básico ao Avançado',
    topics: [
      { name: 'Interpretação de Texto', percentage: '15%', difficulty: 'Básico' },
      { name: 'Gramática Básica', percentage: '8%', difficulty: 'Básico' },
      { name: 'Figuras de Linguagem', percentage: '6%', difficulty: 'Básico' },
      { name: 'Tipologia Textual', percentage: '7%', difficulty: 'Básico' },
      { name: 'Literatura Brasileira', percentage: '12%', difficulty: 'Intermediário' },
      { name: 'Redação ENEM', percentage: '20%', difficulty: 'Intermediário' },
      { name: 'Semântica e Pragmática', percentage: '5%', difficulty: 'Intermediário' },
      { name: 'Variação Linguística', percentage: '6%', difficulty: 'Intermediário' },
      { name: 'Literatura Portuguesa', percentage: '8%', difficulty: 'Avançado' },
      { name: 'Análise do Discurso', percentage: '4%', difficulty: 'Avançado' },
      { name: 'Língua Estrangeira', percentage: '9%', difficulty: 'Avançado' }
    ]
  },
  {
    area: 'Ciências Humanas',
    color: '#10B981',
    icon: '🌍',
    difficulty: 'Básico ao Avançado',
    topics: [
      { name: 'Brasil Colonial', percentage: '9%', difficulty: 'Básico' },
      { name: 'Era Vargas', percentage: '8%', difficulty: 'Intermediário' },
      { name: 'Ditadura Militar', percentage: '7%', difficulty: 'Intermediário' },
      { name: 'República Velha', percentage: '6%', difficulty: 'Intermediário' },
      { name: 'Escravidão no Brasil', percentage: '8%', difficulty: 'Básico' },
      { name: 'Geografia Urbana', percentage: '10%', difficulty: 'Intermediário' },
      { name: 'Meio Ambiente', percentage: '12%', difficulty: 'Básico' },
      { name: 'Demografia', percentage: '7%', difficulty: 'Básico' },
      { name: 'Globalização', percentage: '9%', difficulty: 'Intermediário' },
      { name: 'Sociologia Brasileira', percentage: '6%', difficulty: 'Avançado' },
      { name: 'Filosofia Moderna', percentage: '5%', difficulty: 'Avançado' },
      { name: 'Direitos Humanos', percentage: '8%', difficulty: 'Básico' },
      { name: 'Movimentos Sociais', percentage: '5%', difficulty: 'Intermediário' }
    ]
  },
  {
    area: 'Ciências da Natureza',
    color: '#8B5CF6',
    icon: '🔬',
    difficulty: 'Básico ao Avançado',
    topics: [
      { name: 'Mecânica', percentage: '12%', difficulty: 'Intermediário' },
      { name: 'Termodinâmica', percentage: '8%', difficulty: 'Intermediário' },
      { name: 'Eletricidade', percentage: '10%', difficulty: 'Avançado' },
      { name: 'Ondulatória', percentage: '7%', difficulty: 'Avançado' },
      { name: 'Química Orgânica', percentage: '15%', difficulty: 'Avançado' },
      { name: 'Físico-Química', percentage: '10%', difficulty: 'Intermediário' },
      { name: 'Química Geral', percentage: '8%', difficulty: 'Básico' },
      { name: 'Estequiometria', percentage: '7%', difficulty: 'Intermediário' },
      { name: 'Ecologia', percentage: '12%', difficulty: 'Básico' },
      { name: 'Genética', percentage: '9%', difficulty: 'Intermediário' },
      { name: 'Evolução', percentage: '6%', difficulty: 'Intermediário' },
      { name: 'Fisiologia Humana', percentage: '8%', difficulty: 'Avançado' },
      { name: 'Citologia', percentage: '6%', difficulty: 'Básico' }
    ]
  }
];

const STATUS_OPTIONS = [
  { value: 'a fazer', label: 'A Fazer', icon: <Clock size={16} />, color: '#6B7280' },
  { value: 'em progresso', label: 'Em Progresso', icon: <Play size={16} />, color: '#3B82F6' },
  { value: 'concluido', label: 'Concluído', icon: <CheckCircle size={16} />, color: '#10B981' },
];

// Avatar/Mascote estudante 3D
const AvatarEstudante = ({ position }: { position: { x: number; y: number } }) => {
  return (
    <div 
      className="avatar-estudante-3d"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 20
      }}
    >
      <div className="avatar-body-3d">
        <div className="avatar-head-3d">
          <div className="avatar-face-3d">
            <div className="avatar-eyes-3d">
              <div className="eye-3d left"></div>
              <div className="eye-3d right"></div>
            </div>
            <div className="avatar-mouth-3d"></div>
          </div>
          <div className="graduation-cap-3d">
            <div className="cap-base-3d"></div>
            <div className="cap-top-3d">🎓</div>
          </div>
        </div>
        <div className="avatar-torso-3d">
          <div className="shirt-3d"></div>
          <div className="tie-3d"></div>
        </div>
        <div className="avatar-shadow-3d"></div>
        <div className="progress-sparkles-3d">
          <Star className="sparkle" size={12} />
          <Sparkles className="sparkle" size={10} />
        </div>
      </div>
    </div>
  );
};

// Hexágono do tópico
const TopicHexagon = ({ 
  topic, 
  index, 
  status, 
  areaColor, 
  position, 
  onStatusChange, 
  isCurrentTopic 
}: {
  topic: any;
  index: number;
  status: string;
  areaColor: string;
  position: { x: number; y: number };
  onStatusChange: () => void;
  isCurrentTopic: boolean;
}) => {
  const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
  
  return (
    <div 
      className={`topic-hexagon ${status} ${isCurrentTopic ? 'current-topic' : ''}`}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        '--area-color': areaColor,
        '--status-color': statusOption?.color
      } as any}
      onClick={onStatusChange}
    >
      <div className="hexagon-shape">
        <div className="hexagon-content">
          <div className="topic-number">{index + 1}</div>
          <div className="topic-title">{topic.name}</div>
          <div className="topic-percentage">{topic.percentage}</div>
          <div className="status-icon" style={{ color: statusOption?.color }}>
            {statusOption?.icon}
          </div>
        </div>
        <div className="hexagon-glow"></div>
      </div>
      
      {/* Botões de status */}
      <div className="status-buttons">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={`status-btn ${status === option.value ? 'active' : ''}`}
            style={{ borderColor: option.color, color: option.color }}
            onClick={(e) => {
              e.stopPropagation();
              // Aqui você pode implementar a lógica para mudar diretamente para este status
            }}
            title={option.label}
          >
            {option.icon}
          </button>
        ))}
      </div>
      
      {isCurrentTopic && (
        <div className="current-indicator">
          <Sparkles className="pulse" size={20} />
        </div>
      )}
    </div>
  );
};

export default function JornadaEnem({ user }: { user: any }) {
  const { journey, loading, updateStatus } = useSupabaseEnemJourney(user?.id || null);
  const [selectedArea, setSelectedArea] = useState<string | null>(ENEM_CONTENTS[0].area);

  // Progresso geral
  const total = ENEM_CONTENTS.reduce((acc, area) => acc + area.topics.length, 0);
  const concluidos = journey.filter(j => j.status === 'concluido').length;
  const progresso = Math.round((concluidos / total) * 100);

  // Progresso por área
  const areaObj = ENEM_CONTENTS.find(a => a.area === selectedArea)!;
  const areaTotal = areaObj.topics.length;
  const areaConcluidos = journey.filter(j => j.status === 'concluido' && j.area === selectedArea).length;
  const areaProgresso = Math.round((areaConcluidos / areaTotal) * 100);

  // Encontrar o tópico atual
  const currentTopicIndex = areaObj.topics.findIndex(topic => {
    const status = journey.find(j => j.area === areaObj.area && j.content === topic.name)?.status || 'a fazer';
    return status === 'a fazer' || status === 'em progresso';
  });

  const avatarTopicIndex = currentTopicIndex === -1 ? areaObj.topics.length - 1 : currentTopicIndex;

  // Calcular posições em zigue-zague
  const calculatePositions = (topics: any[]) => {
    const positions: { x: number; y: number }[] = [];
    const containerWidth = 800;
    const startX = 100;
    const zigzagWidth = containerWidth - 200;
    const verticalSpacing = 120;
    const horizontalSpacing = zigzagWidth / 3;

    topics.forEach((topic, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      
      let x: number;
      if (row % 2 === 0) {
        // Linha par: esquerda para direita
        x = startX + (col * horizontalSpacing);
      } else {
        // Linha ímpar: direita para esquerda
        x = startX + zigzagWidth - (col * horizontalSpacing);
      }
      
      const y = 150 + (row * verticalSpacing);
      positions.push({ x, y });
    });

    return positions;
  };

  const positions = calculatePositions(areaObj.topics);
  const avatarPosition = positions[avatarTopicIndex] || positions[0];

  const handleStatusChange = (area: string, content: string, currentStatus: string) => {
    const statusFlow = ['a fazer', 'em progresso', 'concluido'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    const nextStatus = statusFlow[(currentIndex + 1) % statusFlow.length];
    updateStatus(area, content, nextStatus);
  };

  return (
    <div className="jornada-enem-trilha">
      {/* Header */}
      <div className="trilha-header">
        <h2 className="trilha-title">
          <Smile className="bounce" size={32} />
          Jornada ENEM - Trilha do Conhecimento
          <Trophy className="pulse" size={28} />
        </h2>
        <p className="trilha-subtitle">
          Siga a trilha gamificada e conquiste todos os conteúdos do ENEM! 🎯
        </p>

        {/* Progresso Geral */}
        <div className="global-progress">
          <div className="progress-stats">
            <div className="stat-item">
              <span className="stat-number">{progresso}%</span>
              <span className="stat-label">Progresso</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{concluidos}</span>
              <span className="stat-label">Concluídos</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{total}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Seletor de Área */}
      <div className="area-selector-trilha">
        {ENEM_CONTENTS.map((area) => (
          <button
            key={area.area}
            onClick={() => setSelectedArea(area.area)}
            className={`area-card-trilha ${selectedArea === area.area ? 'active' : ''}`}
            style={{
              '--area-color': area.color
            } as any}
          >
            <div className="area-icon-trilha">{area.icon}</div>
            <div className="area-info-trilha">
              <h3>{area.area}</h3>
              <span className="area-difficulty">{area.difficulty}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Trilha Principal */}
      {selectedArea && (
        <div className="trilha-container">
          <div className="trilha-header-area">
            <h3 style={{ color: areaObj.color }}>
              {areaObj.icon} {selectedArea}
            </h3>
            <div className="area-progress-info">
              <span>Progresso: {areaProgresso}% ({areaConcluidos}/{areaTotal})</span>
            </div>
          </div>

          <div className="trilha-board" style={{ height: `${Math.ceil(areaObj.topics.length / 4) * 120 + 200}px` }}>
            {/* Linhas conectoras */}
            <svg className="trail-connections" width="800" height="100%">
              {positions.slice(0, -1).map((pos, index) => {
                const nextPos = positions[index + 1];
                return (
                  <line
                    key={index}
                    x1={pos.x}
                    y1={pos.y}
                    x2={nextPos.x}
                    y2={nextPos.y}
                    className="connection-line"
                    strokeWidth="3"
                    stroke={areaObj.color}
                    strokeOpacity="0.3"
                    strokeDasharray="5,5"
                  />
                );
              })}
            </svg>

            {/* Avatar */}
            <AvatarEstudante position={avatarPosition} />

            {/* Hexágonos dos tópicos */}
            {areaObj.topics.map((topic, index) => {
              const status = journey.find(j => 
                j.area === selectedArea && j.content === topic.name
              )?.status || 'a fazer';
              
              const isCurrentTopic = index === avatarTopicIndex;

              return (
                <TopicHexagon
                  key={index}
                  topic={topic}
                  index={index}
                  status={status}
                  areaColor={areaObj.color}
                  position={positions[index]}
                  onStatusChange={() => handleStatusChange(selectedArea, topic.name, status)}
                  isCurrentTopic={isCurrentTopic}
                />
              );
            })}
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Carregando sua trilha...</p>
        </div>
      )}
    </div>
  );
}
