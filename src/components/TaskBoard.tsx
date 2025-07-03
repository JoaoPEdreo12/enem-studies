import { useState } from 'react';
import type { Task, Subject } from '../types';
import { formatDuration, getRelativeDate } from '../utils/dateUtils';
import { CheckCircle, Circle, Clock, Edit, Trash2, AlertCircle } from 'lucide-react';
import { toZonedTime, format as formatTz } from 'date-fns-tz';

interface TaskBoardProps {
  tasks: Task[];
  subjects: Subject[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (task: Task) => void;
}

// Função utilitária para pegar a data de hoje em Brasília (YYYY-MM-DD) usando date-fns-tz
function getTodayInBrasilia() {
  const timeZone = 'America/Sao_Paulo';
  const now = new Date();
  const brNow = toZonedTime(now, timeZone);
  return formatTz(brNow, 'yyyy-MM-dd', { timeZone });
}

// Componente principal do quadro de tarefas
export default function TaskBoard({ tasks, subjects, onEdit, onDelete, onToggleComplete }: TaskBoardProps) {
  // Filtros e busca
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Status possíveis das tarefas
  const statuses = [
    { id: 'pendente', label: 'Pendente' },
    { id: 'em_andamento', label: 'Em Andamento' },
    { id: 'concluída', label: 'Concluída' }
  ];

  // Filtra tarefas por status e busca
  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Busca matéria pelo id
  const getSubjectById = (id: string) => subjects.find(s => s.id === id);

  // Ícone de status
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'concluída':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'em_andamento':
        return <AlertCircle className="text-blue-500" size={16} />;
      default:
        return <Circle className="text-yellow-500" size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros de status e busca */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-black border border-gray-700 rounded-xl px-4 py-2 text-white text-base focus:outline-none focus:border-blue-500 transition-all shadow-none appearance-none font-semibold"
            style={{boxShadow:'none',height:'44px',borderColor:'#3f3f46',width:'320px',minWidth:'220px',maxWidth:'100%'}}
            onFocus={e => e.currentTarget.style.borderColor = '#3b82f6'}
            onBlur={e => e.currentTarget.style.borderColor = '#3f3f46'}
          >
            <option value="all" className="text-gray-400">Todas as tarefas</option>
            {statuses.map(status => (
              <option key={status.id} value={status.id} className="text-gray-400">{status.label}</option>
            ))}
          </select>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black border border-gray-700 rounded-xl pl-10 pr-3 py-2 text-white text-base placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all shadow-none font-medium"
            style={{boxShadow:'none',height:'44px',borderColor:'#3f3f46',width:'320px',minWidth:'220px',maxWidth:'100%'}}
            onFocus={e => e.currentTarget.style.borderColor = '#3b82f6'}
            onBlur={e => e.currentTarget.style.borderColor = '#3f3f46'}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" style={{fontSize:'1.15rem',lineHeight:1}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
        </div>
      </div>

      {/* Lista de tarefas filtradas */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">Nenhuma tarefa encontrada</div>
          <div className="text-gray-500">Crie sua primeira tarefa para começar!</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map(task => {
            // Normaliza dados para compatibilidade
            const subjectId = task.subjectId || (task as any).subject_id;
            const date = task.date || ((task as any).due_date ? (task as any).due_date.split('T')[0] : '');
            const subject = getSubjectById(subjectId);
            // Lógica de atraso/conclusão
            const todayBrasilia = getTodayInBrasilia();
            const now = new Date();
            const brNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
            const taskDateEnd = new Date(date + 'T23:59:59-03:00');
            const isOverdue = (date < todayBrasilia || (date === todayBrasilia && brNow > taskDateEnd)) && task.status !== 'concluída';
            const isDone = task.status === 'concluída';
            return (
              <div
                key={task.id}
                style={{
                  background: isDone ? 'linear-gradient(135deg, #101113 80%, #1a2e1a 100%)' : '#18181b',
                  border: isDone ? '2.5px solid #22d3a7' : isOverdue ? '2.5px solid #ef4444' : '2px solid #23232b',
                  borderRadius: '1.3rem',
                  boxShadow: isDone ? '0 4px 32px 0 #22d3a733' : '0 2px 16px 0 #0008',
                  padding: '2.1rem 1.5rem 1.5rem 1.5rem',
                  minHeight: 320,
                  position: 'relative',
                  animation: 'fadeIn 0.5s',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'box-shadow 0.2s, border 0.2s',
                }}
                className="card-task transition"
              >
                {/* Topo: status e ações */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    {isDone ? <CheckCircle size={28} style={{color:'#22d3a7',background:'#101113',borderRadius:'50%',boxShadow:'0 0 0 4px #22d3a722'}} /> : getStatusIcon(task.status)}
                    <span style={{fontWeight:600,fontSize:'1.1rem',color:isDone?'#22d3a7':'#a1a1aa',letterSpacing:0.2}}>{statuses.find(s => s.id === task.status)?.label}</span>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    {/* Botão editar */}
                    <button
                      onClick={() => onEdit(task)}
                      style={{background:'#18181b',border:'2px solid #23232b',borderRadius:12,padding:'0.45rem 0.7rem',boxShadow:'0 2px 8px #0005',cursor:'pointer',transition:'all 0.18s'}}
                      onMouseOver={e=>e.currentTarget.style.background='#23232b'}
                      onMouseOut={e=>e.currentTarget.style.background='#18181b'}
                      aria-label="Editar"
                    >
                      <Edit size={18} style={{color:'#a1a1aa'}} />
                    </button>
                    {/* Botão excluir */}
                    <button
                      onClick={() => onDelete(task.id)}
                      style={{background:'#18181b',border:'2px solid #ef4444',borderRadius:12,padding:'0.45rem 0.7rem',boxShadow:'0 2px 8px #0005',cursor:'pointer',transition:'all 0.18s'}}
                      onMouseOver={e=>e.currentTarget.style.background='#ef4444'}
                      onMouseOut={e=>e.currentTarget.style.background='#18181b'}
                      aria-label="Excluir"
                    >
                      <Trash2 size={18} style={{color:'#ef4444'}} />
                    </button>
                  </div>
                </div>
                {/* Conteúdo da tarefa */}
                <div style={{marginBottom:18}}>
                  <h3 style={{fontWeight:700,fontSize:'1.45rem',color:'#fff',marginBottom:8,letterSpacing:'-1px',lineHeight:1.2}}>{task.title}</h3>
                  {task.description && (
                    <p style={{color:'#a1a1aa',fontSize:'1.08rem',marginBottom:10}}>{task.description}</p>
                  )}
                  {subject && (
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                      <div style={{width:16,height:16,borderRadius:6,background:subject.color}}></div>
                      <span style={{color:'#60a5fa',fontWeight:500,fontSize:'1.05rem'}}>{subject.name}</span>
                    </div>
                  )}
                  <div style={{display:'flex',alignItems:'center',gap:8,color:'#a1a1aa',fontSize:'1.05rem',marginBottom:2}}>
                    <Clock size={16} />
                    <span>{getRelativeDate(date)}</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8,color:'#a1a1aa',fontSize:'1.05rem'}}>
                    <span>⏱️ {formatDuration(task.duration)}</span>
                  </div>
                  {isOverdue && (
                    <div style={{color:'#ef4444',fontWeight:600,marginTop:8}}>⚠️ Tarefa atrasada</div>
                  )}
                </div>
                {/* Rodapé: botão de marcar/desmarcar */}
                <div style={{marginTop:'auto',paddingTop:18}}>
                  <button
                    onClick={() => onToggleComplete(task)}
                    style={{width:'100%',padding:'0.95rem 0',borderRadius:12,fontWeight:600,fontSize:'1.08rem',letterSpacing:0.5,background:isDone?'#23232b':'#22d3a7',color:isDone?'#a1a1aa':'#fff',border:'none',boxShadow:isDone?'none':'0 2px 16px 0 #22d3a733',cursor:'pointer',transition:'background 0.18s'}}
                    onMouseOver={e=>e.currentTarget.style.background=isDone?'#18181b':'#14b89a'}
                    onMouseOut={e=>e.currentTarget.style.background=isDone?'#23232b':'#22d3a7'}
                  >
                    {task.status === 'concluída' ? 'Desmarcar' : 'Marcar como concluída'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 