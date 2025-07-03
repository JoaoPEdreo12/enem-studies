import { useState, useEffect } from 'react';
import type { Subject } from '../types';
import { X } from 'lucide-react';

interface SubjectFormProps {
  subject?: Subject | null;
  onSubmit: (subject: Omit<Subject, 'id'>) => void;
  onClose: () => void;
}

const SubjectForm = ({ subject, onSubmit, onClose }: SubjectFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    priority: 'média' as Subject['priority'],
    category: '',
    color: '#3B82F6'
  });

  const categories = [
    'Ciências Exatas',
    'Ciências da Natureza',
    'Ciências Humanas',
    'Linguagens',
    'Outros'
  ];

  const colors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6B7280'  // Gray
  ];

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name,
        priority: subject.priority,
        category: subject.category,
        color: subject.color
      });
    }
  }, [subject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      return;
    }
    try {
      console.log('Enviando para onSubmit:', formData);
      await onSubmit(formData);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err?.message || 'Erro ao criar matéria.');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(6px)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#111112',border:'2px solid #3b82f6',borderRadius:24,padding:'2.5rem 1.5rem',width:'100%',maxWidth:400,boxShadow:'0 8px 32px 0 rgba(0,0,0,0.35)',animation:'fadeIn 0.4s',position:'relative'}}>
        <button onClick={onClose} style={{position:'absolute',top:18,right:18,background:'none',border:'none',color:'#a1a1aa',fontSize:26,cursor:'pointer',transition:'color 0.2s'}} onMouseOver={e=>e.currentTarget.style.color='#fff'} onMouseOut={e=>e.currentTarget.style.color='#a1a1aa'} aria-label="Fechar">
          <X size={28} />
        </button>
        <h2 style={{fontSize:'1.6rem',fontWeight:700,color:'#fff',marginBottom:28,letterSpacing:'-1px',textAlign:'center',textShadow:'0 2px 12px #0008'}}>
          {subject ? 'Editar Matéria' : 'Nova Matéria'}
        </h2>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:22}}>
          <div>
            <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1rem',marginBottom:6,display:'block'}}>Nome da Matéria *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              style={{width:'100%',background:'#18181b',border:'1.5px solid #23232b',borderRadius:12,padding:'1rem',fontSize:'1.08rem',color:'#fff',marginTop:4,outline:'none',transition:'border 0.2s'}}
              placeholder="Ex: Matemática"
              required
              onFocus={e=>e.currentTarget.style.borderColor='#3b82f6'}
              onBlur={e=>e.currentTarget.style.borderColor='#23232b'}
            />
          </div>
          <div>
            <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1rem',marginBottom:6,display:'block'}}>Categoria *</label>
            <select
              value={formData.category}
              onChange={e => handleChange('category', e.target.value)}
              style={{width:'100%',background:'#18181b',border:'1.5px solid #23232b',borderRadius:12,padding:'1rem',fontSize:'1.08rem',color:'#fff',marginTop:4,outline:'none',transition:'border 0.2s'}}
              required
              onFocus={e=>e.currentTarget.style.borderColor='#3b82f6'}
              onBlur={e=>e.currentTarget.style.borderColor='#23232b'}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1rem',marginBottom:6,display:'block'}}>Prioridade</label>
            <select
              value={formData.priority}
              onChange={e => handleChange('priority', e.target.value as Subject['priority'])}
              style={{width:'100%',background:'#18181b',border:'1.5px solid #23232b',borderRadius:12,padding:'1rem',fontSize:'1.08rem',color:'#fff',marginTop:4,outline:'none',transition:'border 0.2s'}}
              onFocus={e=>e.currentTarget.style.borderColor='#3b82f6'}
              onBlur={e=>e.currentTarget.style.borderColor='#23232b'}
            >
              <option value="baixa">Baixa</option>
              <option value="média">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          <div>
            <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1rem',marginBottom:6,display:'block'}}>Cor da Matéria</label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginTop:8}}>
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleChange('color', color)}
                  style={{width:38,height:38,borderRadius:'50%',border:formData.color===color?'3px solid #3b82f6':'2px solid #23232b',background:color,outline:'none',boxShadow:formData.color===color?'0 0 0 4px #3b82f655':'none',transition:'all 0.18s',transform:formData.color===color?'scale(1.13)':'scale(1)'}}
                  aria-label={color}
                />
              ))}
            </div>
            <div style={{marginTop:10,display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:18,height:18,borderRadius:'50%',background:formData.color,border:'2px solid #3b82f6'}} />
              <span style={{color:'#a1a1aa',fontSize:'0.98rem'}}>{formData.color}</span>
            </div>
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
              {subject ? 'Atualizar' : 'Criar'} Matéria
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectForm; 