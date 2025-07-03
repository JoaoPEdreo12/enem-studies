
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useSupabaseEnemJourney } from '../hooks/useSupabaseEnemJourney';
import { Sparkles, Smile, CheckCircle, Hourglass, ChevronRight } from 'lucide-react';

// Conteúdos reorganizados por dificuldade e com mais tópicos
const ENEM_CONTENTS = [
  {
    area: 'Matemática',
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
    difficulty: 'Básico ao Avançado',
    topics: [
      // Básico
      { name: 'Interpretação de Texto', percentage: '30%', difficulty: 'Básico' },
      { name: 'Gêneros Textuais', percentage: '15%', difficulty: 'Básico' },
      { name: 'Funções da Linguagem', percentage: '8%', difficulty: 'Básico' },
      { name: 'Variação Linguística', percentage: '7%', difficulty: 'Básico' },
      
      // Intermediário
      { name: 'Figuras de Linguagem', percentage: '10%', difficulty: 'Intermediário' },
      { name: 'Coesão e Coerência', percentage: '12%', difficulty: 'Intermediário' },
      { name: 'Gramática (Sintaxe)', percentage: '8%', difficulty: 'Intermediário' },
      { name: 'Semântica', percentage: '5%', difficulty: 'Intermediário' },
      
      // Avançado
      { name: 'Literatura Brasileira', percentage: '18%', difficulty: 'Avançado' },
      { name: 'Literatura Portuguesa', percentage: '8%', difficulty: 'Avançado' },
      { name: 'Escolas Literárias', percentage: '6%', difficulty: 'Avançado' },
      { name: 'Arte e Cultura', percentage: '4%', difficulty: 'Avançado' },
      { name: 'Inglês/Espanhol', percentage: '10%', difficulty: 'Avançado' }
    ]
  },
  {
    area: 'Ciências Humanas',
    difficulty: 'Básico ao Avançado',
    topics: [
      // Básico
      { name: 'Atualidades', percentage: '15%', difficulty: 'Básico' },
      { name: 'Cidadania e Direitos', percentage: '8%', difficulty: 'Básico' },
      { name: 'Geografia do Brasil', percentage: '12%', difficulty: 'Básico' },
      { name: 'História do Brasil Colonial', percentage: '8%', difficulty: 'Básico' },
      
      // Intermediário
      { name: 'História do Brasil República', percentage: '15%', difficulty: 'Intermediário' },
      { name: 'Geopolítica Mundial', percentage: '10%', difficulty: 'Intermediário' },
      { name: 'Demografia e Urbanização', percentage: '7%', difficulty: 'Intermediário' },
      { name: 'Sociologia Contemporânea', percentage: '8%', difficulty: 'Intermediário' },
      
      // Avançado
      { name: 'História Geral Antiga/Medieval', percentage: '10%', difficulty: 'Avançado' },
      { name: 'História Geral Moderna/Contemporânea', percentage: '12%', difficulty: 'Avançado' },
      { name: 'Filosofia Clássica', percentage: '6%', difficulty: 'Avançado' },
      { name: 'Filosofia Moderna', percentage: '5%', difficulty: 'Avançado' },
      { name: 'Economia e Globalização', percentage: '4%', difficulty: 'Avançado' }
    ]
  },
  {
    area: 'Ciências da Natureza',
    difficulty: 'Básico ao Avançado',
    topics: [
      // Básico - Biologia
      { name: 'Citologia Básica', percentage: '8%', difficulty: 'Básico' },
      { name: 'Ecologia e Meio Ambiente', percentage: '12%', difficulty: 'Básico' },
      { name: 'Saúde e Qualidade de Vida', percentage: '10%', difficulty: 'Básico' },
      
      // Básico - Química
      { name: 'Química Geral', percentage: '10%', difficulty: 'Básico' },
      { name: 'Tabela Periódica', percentage: '6%', difficulty: 'Básico' },
      
      // Básico - Física
      { name: 'Mecânica Básica', percentage: '8%', difficulty: 'Básico' },
      { name: 'Energia e Trabalho', percentage: '7%', difficulty: 'Básico' },
      
      // Intermediário - Biologia
      { name: 'Genética Mendeliana', percentage: '9%', difficulty: 'Intermediário' },
      { name: 'Evolução', percentage: '8%', difficulty: 'Intermediário' },
      { name: 'Fisiologia Humana', percentage: '7%', difficulty: 'Intermediário' },
      
      // Intermediário - Química
      { name: 'Físico-Química', percentage: '12%', difficulty: 'Intermediário' },
      { name: 'Química Orgânica', percentage: '10%', difficulty: 'Intermediário' },
      
      // Intermediário - Física
      { name: 'Termodinâmica', percentage: '6%', difficulty: 'Intermediário' },
      { name: 'Ondulatória', percentage: '5%', difficulty: 'Intermediário' },
      
      // Avançado
      { name: 'Genética Molecular', percentage: '4%', difficulty: 'Avançado' },
      { name: 'Química Inorgânica', percentage: '6%', difficulty: 'Avançado' },
      { name: 'Eletromagnetismo', percentage: '4%', difficulty: 'Avançado' },
      { name: 'Óptica Avançada', percentage: '3%', difficulty: 'Avançado' },
      { name: 'Física Moderna', percentage: '2%', difficulty: 'Avançado' }
    ]
  },
  {
    area: 'Redação',
    difficulty: 'Básico ao Avançado',
    topics: [
      { name: 'Estrutura Dissertativa', percentage: '25%', difficulty: 'Básico' },
      { name: 'Competência 1 - Norma Culta', percentage: '20%', difficulty: 'Básico' },
      { name: 'Competência 2 - Compreensão', percentage: '20%', difficulty: 'Intermediário' },
      { name: 'Competência 3 - Argumentação', percentage: '20%', difficulty: 'Intermediário' },
      { name: 'Competência 4 - Coesão', percentage: '15%', difficulty: 'Avançado' },
      { name: 'Competência 5 - Proposta', percentage: '25%', difficulty: 'Avançado' },
      { name: 'Repertório Sociocultural', percentage: '15%', difficulty: 'Avançado' }
    ]
  }
];

