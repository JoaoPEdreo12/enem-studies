import { useState } from 'react';
import { CheckCircle, Clock, Play, Sparkles, Smile, Trophy, Target, BookOpen } from 'lucide-react';
import { useSupabaseEnemJourney } from '../hooks/useSupabaseEnemJourney';

interface JornadaEnemProps {
  user: any;
}

// Dados dos conteúdos do ENEM organizados por área
const ENEM_CONTENTS = [
  {
    area: 'Matemática',
    color: '#3B82F6',
    icon: '🔢',
    difficulty: 'Básico ao Avançado',
    topics: [
      // Básico
      { name: 'Operações Básicas', percentage: '8%', difficulty: 'Básico' },
      { name: 'Porcentagem', percentage: '12%', difficulty: 'Básico' },
      { name: 'Razão e Proporção', percentage: '8%', difficulty: 'Básico' },
      { name: 'Regra de Três', percentage: '6%', difficulty: 'Básico' },

      // Intermediário
      { name: 'Funções do 1º grau', percentage: '9%', difficulty: 'Intermediário' },
      { name: 'Funções do 2º grau', percentage: '8%', difficulty: 'Intermediário' },
      { name: 'Equações e Inequações', percentage: '7%', difficulty: 'Intermediário' },
      { name: 'Progressões (PA e PG)', percentage: '6%', difficulty: 'Intermediário' },
      { name: 'Geometria Plana', percentage: '10%', difficulty: 'Intermediário' },
      { name: 'Estatística Básica', percentage: '9%', difficulty: 'Intermediário' },

      // Avançado
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
      // Básico
      { name: 'Interpretação de Texto', percentage: '15%', difficulty: 'Básico' },
      { name: 'Gramática Básica', percentage: '8%', difficulty: 'Básico' },
      { name: 'Figuras de Linguagem', percentage: '6%', difficulty: 'Básico' },
      { name: 'Tipologia Textual', percentage: '7%', difficulty: 'Básico' },

      // Intermediário
      { name: 'Literatura Brasileira', percentage: '12%', difficulty: 'Intermediário' },
      { name: 'Redação ENEM', percentage: '20%', difficulty: 'Intermediário' },
      { name: 'Semântica e Pragmática', percentage: '5%', difficulty: 'Intermediário' },
      { name: 'Variação Linguística', percentage: '6%', difficulty: 'Intermediário' },

      // Avançado
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
      // História
      { name: 'Brasil Colonial', percentage: '9%', difficulty: 'Básico' },
      { name: 'Era Vargas', percentage: '8%', difficulty: 'Intermediário' },
      { name: 'Ditadura Militar', percentage: '7%', difficulty: 'Intermediário' },
      { name: 'República Velha', percentage: '6%', difficulty: 'Intermediário' },
      { name: 'Escravidão no Brasil', percentage: '8%', difficulty: 'Básico' },

      // Geografia
      { name: 'Geografia Urbana', percentage: '10%', difficulty: 'Intermediário' },
      { name: 'Meio Ambiente', percentage: '12%', difficulty: 'Básico' },
      { name: 'Demografia', percentage: '7%', difficulty: 'Básico' },
      { name: 'Globalização', percentage: '9%', difficulty: 'Intermediário' },

      // Filosofia e Sociologia
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
      // Física
      { name: 'Mecânica', percentage: '12%', difficulty: 'Intermediário' },
      { name: 'Termodinâmica', percentage: '8%', difficulty: 'Intermediário' },
      { name: 'Eletricidade', percentage: '10%', difficulty: 'Avançado' },
      { name: 'Ondulatória', percentage: '7%', difficulty: 'Avançado' },

      // Química
      { name: 'Química Orgânica', percentage: '15%', difficulty: 'Avançado' },
      { name: 'Físico-Química', percentage: '10%', difficulty: 'Intermediário' },
      { name: 'Química Geral', percentage: '8%', difficulty: 'Básico' },
      { name: 'Estequiometria', percentage: '7%', difficulty: 'Intermediário' },

      // Biologia
      { name: 'Ecologia', percentage: '12%', difficulty: 'Básico' },
      { name: 'Genética', percentage: '9%', difficulty: 'Intermediário' },
      { name: 'Evolução', percentage: '6%', difficulty: 'Intermediário' },
      { name: 'Fisiologia Humana', percentage: '8%', difficulty: 'Avançado' },
      { name: 'Citologia', percentage: '6%', difficulty: 'Básico' }
    ]
  }
];

