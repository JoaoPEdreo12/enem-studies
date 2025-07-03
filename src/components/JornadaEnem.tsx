
import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Play, Sparkles, Smile, Trophy, Target, BookOpen, Star, Award, TrendingUp } from 'lucide-react';
import { useSupabaseEnemJourney } from '../hooks/useSupabaseEnemJourney';

interface JornadaEnemProps {
  user: any;
}

// Dados dos conteúdos do ENEM com percentuais reais baseados em estatísticas
const ENEM_CONTENTS = [
  {
    area: 'Matemática',
    color: '#3B82F6',
    icon: '🔢',
    totalWeight: 45,
    topics: [
      { name: 'Funções', percentage: 15, difficulty: 'Intermediário', weight: 3 },
      { name: 'Geometria', percentage: 12, difficulty: 'Intermediário', weight: 3 },
      { name: 'Aritmética', percentage: 10, difficulty: 'Básico', weight: 2 },
      { name: 'Estatística', percentage: 8, difficulty: 'Básico', weight: 2 },
      { name: 'Probabilidade', percentage: 6, difficulty: 'Avançado', weight: 4 },
      { name: 'Trigonometria', percentage: 5, difficulty: 'Avançado', weight: 4 },
      { name: 'Progressões', percentage: 4, difficulty: 'Intermediário', weight: 3 },
      { name: 'Logaritmos', percentage: 3, difficulty: 'Avançado', weight: 4 },
      { name: 'Matrizes', percentage: 2, difficulty: 'Avançado', weight: 4 }
    ]
  },
  {
    area: 'Linguagens',
    color: '#EF4444',
    icon: '📚',
    totalWeight: 45,
    topics: [
      { name: 'Interpretação de Texto', percentage: 25, difficulty: 'Básico', weight: 2 },
      { name: 'Literatura Brasileira', percentage: 15, difficulty: 'Intermediário', weight: 3 },
      { name: 'Gramática', percentage: 12, difficulty: 'Básico', weight: 2 },
      { name: 'Redação', percentage: 20, difficulty: 'Intermediário', weight: 3 },
      { name: 'Figuras de Linguagem', percentage: 8, difficulty: 'Básico', weight: 2 },
      { name: 'Inglês/Espanhol', percentage: 10, difficulty: 'Intermediário', weight: 3 },
      { name: 'Semântica', percentage: 5, difficulty: 'Intermediário', weight: 3 },
      { name: 'Variação Linguística', percentage: 5, difficulty: 'Básico', weight: 2 }
    ]
  },
  {
    area: 'Ciências Humanas',
    color: '#10B981',
    icon: '🌍',
    totalWeight: 45,
    topics: [
      { name: 'História do Brasil', percentage: 20, difficulty: 'Básico', weight: 2 },
      { name: 'Geografia', percentage: 18, difficulty: 'Básico', weight: 2 },
      { name: 'Sociologia', percentage: 12, difficulty: 'Intermediário', weight: 3 },
      { name: 'Filosofia', percentage: 10, difficulty: 'Avançado', weight: 4 },
      { name: 'História Geral', percentage: 15, difficulty: 'Intermediário', weight: 3 },
      { name: 'Atualidades', percentage: 8, difficulty: 'Básico', weight: 2 },
      { name: 'Geopolítica', percentage: 7, difficulty: 'Intermediário', weight: 3 },
      { name: 'Movimentos Sociais', percentage: 5, difficulty: 'Intermediário', weight: 3 },
      { name: 'Direitos Humanos', percentage: 5, difficulty: 'Básico', weight: 2 }
    ]
  },
  {
    area: 'Ciências da Natureza',
    color: '#8B5CF6',
    icon: '🔬',
    totalWeight: 45,
    topics: [
      { name: 'Química Orgânica', percentage: 18, difficulty: 'Avançado', weight: 4 },
      { name: 'Física Mecânica', percentage: 15, difficulty: 'Intermediário', weight: 3 },
      { name: 'Biologia Geral', percentage: 12, difficulty: 'Básico', weight: 2 },
      { name: 'Ecologia', percentage: 10, difficulty: 'Básico', weight: 2 },
      { name: 'Genética', percentage: 8, difficulty: 'Intermediário', weight: 3 },
      { name: 'Termodinâmica', percentage: 7, difficulty: 'Avançado', weight: 4 },
      { name: 'Eletromagnetismo', percentage: 6, difficulty: 'Avançado', weight: 4 },
      { name: 'Química Geral', percentage: 12, difficulty: 'Intermediário', weight: 3 },
      { name: 'Citologia', percentage: 6, difficulty: 'Básico', weight: 2 },
      { name: 'Fisiologia', percentage: 6, difficulty: 'Intermediário', weight: 3 }
    ]
  }
];

