import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useSupabaseEnemJourney } from '../hooks/useSupabaseEnemJourney';
import { Sparkles, Smile, CheckCircle, Hourglass, ChevronRight } from 'lucide-react';

// Lista dos principais conteúdos do ENEM por área (baseado em estatísticas públicas)
const ENEM_CONTENTS = [
  {
    area: 'Matemática',
    topics: [
      { name: 'Funções do 1º grau', percentage: '7%' },
      { name: 'Funções do 2º grau', percentage: '6%' },
      { name: 'Probabilidade', percentage: '8%' },
      { name: 'Geometria Espacial', percentage: '9%' },
      { name: 'Porcentagem', percentage: '10%' },
      { name: 'Progressões (PA e PG)', percentage: '5%' },
      { name: 'Trigonometria', percentage: '6%' },
      { name: 'Estatística', percentage: '7%' },
      { name: 'Análise Combinatória', percentage: '4%' },
      { name: 'Geometria Plana', percentage: '8%' },
      { name: 'Equações e Inequações', percentage: '7%' },
      { name: 'Logaritmos', percentage: '3%' },
      { name: 'Matrizes e Determinantes', percentage: '2%' },
      { name: 'Gráficos e Tabelas', percentage: '10%' },
      { name: 'Razão e Proporção', percentage: '6%' },
    ]
  },
  {
    area: 'Linguagens',
    topics: [
      { name: 'Interpretação de Texto', percentage: '25%' },
      { name: 'Figuras de Linguagem', percentage: '8%' },
      { name: 'Gêneros Textuais', percentage: '12%' },
      { name: 'Gramática (Morfologia e Sintaxe)', percentage: '10%' },
      { name: 'Funções da Linguagem', percentage: '5%' },
      { name: 'Variação Linguística', percentage: '7%' },
      { name: 'Literatura Brasileira', percentage: '15%' },
      { name: 'Arte e Cultura', percentage: '3%' },
      { name: 'Educação Física', percentage: '2%' },
      { name: 'Tecnologias da Informação', percentage: '3%' },
      { name: 'Coesão e Coerência', percentage: '10%' },
    ]
  },
  {
    area: 'Ciências Humanas',
    topics: [
      { name: 'História do Brasil', percentage: '20%' },
      { name: 'História Geral', percentage: '15%' },
      { name: 'Geografia do Brasil', percentage: '18%' },
      { name: 'Geopolítica', percentage: '10%' },
      { name: 'Atualidades', percentage: '12%' },
      { name: 'Filosofia', percentage: '8%' },
      { name: 'Sociologia', percentage: '7%' },
      { name: 'Cidadania e Direitos Humanos', percentage: '5%' },
      { name: 'Economia', percentage: '3%' },
      { name: 'Demografia', percentage: '2%' },
    ]
  },
  {
    area: 'Ciências da Natureza',
    topics: [
      { name: 'Química Geral', percentage: '15%' },
      { name: 'Físico-Química', percentage: '18%' },
      { name: 'Química Orgânica', percentage: '12%' },
      { name: 'Biologia Celular', percentage: '10%' },
      { name: 'Genética', percentage: '13%' },
      { name: 'Ecologia', percentage: '17%' },
      { name: 'Física Mecânica', percentage: '10%' },
      { name: 'Física Óptica', percentage: '5%' },
      { name: 'Física Elétrica', percentage: '8%' },
      { name: 'Astronomia', percentage: '2%' },
      { name: 'Saúde e Meio Ambiente', percentage: '10%' },
    ]
  },
  {
    area: 'Redação',
    topics: [
      { name: 'Estrutura do Texto Dissertativo', percentage: '20%' },
      { name: 'Competências do ENEM', percentage: '20%' },
      { name: 'Proposta de Intervenção', percentage: '20%' },
      { name: 'Coesão e Coerência', percentage: '15%' },
      { name: 'Argumentação', percentage: '15%' },
      { name: 'Repertório Sociocultural', percentage: '10%' },
    ]
  }
];