const STATUS_OPTIONS = [
  { value: 'a fazer', label: 'A Fazer', icon: <Clock className="text-gray-400" size={16} />, color: '#6B7280' },
  { value: 'em progresso', label: 'Em Progresso', icon: <Play className="text-blue-400" size={16} />, color: '#3B82F6' },
  { value: 'concluido', label: 'Concluído', icon: <CheckCircle className="text-green-400" size={16} />, color: '#10B981' },
];

// Avatar/Mascote estudante melhorado
const AvatarEstudante = () => {
  return (
    <div 
      className="avatar-estudante-container"
    >
      <div className="avatar-estudante">
        <div className="avatar-head">
          <div className="avatar-face">
            <div className="avatar-eyes">
              <div className="eye left-eye"></div>
              <div className="eye right-eye"></div>
            </div>
            <div className="avatar-mouth"></div>
          </div>
          <div className="avatar-cap">
            <div className="cap-visor"></div>
            <div className="cap-top">🎓</div>
          </div>
        </div>
        <div className="avatar-body">
          <div className="avatar-shirt"></div>
        </div>
        <div className="progress-indicator">
          <div className="progress-sparkles">✨</div>
          <div className="progress-text">Estudando!</div>
        </div>
      </div>
    </div>
  );
};

export default function JornadaEnem({ user }: JornadaEnemProps) {
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

  // Encontrar o primeiro tópico "em progresso" ou o primeiro "a fazer"
  const currentProgressIndex = areaObj.topics.findIndex(topic => {
    const status = journey.find(j => j.area === areaObj.area && j.content === topic.name)?.status || 'a fazer';
    return status === 'em progresso';
  });

  const currentTodoIndex = areaObj.topics.findIndex(topic => {
    const status = journey.find(j => j.area === areaObj.area && j.content === topic.name)?.status || 'a fazer';
    return status === 'a fazer';
  });

  // Priorizar tópico em progresso, senão usar o primeiro "a fazer"
  const avatarTopicIndex = currentProgressIndex !== -1 ? currentProgressIndex : 
                          (currentTodoIndex !== -1 ? currentTodoIndex : 0);

  // Agrupar tópicos por dificuldade
  const topicsByDifficulty = areaObj.topics.reduce((acc, topic) => {
    const difficulty = topic.difficulty || 'Básico';
    if (!acc[difficulty]) acc[difficulty] = [];
    acc[difficulty].push(topic);
    return acc;
  }, {} as Record<string, typeof areaObj.topics>);

  const handleStatusChange = (area: string, content: string, currentStatus: string) => {
    const statusFlow = ['a fazer', 'em progresso', 'concluido'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    const nextStatus = statusFlow[(currentIndex + 1) % statusFlow.length];
    updateStatus(area, content, nextStatus);
  };

  return (
    <div className="jornada-enem-container">
      <div className="jornada-header">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Smile className="text-blue-400 animate-bounce" size={32} />
          Jornada ENEM
          <Sparkles className="text-yellow-400 animate-pulse" size={28} />
        </h2>
        <p className="text-gray-300 mb-6 text-center max-w-2xl mx-auto">
          Acompanhe seu progresso em todos os conteúdos que mais caem no ENEM. 
          Nosso mascote te acompanha nessa jornada! 🚀
        </p>

        {/* Progresso Geral */}
        <div className="progress-overview">
          <div className="progress-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Trophy className="text-yellow-400" size={24} />
                Progresso Geral
              </h3>
              <span className="progress-percentage">{progresso}%</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{width: `${progresso}%`}}></div>
            </div>
            <p className="text-gray-300 mt-2 text-center">
              {concluidos} de {total} conteúdos concluídos
            </p>
          </div>
        </div>
      </div>

      {/* Seletor de Área */}
      <div className="area-selector">
        {ENEM_CONTENTS.map((area) => (
          <button
            key={area.area}
            onClick={() => setSelectedArea(area.area)}
            className={`area-button ${selectedArea === area.area ? 'active' : ''}`}
            style={{
              borderColor: selectedArea === area.area ? area.color : 'transparent',
              backgroundColor: selectedArea === area.area ? `${area.color}20` : 'transparent'
            }}
          >
            <span className="area-icon">{area.icon}</span>
            <span className="area-name">{area.area}</span>
          </button>
        ))}
      </div>

      {/* Área Selecionada */}
      {selectedArea && (
        <div className="selected-area">
          <div className="area-header">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <span style={{color: areaObj.color}}>{areaObj.icon}</span>
              {selectedArea}
              <Target className="text-blue-400" size={24} />
            </h3>
            <div className="area-progress">
              <div className="progress-info">
                <span className="progress-text">Progresso: {areaProgresso}%</span>
                <span className="progress-count">({areaConcluidos}/{areaTotal})</span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{
                    width: `${areaProgresso}%`,
                    backgroundColor: areaObj.color
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Trilha do Tabuleiro */}
          <div className="board-trail">
            <div className="trail-header">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen className="text-blue-400" size={20} />
                Trilha de Aprendizado
              </h4>
            </div>

            {/* Linha de progresso */}
            <div className="progress-track-container">
              <div className="progress-track">
                <div 
                  className="progress-track-fill" 
                  style={{
                    width: `${areaProgresso}%`,
                    backgroundColor: areaObj.color
                  }}
                ></div>
              </div>
            </div>

            {/* Conteúdos por Dificuldade */}
            <div className="difficulty-sections">
              {Object.entries(topicsByDifficulty).map(([difficulty, topics]) => (
                <div key={difficulty} className="difficulty-section">
                  <h5 className={`difficulty-title difficulty-${difficulty.toLowerCase()}`}>
                    {difficulty}
                  </h5>
                  <div className="topics-grid">
                    {topics.map((topic) => {
                      const status = journey.find(j => 
                        j.area === selectedArea && j.content === topic.name
                      )?.status || 'a fazer';

                      const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
                      const isCurrentTopic = areaObj.topics.findIndex(t => t.name === topic.name) === avatarTopicIndex;

                      return (
                        <div 
                          key={topic.name} 
                          className={`topic-card status-${status.replace(' ', '-')} ${isCurrentTopic ? 'current-topic' : ''}`}
                        >
                          <div className="topic-header">
                            <span className="topic-percentage" style={{color: areaObj.color}}>
                              {topic.percentage}
                            </span>
                            <div className="topic-status" style={{color: statusOption?.color}}>
                              {statusOption?.icon}
                            </div>
                          </div>
                          <h6 className="topic-name">{topic.name}</h6>
                          <div className="topic-footer">
                            <span className={`difficulty-badge ${topic.difficulty?.toLowerCase()}`}>
                              {topic.difficulty}
                            </span>
                            <span className={`status-badge status-${status.replace(' ', '-')}`}>
                              {statusOption?.label}
                            </span>
                          </div>
                          {isCurrentTopic && (
                            <div className="current-indicator">
                              <AvatarEstudante />
                            </div>
                          )}
                          <div className="status-buttons">
                            {STATUS_OPTIONS.map(option => (
                                <button
                                    key={option.value}
                                    className={`status-button ${status === option.value ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        updateStatus(selectedArea, topic.name, option.value);
                                    }}
                                    style={{ 
                                      '--btn-color': option.color,
                                      backgroundColor: status === option.value ? option.color : 'transparent',
                                      borderColor: option.color,
                                      color: status === option.value ? 'white' : option.color
                                    } as React.CSSProperties}
                                >
                                    {option.icon}
                                    <span className="status-label">{option.label}</span>
                                </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p className="text-white mt-4">Carregando sua jornada...</p>
        </div>
      )}
    </div>
  );
}