const STATUS_CONFIG = {
  'a fazer': { 
    label: 'A Fazer', 
    icon: <Clock size={16} />, 
    color: '#6B7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
    borderColor: 'rgba(107, 114, 128, 0.3)'
  },
  'em progresso': { 
    label: 'Em Progresso', 
    icon: <Play size={16} />, 
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)'
  },
  'concluido': { 
    label: 'Concluído', 
    icon: <CheckCircle size={16} />, 
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)'
  }
};

const DIFFICULTY_CONFIG = {
  'Básico': { color: '#10B981', icon: '⭐' },
  'Intermediário': { color: '#F59E0B', icon: '⭐⭐' },
  'Avançado': { color: '#EF4444', icon: '⭐⭐⭐' }
};

// Componente do Avatar Estudante
const StudyAvatar: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <div className={`study-avatar ${isActive ? 'active' : ''}`}>
    <div className="avatar-container">
      <div className="avatar-head">
        <div className="avatar-face">
          <div className="avatar-eyes">
            <div className="eye"></div>
            <div className="eye"></div>
          </div>
          <div className="avatar-mouth"></div>
        </div>
        <div className="avatar-cap">🎓</div>
      </div>
      <div className="avatar-body"></div>
      {isActive && (
        <div className="study-indicator">
          <Sparkles size={16} />
          <span>Estudando!</span>
        </div>
      )}
    </div>
  </div>
);