const STATUS_OPTIONS = [
  { value: 'não iniciado', label: 'Não iniciado', icon: <Hourglass className="text-gray-400 animate-pulse" size={18} /> },
  { value: 'em progresso', label: 'Em progresso', icon: <Sparkles className="text-yellow-400 animate-bounce" size={18} /> },
  { value: 'dominado', label: 'Dominado', icon: <CheckCircle className="text-green-400 animate-bounce" size={18} /> },
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

  // Encontra o índice do tópico atual (primeiro não dominado ou em progresso)
  const currentTopicIdx = areaObj.topics.findIndex(topic => {
    const status = journey.find(j => j.area === areaObj.area && j.content === topic.name)?.status;
    return status === 'não iniciado' || status === 'em progresso';
  });

  // Se todos estão dominados, coloca no último
  const avatarPosition = currentTopicIdx === -1 ? areaObj.topics.length - 1 : currentTopicIdx;

  return (
    <div className="space-y-8 fade-in-up">
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        Jornada ENEM
        <Smile className="text-blue-400 animate-bounce" size={28} />
      </h2>
      <p className="text-gray-400 mb-6">Escolha a matéria e avance no seu tabuleiro de estudos! Marque seu progresso e veja sua evolução de forma gamificada.</p>
      {/* Progresso geral compacto */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-3 bg-gray-800/50 rounded-full px-4 py-2 border border-gray-600">
          <span className="text-blue-400 font-bold text-lg">{progresso}%</span>
          <span className="text-gray-300 text-sm">{dominados}/{total} concluídos</span>
        </div>
      </div>
      {/* Seleção de área/matéria compacta */}
      <div className="subject-filters">
        {ENEM_CONTENTS.map(area => (
          <button
            key={area.area}
            onClick={() => setSelectedArea(area.area)}
            className={`subject-filter-btn ${
              selectedArea === area.area ? 'active' : 'inactive'
            }`}
          >
            {area.area}
          </button>
        ))}
      </div>
      {/* Tabuleiro gamificado em zigue-zague */}
      <div className="jornada-enem-board">
        <div className="font-bold text-white text-xl mb-4 text-center animate-fade-in">{areaObj.area}</div>

        {/* Container do caminho em zigue-zague */}
        <div className="zigzag-path-container" style={{position:'relative', width:'100%', maxWidth:'700px', minHeight:'450px', margin:'0 auto'}}>

          {/* Avatar do estudante na posição atual */}
          <div style={{
            position:'absolute',
            top: `${Math.floor(avatarPosition / 2) * 140 + 30}px`,
            left: avatarPosition % 2 === 0 ? '25%' : '75%',
            transform: 'translate(-50%, -100%)',
            zIndex: 15
          }}>
            <AvatarEstudante isActive={true} />
          </div>

          {areaObj.topics.map((topic, idx) => {
            const status = journey.find(j => j.area === areaObj.area && j.content === topic.name)?.status || 'não iniciado';
            const statusObj = STATUS_OPTIONS.find(opt => opt.value === status);
            const isLeft = idx % 2 === 0;
            const row = Math.floor(idx / 2);
            const yPosition = row * 140 + 60;
            const xPosition = isLeft ? '25%' : '75%';

            return (
              <div key={topic.name}>
                {/* Linha de conexão em zigue-zague */}
                {idx > 0 && (
                  <svg 
                    style={{
                      position: 'absolute',
                      top: idx % 2 === 1 ? `${yPosition - 60}px` : `${yPosition - 120}px`,
                      left: 0,
                      width: '100%',
                      height: idx % 2 === 1 ? '60px' : '120px',
                      zIndex: 1,
                      pointerEvents: 'none'
                    }}
                  >
                    {idx % 2 === 1 ? (
                      // Linha horizontal da esquerda para a direita
                      <path
                        d={`M 25% 60 Q 50% 45 75% 60`}
                        stroke="#3B82F6"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="6,3"
                        className="animate-pulse"
                        opacity="0.6"
                      />
                    ) : (
                      // Linha diagonal para baixo
                      <path
                        d={`M 75% 0 Q 75% 60 25% 120`}
                        stroke="#3B82F6"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="6,3"
                        className="animate-pulse"
                        opacity="0.6"
                      />
                    )}
                  </svg>
                )}

                {/* Nó do tópico */}
                <div style={{
                  position: 'absolute',
                  top: `${yPosition}px`,
                  left: xPosition,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 5
                }}>
                  {/* Círculo principal do tópico */}
                  <div className={`topic-node ${
                    status === 'dominado' 
                      ? 'status-dominado' 
                      : status === 'em progresso' 
                        ? 'status-em-progresso' 
                        : 'status-nao-iniciado'
                  }`}>
                    <div className="text-lg">
                      {statusObj?.icon}
                    </div>
                  </div>

                  {/* Label do tópico compacto */}
                  <div className={`topic-label ${isLeft ? 'left' : 'right'}`} style={{
                    [isLeft ? 'left' : 'right']: '40px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}>
                    <div className="topic-title">{topic.name} ({topic.percentage})</div>

                    {/* Botões de status compactos */}
                    <div className="status-controls">
                      {STATUS_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => updateStatus(areaObj.area, topic.name, opt.value)}
                          disabled={loading}
                          className={`status-btn ${
                            status === opt.value 
                              ? 'status-btn-active' 
                              : opt.value === 'não iniciado'
                                ? 'status-btn-default'
                                : opt.value === 'em progresso'
                                  ? 'status-btn-warning'
                                  : 'status-btn-success'
                          }`}
                          title={opt.label}
                        >
                          {opt.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progresso da área */}
        <div className="area-progress">
          <div className="progress-badge">
            <span className="progress-percentage">{areaProgresso}%</span>
            <span>{areaObj.area}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sugestão de CSS extra para animações e responsividade:
// .mascote-bounce { animation: mascote-bounce 1.2s infinite alternate; }
// @keyframes mascote-bounce { 0% { transform: translateY(0); } 100% { transform: translateY(-12px); } }
// .animate-fade-in-up { animation: fade-in-up 0.7s both; }
// @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
// .board-responsive { max-width: 100vw; overflow-x: auto; }
// @media (max-width: 600px) { .board-container { max-width: 98vw !important; } }
// .btn-filtro-materia { font-size: 1rem; letter-spacing: 0.01em; background: linear-gradient(90deg,#23232b 60%,#3b82f6 120%); color: #fff; border: 2px solid #3b82f6; box-shadow: 0 2px 8px #23232b22; transition: all 0.2s; }
// .btn-filtro-ativo { background: linear-gradient(90deg,#3b82f6 60%,#23232b 120%); color: #fff; border-color: #fff; }
// .btn-filtro-inativo { background: #18181b; color: #60a5fa; border-color: #3b82f6; }
// .btn-filtro-materia:hover { filter: brightness(1.1); transform: scale(1.05); }
// .btn-status-jornada { font-size: 0.95rem; border-radius: 999px; background: #23232b; color: #60a5fa; border: 2px solid #3b82f6; margin-right: 2px; margin-bottom: 2px; transition: all 0.18s; }
// .btn-status-ativo { background: #3b82f6; color: #fff; border-color: #fff; }
// .btn-status-inativo { background: #18181b; color: #60a5fa; border-color: #3b82f6; }
// .btn-status-jornada:hover { filter: brightness(1.1); transform: scale(1.07); }