const STATUS_OPTIONS = [
  { value: 'não iniciado', label: 'Não iniciado', icon: <Hourglass className="text-gray-400" size={16} /> },
  { value: 'em progresso', label: 'Em progresso', icon: <Sparkles className="text-yellow-400" size={16} /> },
  { value: 'dominado', label: 'Dominado', icon: <CheckCircle className="text-green-400" size={16} /> },
];

// Avatar/Mascote estudante
const AvatarEstudante = ({ isActive = false }) => (
  <div className={`avatar-estudante ${isActive ? 'avatar-active' : ''}`}>
    <div className="avatar-container">
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
        </div>
      </div>
      <div className="avatar-body">
        <div className="avatar-shirt"></div>
        <div className="avatar-arms">
          <div className="arm left-arm"></div>
          <div className="arm right-arm"></div>
        </div>
      </div>
      {isActive && (
        <div className="progress-indicator">
          <div className="progress-sparkles">✨</div>
        </div>
      )}
    </div>
  </div>
);

export default function JornadaEnem({ user }: { user: any }) {
  const { journey, loading, updateStatus } = useSupabaseEnemJourney(user?.id || null);
  const [selectedArea, setSelectedArea] = useState<string | null>(ENEM_CONTENTS[0].area);

  // Progresso geral
  const total = ENEM_CONTENTS.reduce((acc, area) => acc + area.topics.length, 0);
  const dominados = journey.filter(j => j.status === 'dominado').length;
  const progresso = Math.round((dominados / total) * 100);

  // Progresso por área
  const areaObj = ENEM_CONTENTS.find(a => a.area === selectedArea)!;
  const areaTotal = areaObj.topics.length;
  const areaDominados = journey.filter(j => j.status === 'dominado' && j.area === selectedArea).length;
  const areaProgresso = Math.round((areaDominados / areaTotal) * 100);

  // Agrupar tópicos por dificuldade
  const topicsByDifficulty = areaObj.topics.reduce((acc, topic) => {
    const difficulty = topic.difficulty || 'Básico';
    if (!acc[difficulty]) acc[difficulty] = [];
    acc[difficulty].push(topic);
    return acc;
  }, {} as Record<string, typeof areaObj.topics>);

  // Encontrar posição do avatar
  const currentTopicIdx = areaObj.topics.findIndex(topic => {
    const status = journey.find(j => j.area === areaObj.area && j.content === topic.name)?.status;
    return status === 'não iniciado' || status === 'em progresso';
  });

  return (
    <div className="jornada-enem-container">
      <div className="jornada-header">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Smile className="text-blue-400 animate-bounce" size={32} />
          Jornada ENEM
          <Sparkles className="text-yellow-400 animate-pulse" size={28} />
        </h2>
        <p className="text-gray-300 mb-6 text-lg text-center max-w-3xl mx-auto">
          Escolha a matéria e avance no seu tabuleiro de estudos! Conteúdos organizados por dificuldade para uma progressão natural.
        </p>
      </div>

      {/* Progresso geral */}
      <div className="progress-overview">
        <div className="progress-card">
          <div className="progress-circle">
            <span className="progress-percentage">{progresso}%</span>
          </div>
          <div className="progress-info">
            <h3>Progresso Geral</h3>
            <p>{dominados}/{total} conteúdos dominados</p>
          </div>
        </div>
      </div>

      {/* Seleção de áreas */}
      <div className="area-selector">
        {ENEM_CONTENTS.map(area => {
          const areaTotal = area.topics.length;
          const areaDominados = journey.filter(j => j.status === 'dominado' && j.area === area.area).length;
          const areaProgress = Math.round((areaDominados / areaTotal) * 100);
          
          return (
            <button
              key={area.area}
              onClick={() => setSelectedArea(area.area)}
              className={`area-card ${selectedArea === area.area ? 'active' : ''}`}
            >
              <div className="area-icon">
                {area.area === 'Matemática' && '📊'}
                {area.area === 'Linguagens' && '📚'}
                {area.area === 'Ciências Humanas' && '🌍'}
                {area.area === 'Ciências da Natureza' && '🔬'}
                {area.area === 'Redação' && '✍️'}
              </div>
              <div className="area-info">
                <h3>{area.area}</h3>
                <p>{area.difficulty}</p>
                <div className="area-progress-bar">
                  <div 
                    className="area-progress-fill" 
                    style={{ width: `${areaProgress}%` }}
                  ></div>
                </div>
                <span className="area-progress-text">{areaProgress}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Conteúdo da área selecionada */}
      <div className="selected-area-content">
        <div className="area-header">
          <h3 className="area-title">
            {areaObj.area} - {areaObj.difficulty}
          </h3>
          <div className="area-stats">
            <span className="stat-badge">{areaProgresso}% concluído</span>
            <span className="stat-badge">{areaDominados}/{areaTotal} tópicos</span>
          </div>
        </div>

        {/* Avatar do estudante */}
        <div className="avatar-section">
          <AvatarEstudante isActive={true} />
          <p className="avatar-message">
            {areaProgresso === 100 
              ? '🎉 Parabéns! Você dominou esta área!' 
              : `Continue estudando! Você está indo muito bem!`
            }
          </p>
        </div>

        {/* Tópicos organizados por dificuldade */}
        <div className="topics-by-difficulty">
          {Object.entries(topicsByDifficulty).map(([difficulty, topics]) => (
            <div key={difficulty} className="difficulty-section">
              <h4 className="difficulty-title">
                <span className={`difficulty-badge ${difficulty.toLowerCase()}`}>
                  {difficulty}
                </span>
                <span className="difficulty-count">
                  {topics.filter(topic => {
                    const status = journey.find(j => j.area === areaObj.area && j.content === topic.name)?.status;
                    return status === 'dominado';
                  }).length}/{topics.length} concluídos
                </span>
              </h4>
              
              <div className="topics-grid">
                {topics.map((topic, idx) => {
                  const status = journey.find(j => j.area === areaObj.area && j.content === topic.name)?.status || 'não iniciado';
                  const statusObj = STATUS_OPTIONS.find(opt => opt.value === status);
                  
                  return (
                    <div key={topic.name} className={`topic-card ${status}`}>
                      <div className="topic-header">
                        <div className="topic-status-icon">
                          {statusObj?.icon}
                        </div>
                        <span className="topic-percentage">{topic.percentage}</span>
                      </div>
                      
                      <div className="topic-content">
                        <h5 className="topic-name">{topic.name}</h5>
                      </div>
                      
                      <div className="topic-actions">
                        {STATUS_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => updateStatus(areaObj.area, topic.name, opt.value)}
                            disabled={loading}
                            className={`action-btn ${status === opt.value ? 'active' : ''} ${opt.value}`}
                            title={opt.label}
                          >
                            {opt.icon}
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
  );
}