export default function JornadaEnem({ user }: JornadaEnemProps) {
  const { journey, loading, updateStatus } = useSupabaseEnemJourney(user?.id || null);
  const [selectedArea, setSelectedArea] = useState<string>(ENEM_CONTENTS[0].area);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Calcular estatísticas gerais
  const totalTopics = ENEM_CONTENTS.reduce((acc, area) => acc + area.topics.length, 0);
  const completedTopics = journey.filter(j => j.status === 'concluido').length;
  const inProgressTopics = journey.filter(j => j.status === 'em progresso').length;
  const overallProgress = Math.round((completedTopics / totalTopics) * 100);

  // Calcular pontuação baseada no peso dos tópicos
  const totalScore = journey.reduce((acc, j) => {
    if (j.status === 'concluido') {
      const area = ENEM_CONTENTS.find(a => a.area === j.area);
      const topic = area?.topics.find(t => t.name === j.content);
      return acc + (topic?.weight || 0);
    }
    return acc;
  }, 0);

  const maxScore = ENEM_CONTENTS.reduce((acc, area) => acc + area.totalWeight, 0);
  const scorePercentage = Math.round((totalScore / maxScore) * 100);

  // Calcular progresso da área selecionada
  const selectedAreaData = ENEM_CONTENTS.find(a => a.area === selectedArea)!;
  const areaJourney = journey.filter(j => j.area === selectedArea);
  const areaCompleted = areaJourney.filter(j => j.status === 'concluido').length;
  const areaInProgress = areaJourney.filter(j => j.status === 'em progresso').length;
  const areaProgress = Math.round((areaCompleted / selectedAreaData.topics.length) * 100);

  // Encontrar tópico atual (em progresso ou próximo a fazer)
  const currentTopicIndex = selectedAreaData.topics.findIndex(topic => {
    const status = journey.find(j => j.area === selectedArea && j.content === topic.name)?.status || 'a fazer';
    return status === 'em progresso';
  });

  const nextTopicIndex = currentTopicIndex === -1 ? 
    selectedAreaData.topics.findIndex(topic => {
      const status = journey.find(j => j.area === selectedArea && j.content === topic.name)?.status || 'a fazer';
      return status === 'a fazer';
    }) : -1;

  const avatarTopicIndex = currentTopicIndex !== -1 ? currentTopicIndex : nextTopicIndex;

  // Filtrar tópicos
  const filteredTopics = selectedAreaData.topics.filter(topic => {
    const status = journey.find(j => j.area === selectedArea && j.content === topic.name)?.status || 'a fazer';
    return (filterDifficulty === 'all' || topic.difficulty === filterDifficulty) &&
           (filterStatus === 'all' || status === filterStatus);
  });

  const handleStatusChange = (area: string, content: string, newStatus: string) => {
    updateStatus(area, content, newStatus);
  };

  const getDifficultyColor = (difficulty: string) => {
    return DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG]?.color || '#6B7280';
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG['a fazer'];
  };

  return (
    <div className="jornada-enem">
      {/* Header com estatísticas */}
      <div className="jornada-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="jornada-title">
              <Trophy className="title-icon" />
              Jornada ENEM
              <Sparkles className="sparkle-icon" />
            </h1>
            <p className="jornada-subtitle">
              Domine todos os conteúdos que mais caem no ENEM com nosso sistema inteligente
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat-card overall-progress">
              <div className="stat-icon">
                <Target size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{overallProgress}%</div>
                <div className="stat-label">Progresso Geral</div>
                <div className="stat-detail">{completedTopics} de {totalTopics} tópicos</div>
              </div>
            </div>

            <div className="stat-card score-card">
              <div className="stat-icon">
                <Star size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{scorePercentage}%</div>
                <div className="stat-label">Pontuação</div>
                <div className="stat-detail">{totalScore} de {maxScore} pontos</div>
              </div>
            </div>

            <div className="stat-card progress-card">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{inProgressTopics}</div>
                <div className="stat-label">Em Progresso</div>
                <div className="stat-detail">tópicos ativos</div>
              </div>
            </div>

            <div className="stat-card completion-card">
              <div className="stat-icon">
                <Award size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{completedTopics}</div>
                <div className="stat-label">Concluídos</div>
                <div className="stat-detail">tópicos dominados</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seletor de Áreas */}
      <div className="area-selector">
        <h3 className="selector-title">Selecione a Área de Conhecimento</h3>
        <div className="area-tabs">
          {ENEM_CONTENTS.map((area) => {
            const areaJourney = journey.filter(j => j.area === area.area);
            const areaCompleted = areaJourney.filter(j => j.status === 'concluido').length;
            const areaProgress = Math.round((areaCompleted / area.topics.length) * 100);
            
            return (
              <button
                key={area.area}
                onClick={() => setSelectedArea(area.area)}
                className={`area-tab ${selectedArea === area.area ? 'active' : ''}`}
                style={{ 
                  '--area-color': area.color,
                  borderColor: selectedArea === area.area ? area.color : 'transparent'
                } as React.CSSProperties}
              >
                <div className="area-tab-icon">{area.icon}</div>
                <div className="area-tab-content">
                  <div className="area-tab-name">{area.area}</div>
                  <div className="area-tab-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${areaProgress}%`, backgroundColor: area.color }}
                      ></div>
                    </div>
                    <span className="progress-text">{areaProgress}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Filtrar por Dificuldade:</label>
          <select 
            value={filterDifficulty} 
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todas as Dificuldades</option>
            <option value="Básico">Básico</option>
            <option value="Intermediário">Intermediário</option>
            <option value="Avançado">Avançado</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Filtrar por Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos os Status</option>
            <option value="a fazer">A Fazer</option>
            <option value="em progresso">Em Progresso</option>
            <option value="concluido">Concluído</option>
          </select>
        </div>
      </div>

      {/* Área Selecionada */}
      <div className="selected-area-section">
        <div className="area-header">
          <div className="area-info">
            <h2 className="area-title">
              <span className="area-emoji">{selectedAreaData.icon}</span>
              {selectedArea}
            </h2>
            <div className="area-stats">
              <div className="area-progress-info">
                <div className="progress-circle">
                  <div 
                    className="progress-ring" 
                    style={{ 
                      strokeDasharray: `${areaProgress * 2.51}, 251`,
                      stroke: selectedAreaData.color 
                    }}
                  ></div>
                  <div className="progress-text">{areaProgress}%</div>
                </div>
                <div className="progress-details">
                  <div className="progress-item">
                    <span className="progress-label">Concluídos:</span>
                    <span className="progress-value">{areaCompleted}</span>
                  </div>
                  <div className="progress-item">
                    <span className="progress-label">Em Progresso:</span>
                    <span className="progress-value">{areaInProgress}</span>
                  </div>
                  <div className="progress-item">
                    <span className="progress-label">Total:</span>
                    <span className="progress-value">{selectedAreaData.topics.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="topics-section">
          <h3 className="topics-title">
            <BookOpen size={20} />
            Tópicos de Estudo
            <span className="topics-count">({filteredTopics.length} tópicos)</span>
          </h3>
          
          <div className="topics-grid">
            {filteredTopics.map((topic, index) => {
              const status = journey.find(j => j.area === selectedArea && j.content === topic.name)?.status || 'a fazer';
              const statusConfig = getStatusConfig(status);
              const isCurrentTopic = selectedAreaData.topics.findIndex(t => t.name === topic.name) === avatarTopicIndex;
              const difficultyConfig = DIFFICULTY_CONFIG[topic.difficulty as keyof typeof DIFFICULTY_CONFIG];

              return (
                <div 
                  key={topic.name}
                  className={`topic-card ${status.replace(' ', '-')} ${isCurrentTopic ? 'current-topic' : ''}`}
                  style={{
                    '--topic-color': selectedAreaData.color,
                    '--status-color': statusConfig.color,
                    '--difficulty-color': difficultyConfig.color
                  } as React.CSSProperties}
                >
                  {isCurrentTopic && (
                    <div className="current-topic-indicator">
                      <StudyAvatar isActive={status === 'em progresso'} />
                    </div>
                  )}

                  <div className="topic-header">
                    <div className="topic-percentage">{topic.percentage}%</div>
                    <div className="topic-weight">
                      <Star size={14} />
                      {topic.weight}
                    </div>
                  </div>

                  <div className="topic-content">
                    <h4 className="topic-name">{topic.name}</h4>
                    
                    <div className="topic-badges">
                      <div className="difficulty-badge" style={{ backgroundColor: difficultyConfig.color }}>
                        {difficultyConfig.icon} {topic.difficulty}
                      </div>
                      
                      <div 
                        className="status-badge"
                        style={{ 
                          backgroundColor: statusConfig.bgColor,
                          borderColor: statusConfig.borderColor,
                          color: statusConfig.color
                        }}
                      >
                        {statusConfig.icon}
                        {statusConfig.label}
                      </div>
                    </div>
                  </div>

                  <div className="topic-actions">
                    <div className="status-buttons">
                      {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => (
                        <button
                          key={statusKey}
                          onClick={() => handleStatusChange(selectedArea, topic.name, statusKey)}
                          className={`status-button ${status === statusKey ? 'active' : ''}`}
                          style={{
                            '--btn-color': config.color,
                            backgroundColor: status === statusKey ? config.color : 'transparent',
                            borderColor: config.color,
                            color: status === statusKey ? 'white' : config.color
                          } as React.CSSProperties}
                          title={`Marcar como ${config.label}`}
                        >
                          {config.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Carregando sua jornada...</p>
        </div>
      )}
    </div>
  );
}
