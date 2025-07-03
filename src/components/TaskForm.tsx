import { useState, useEffect } from 'react';
import type { Task, Subject } from '../types';
import { X } from 'lucide-react';

interface TaskFormProps {
  subjects: Subject[];
  task?: Task | null;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const TaskForm = ({ subjects, task, onSubmit, onClose }: TaskFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    date: '',
    duration: 30,
    status: 'pendente' as Task['status']
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        subjectId: task.subjectId,
        date: task.date,
        duration: task.duration,
        status: task.status
      });
    } else {
      // Set default date to today
      setFormData(prev => ({
        ...prev,
        date: new Date().toISOString().split('T')[0]
      }));
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.subjectId || !formData.date) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(6px)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#111112',border:'2px solid #3b82f6',borderRadius:24,padding:'2.5rem 1.5rem',width:'100%',maxWidth:420,boxShadow:'0 8px 32px 0 rgba(0,0,0,0.35)',animation:'fadeIn 0.4s',position:'relative',maxHeight:'90vh',overflowY:'auto'}}>
        <button onClick={onClose} style={{position:'absolute',top:18,right:18,background:'none',border:'none',color:'#a1a1aa',fontSize:26,cursor:'pointer',transition:'color 0.2s'}} onMouseOver={e=>e.currentTarget.style.color='#fff'} onMouseOut={e=>e.currentTarget.style.color='#a1a1aa'} aria-label="Fechar">
          <X size={28} />
        </button>
        <h2 style={{fontSize:'1.6rem',fontWeight:700,color:'#fff',marginBottom:28,letterSpacing:'-1px',textAlign:'center',textShadow:'0 2px 12px #0008'}}>
          {task ? 'Editar Tarefa' : 'Nova Tarefa'}
        </h2>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:22}}>
          <div>
            <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1rem',marginBottom:6,display:'block'}}>Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => handleChange('title', e.target.value)}
              style={{width:'100%',background:'#18181b',border:'1.5px solid #23232b',borderRadius:12,padding:'1rem',fontSize:'1.08rem',color:'#fff',marginTop:4,outline:'none',transition:'border 0.2s'}}
              placeholder="Digite o título da tarefa"
              required
              onFocus={e=>e.currentTarget.style.borderColor='#3b82f6'}
              onBlur={e=>e.currentTarget.style.borderColor='#23232b'}
            />
          </div>
          <div>
            <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1rem',marginBottom:6,display:'block'}}>Descrição</label>
            <textarea
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              style={{width:'100%',background:'#18181b',border:'1.5px solid #23232b',borderRadius:12,padding:'1rem',fontSize:'1.08rem',color:'#fff',marginTop:4,outline:'none',transition:'border 0.2s',resize:'none'}}
              rows={3}
              placeholder="Digite a descrição da tarefa (opcional)"
              onFocus={e=>e.currentTarget.style.borderColor='#3b82f6'}
              onBlur={e=>e.currentTarget.style.borderColor='#23232b'}
            />
          </div>
          <div>
            <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1rem',marginBottom:6,display:'block'}}>Matéria *</label>
            <select
              value={formData.subjectId}
              onChange={e => handleChange('subjectId', e.target.value)}
              style={{width:'100%',background:'#18181b',border:'1.5px solid #23232b',borderRadius:12,padding:'1rem',fontSize:'1.08rem',color:'#fff',marginTop:4,outline:'none',transition:'border 0.2s'}}
              required
              onFocus={e=>e.currentTarget.style.borderColor='#3b82f6'}
              onBlur={e=>e.currentTarget.style.borderColor='#23232b'}
            >
              <option value="">Selecione uma matéria</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div>
              <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1rem',marginBottom:6,display:'block'}}>Data *</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => handleChange('date', e.target.value)}
                style={{width:'100%',background:'#18181b',border:'1.5px solid #23232b',borderRadius:12,padding:'1rem',fontSize:'1.08rem',color:'#fff',marginTop:4,outline:'none',transition:'border 0.2s'}}
                required
                onFocus={e=>e.currentTarget.style.borderColor='#3b82f6'}
                onBlur={e=>e.currentTarget.style.borderColor='#23232b'}
              />
            </div>
            <div>
              <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1rem',marginBottom:6,display:'block'}}>Duração (min) *</label>
              <input
                type="number"
                value={formData.duration}
                onChange={e => handleChange('duration', parseInt(e.target.value) || 30)}
                style={{width:'100%',background:'#18181b',border:'1.5px solid #23232b',borderRadius:12,padding:'1rem',fontSize:'1.08rem',color:'#fff',marginTop:4,outline:'none',transition:'border 0.2s'}}
                min="5"
                max="480"
                step="5"
                required
                onFocus={e=>e.currentTarget.style.borderColor='#3b82f6'}
                onBlur={e=>e.currentTarget.style.borderColor='#23232b'}
              />
            </div>
          </div>
          <div>
            <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1rem',marginBottom:6,display:'block'}}>Status</label>
            <select
              value={formData.status}
              onChange={e => handleChange('status', e.target.value as Task['status'])}
              style={{width:'100%',background:'#18181b',border:'1.5px solid #23232b',borderRadius:12,padding:'1rem',fontSize:'1.08rem',color:'#fff',marginTop:4,outline:'none',transition:'border 0.2s'}}
              onFocus={e=>e.currentTarget.style.borderColor='#3b82f6'}
              onBlur={e=>e.currentTarget.style.borderColor='#23232b'}
            >
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluída">Concluída</option>
            </select>
          </div>
          <div style={{display:'flex',gap:14,marginTop:18}}>
            <button
              type="button"
              onClick={onClose}
              style={{flex:1,background:'#23232b',color:'#fff',border:'none',borderRadius:12,padding:'0.95rem 0',fontSize:'1.08rem',fontWeight:500,letterSpacing:0.5,transition:'background 0.18s',cursor:'pointer'}}
              onMouseOver={e=>e.currentTarget.style.background='#18181b'}
              onMouseOut={e=>e.currentTarget.style.background='#23232b'}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{flex:1,background:'#3b82f6',color:'#fff',border:'none',borderRadius:12,padding:'0.95rem 0',fontSize:'1.08rem',fontWeight:600,letterSpacing:0.5,boxShadow:'0 2px 16px 0 #3b82f633',transition:'background 0.18s',cursor:'pointer'}}
              onMouseOver={e=>e.currentTarget.style.background='#2563eb'}
              onMouseOut={e=>e.currentTarget.style.background='#3b82f6'}
            >
              {task ? 'Atualizar' : 'Criar'} Tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm; 