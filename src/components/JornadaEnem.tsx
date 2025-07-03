import { useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useSupabaseEnemJourney } from '../hooks/useSupabaseEnemJourney';
import { Sparkles, Smile, CheckCircle, Hourglass } from 'lucide-react';

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

export default function JornadaEnem({ user }: { user: any }) {
  const { journey, loading, updateStatus } = useSupabaseEnemJourney(user?.id || null);

  // Animação de progresso geral
  const total = ENEM_CONTENTS.reduce((acc, area) => acc + area.topics.length, 0);
  const dominados = journey.filter(j => j.status === 'dominado').length;
  const progresso = Math.round((dominados / total) * 100);

  return (
    <div className="space-y-8 fade-in-up">
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        Jornada ENEM
        <Smile className="text-blue-400 animate-bounce" size={28} />
      </h2>
      <p className="text-gray-400 mb-6">Veja os conteúdos mais cobrados no ENEM, marque seu progresso e acompanhe sua evolução!</p>
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
      {ENEM_CONTENTS.map(areaObj => (
        <div key={areaObj.area} className="mb-8">
          <h3 className="text-xl font-semibold text-blue-400 mb-3 flex items-center gap-2">
            {areaObj.area}
            <Sparkles className="text-blue-400 animate-bounce" size={20} />
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {areaObj.topics.map(topic => {
              const status = journey.find(j => j.area === areaObj.area && j.content === topic)?.status || 'não iniciado';
              const statusObj = STATUS_OPTIONS.find(opt => opt.value === status);
              return (
                <div key={topic} className={`p-4 rounded-lg border flex flex-col gap-2 transition-all shadow-md ${status === 'dominado' ? 'bg-green-900/10 border-green-400/30' : status === 'em progresso' ? 'bg-yellow-900/10 border-yellow-400/30' : 'bg-[#18181b] border-blue-900/30'}`}>
                  <div className="font-medium text-white mb-1 flex items-center gap-2">
                    {statusObj?.icon}
                    {topic}
                  </div>
                  <div className="flex gap-2 items-center">
                    {STATUS_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => updateStatus(areaObj.area, topic, opt.value)}
                        disabled={loading}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 ${status === opt.value ? 'bg-blue-500 text-white border-blue-500' : 'bg-transparent text-blue-300 border-blue-700 hover:bg-blue-700/20'}`}
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
        </div>
      ))}
    </div>
  );
} 