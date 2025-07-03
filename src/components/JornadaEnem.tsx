import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useSupabaseEnemJourney } from '../hooks/useSupabaseEnemJourney';
import { Sparkles, Smile, CheckCircle, Hourglass, ChevronRight } from 'lucide-react';

// Lista dos principais conteúdos do ENEM por área (baseado em estatísticas públicas)
const ENEM_CONTENTS = [
  {
    area: 'Matemática',
    topics: [
      'Funções do 1º grau',
      'Funções do 2º grau',
      'Probabilidade',
      'Geometria Espacial',
      'Porcentagem',
      'Progressões (PA e PG)',
      'Trigonometria',
      'Estatística',
      'Análise Combinatória',
      'Geometria Plana',
      'Equações e Inequações',
      'Logaritmos',
      'Matrizes e Determinantes',
      'Gráficos e Tabelas',
    ]
  },
  {
    area: 'Linguagens',
    topics: [
      'Interpretação de Texto',
      'Figuras de Linguagem',
      'Gêneros Textuais',
      'Gramática (Morfologia e Sintaxe)',
      'Funções da Linguagem',
      'Variação Linguística',
      'Literatura Brasileira',
      'Arte e Cultura',
      'Educação Física',
      'Tecnologias da Informação',
    ]
  },
  {
    area: 'Ciências Humanas',
    topics: [
      'História do Brasil',
      'História Geral',
      'Geografia do Brasil',
      'Geopolítica',
      'Atualidades',
      'Filosofia',
      'Sociologia',
      'Cidadania e Direitos Humanos',
      'Economia',
      'Demografia',
    ]
  },
  {
    area: 'Ciências da Natureza',
    topics: [
      'Química Geral',
      'Físico-Química',
      'Química Orgânica',
      'Biologia Celular',
      'Genética',
      'Ecologia',
      'Física Mecânica',
      'Física Óptica',
      'Física Elétrica',
      'Astronomia',
      'Saúde e Meio Ambiente',
    ]
  },
  {
    area: 'Redação',
    topics: [
      'Estrutura do Texto Dissertativo',
      'Competências do ENEM',
      'Proposta de Intervenção',
      'Coesão e Coerência',
      'Argumentação',
      'Repertório Sociocultural',
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
    const status = journey.find(j => j.area === areaObj.area && j.content === topic)?.status;
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
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {ENEM_CONTENTS.map(area => (
          <button
            key={area.area}
            onClick={() => setSelectedArea(area.area)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedArea === area.area 
                ? 'bg-blue-500 text-white border-2 border-blue-300' 
                : 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:bg-gray-600'
            }`}
          >
            {area.area}
          </button>
        ))}
      </div>
      {/* Tabuleiro gamificado em zigue-zague */}
      <div className="relative flex flex-col items-center board-responsive" style={{minHeight:400, width:'100%', overflowX:'auto'}}>
        <div className="font-bold text-white text-lg mb-4 animate-fade-in">{areaObj.area}</div>
        
        {/* Container do caminho em zigue-zague */}
        <div className="zigzag-path-container" style={{position:'relative', width:'100%', maxWidth:'800px', minHeight:'600px'}}>
          
          {/* Avatar do estudante na posição atual */}
          <div style={{
            position:'absolute',
            top: `${Math.floor(avatarPosition / 2) * 180 + 40}px`,
            left: avatarPosition % 2 === 0 ? '20%' : '70%',
            transform: 'translate(-50%, -100%)',
            zIndex: 10
          }}>
            <AvatarEstudante isActive={true} />
          </div>
          
          {areaObj.topics.map((topic, idx) => {
            const status = journey.find(j => j.area === areaObj.area && j.content === topic)?.status || 'não iniciado';
            const statusObj = STATUS_OPTIONS.find(opt => opt.value === status);
            const isLeft = idx % 2 === 0;
            const row = Math.floor(idx / 2);
            const yPosition = row * 180 + 80;
            const xPosition = isLeft ? '20%' : '70%';
            
            return (
              <div key={topic}>
                {/* Linha de conexão em zigue-zague */}
                {idx > 0 && (
                  <svg 
                    style={{
                      position: 'absolute',
                      top: idx % 2 === 1 ? `${yPosition - 80}px` : `${yPosition - 160}px`,
                      left: 0,
                      width: '100%',
                      height: idx % 2 === 1 ? '80px' : '160px',
                      zIndex: 1,
                      pointerEvents: 'none'
                    }}
                  >
                    {idx % 2 === 1 ? (
                      // Linha horizontal da esquerda para a direita
                      <path
                        d={`M 20% 80 Q 50% 60 70% 80`}
                        stroke="#4B5563"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray="8,4"
                        className="animate-pulse"
                      />
                    ) : (
                      // Linha diagonal para baixo
                      <path
                        d={`M 70% 0 Q 70% 80 20% 160`}
                        stroke="#4B5563"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray="8,4"
                        className="animate-pulse"
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
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl border-4 transition-all duration-500 ${
                    status === 'dominado' 
                      ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-300 scale-110 animate-bounce shadow-green-400/50' 
                      : status === 'em progresso' 
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300 scale-105 animate-pulse shadow-yellow-400/50' 
                        : 'bg-gradient-to-br from-blue-800 to-blue-900 border-blue-600 shadow-blue-400/30'
                  }`}>
                    <div className="text-2xl">
                      {statusObj?.icon}
                    </div>
                  </div>
                  
                  {/* Label do tópico simplificado */}
                  <div className={`absolute ${isLeft ? 'left-full ml-4' : 'right-full mr-4'} top-1/2 transform -translate-y-1/2 bg-gray-800/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-600 min-w-[180px]`}>
                    <div className="font-medium text-white text-sm text-center mb-2">{topic}</div>
                    
                    {/* Botões de status compactos */}
                    <div className="flex gap-1 justify-center">
                      {STATUS_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => updateStatus(areaObj.area, topic, opt.value)}
                          disabled={loading}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            status === opt.value 
                              ? 'bg-blue-500 border-blue-300 text-white scale-110' 
                              : 'bg-gray-700 border-gray-500 text-gray-400 hover:bg-gray-600'
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
        {/* Progresso da área compacto */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-gray-800/50 rounded-full px-3 py-1.5 border border-gray-600">
            <span className="text-blue-400 font-bold">{areaProgresso}%</span>
            <span className="text-gray-300 text-sm">{areaObj.area}</span>
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