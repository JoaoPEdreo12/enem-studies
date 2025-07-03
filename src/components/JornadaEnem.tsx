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

// Mascote pixel art educativo (livre para uso pessoal)
const Mascote = () => (
  <div className="mascote-bounce" style={{width:56, height:56, marginBottom:4, display:'flex', justifyContent:'center', alignItems:'center'}}>
    <img src="https://pixeljoint.com/files/icons/full/avatar_mierdinsky.gif" alt="Mascote" style={{width:'100%',height:'100%',borderRadius:12,boxShadow:'0 4px 16px #23232b',background:'#fff',objectFit:'cover'}} />
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

  // Encontra o índice do último tópico dominado para posicionar o mascote
  const lastDominatedIdx = areaObj.topics.reduce((acc, topic, idx) => {
    const status = journey.find(j => j.area === areaObj.area && j.content === topic)?.status;
    return status === 'dominado' ? idx : acc;
  }, -1);

  return (
    <div className="space-y-8 fade-in-up">
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        Jornada ENEM
        <Smile className="text-blue-400 animate-bounce" size={28} />
      </h2>
      <p className="text-gray-400 mb-6">Escolha a matéria e avance no seu tabuleiro de estudos! Marque seu progresso e veja sua evolução de forma gamificada.</p>
      {/* Progresso geral */}
      <div className="mb-8 flex items-center gap-4">
        <div className="w-32 h-32 flex items-center justify-center relative">
          <svg width="100" height="100">
            <circle cx="50" cy="50" r="45" stroke="#23232b" strokeWidth="10" fill="none" />
            <circle
              cx="50" cy="50" r="45"
              stroke="#3b82f6"
              strokeWidth="10"
              fill="none"
              strokeDasharray={2 * Math.PI * 45}
              strokeDashoffset={2 * Math.PI * 45 * (1 - progresso / 100)}
              style={{ transition: 'stroke-dashoffset 0.6s' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-blue-400 animate-pulse">{progresso}%</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-lg text-white font-semibold">Progresso Geral</span>
          <span className="text-gray-400">{dominados} de {total} tópicos dominados</span>
        </div>
      </div>
      {/* Seleção de área/matéria - botões organizados em linha centralizada */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center items-center" style={{rowGap:12}}>
        {ENEM_CONTENTS.map(area => (
          <button
            key={area.area}
            onClick={() => setSelectedArea(area.area)}
            className={`btn-filtro-materia px-4 py-2 rounded-full font-semibold border transition-all flex items-center gap-2 ${selectedArea === area.area ? 'btn-filtro-ativo' : 'btn-filtro-inativo'}`}
            style={{boxShadow: selectedArea === area.area ? '0 2px 12px #3b82f6aa' : 'none', minWidth:120, justifyContent:'center'}}
          >
            <ChevronRight size={16} className={selectedArea === area.area ? 'animate-bounce' : ''} />
            {area.area}
          </button>
        ))}
      </div>
      {/* Tabuleiro gamificado */}
      <div className="relative flex flex-col items-center board-responsive" style={{minHeight:400, width:'100%', overflowX:'auto'}}>
        <div className="font-bold text-white text-lg mb-2 animate-fade-in">{areaObj.area}</div>
        <div className="board-container" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:32,position:'relative',minHeight:320}}>
          {/* Mascote acima do primeiro tópico */}
          <div style={{height:60, display:'flex', alignItems:'flex-end', justifyContent:'center', width:'100%'}}>
            <Mascote />
          </div>
          {areaObj.topics.map((topic, idx) => {
            const status = journey.find(j => j.area === areaObj.area && j.content === topic)?.status || 'não iniciado';
            const statusObj = STATUS_OPTIONS.find(opt => opt.value === status);
            const isLeft = idx % 2 === 0;
            // Mascote só aparece acima do primeiro tópico
            return (
              <div key={topic} style={{display:'flex',flexDirection:isLeft?'row':'row-reverse',alignItems:'center',width:'100%',maxWidth:480,position:'relative',marginBottom:8}}>
                {/* Linha de conexão */}
                {idx > 0 && (
                  <div style={{position:'absolute',top:-32,left:isLeft?60:undefined,right:!isLeft?60:undefined,width:2,height:32,background:'#3b82f6',zIndex:0,transition:'background 0.3s'}} />
                )}
                {/* Espaço para mascote (apenas no primeiro) */}
                <div style={{width:60,display:'flex',justifyContent:'center',alignItems:'center'}}>
                  {/* vazio para alinhamento */}
                </div>
                {/* Casa do tabuleiro */}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-4 transition-all duration-300 ${status === 'dominado' ? 'bg-green-400/80 border-green-400 scale-110 animate-bounce' : status === 'em progresso' ? 'bg-yellow-400/80 border-yellow-400 scale-105 animate-pulse' : 'bg-blue-900/80 border-blue-700'}`} style={{marginBottom:4,zIndex:2}}>
                  {statusObj?.icon}
                </div>
                <div className="font-medium text-white mb-1 flex items-center gap-2 text-center" style={{minWidth:160}}>{topic}</div>
                <div className="flex gap-2 items-center mb-2 flex-wrap justify-center" style={{rowGap:6}}>
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateStatus(areaObj.area, topic, opt.value)}
                      disabled={loading}
                      className={`btn-status-jornada px-3 py-1 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 ${status === opt.value ? 'btn-status-ativo' : 'btn-status-inativo'}`}
                      style={{boxShadow: status === opt.value ? '0 2px 8px #3b82f6aa' : 'none', minWidth:90, justifyContent:'center'}}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">Status: <span className="font-semibold text-blue-300">{statusObj?.label}</span></div>
                {status === 'dominado' && <div className="text-green-400 text-xs mt-2 animate-bounce">Parabéns! Você dominou esse tópico! <Smile className="inline ml-1 animate-bounce" size={16} /></div>}
              </div>
            );
          })}
        </div>
        {/* Progresso da área */}
        <div className="mt-8 flex flex-col items-center">
          <div className="w-24 h-24 flex items-center justify-center relative">
            <svg width="90" height="90">
              <circle cx="45" cy="45" r="40" stroke="#23232b" strokeWidth="8" fill="none" />
              <circle
                cx="45" cy="45" r="40"
                stroke="#3b82f6"
                strokeWidth="8"
                fill="none"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - areaProgresso / 100)}
                style={{ transition: 'stroke-dashoffset 0.6s' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-blue-400 animate-pulse">{areaProgresso}%</span>
          </div>
          <span className="text-lg text-white font-semibold mt-2">Progresso em {areaObj.area}</span>
          <span className="text-gray-400">{areaDominados} de {areaTotal} tópicos dominados</span>
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