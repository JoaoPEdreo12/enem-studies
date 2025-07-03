
import type { Subject } from '../types';
import { Edit, Trash2, BookOpen, Plus, Palette, Star } from 'lucide-react';
import { useState } from 'react';
import SubjectForm from './SubjectForm';

interface SubjectManagerProps {
  subjects: Subject[];
  onEdit: (subject: Subject) => void;
  onDelete: (subjectId: string) => void;
  addSubject: (data: any) => void;
}

const SubjectManager = ({ subjects, onDelete, addSubject }: SubjectManagerProps) => {
  const [showForm, setShowForm] = useState(false)
  
  const handleCreate = (data: any) => {
    addSubject(data)
    setShowForm(false)
  }

  const getPriorityLabel = (priority: Subject['priority']) => {
    switch (priority) {
      case 'alta':
        return 'Alta';
      case 'média':
        return 'Média';
      case 'baixa':
        return 'Baixa';
      default:
        return priority;
    }
  };

  const getPriorityIcon = (priority: Subject['priority']) => {
    switch (priority) {
      case 'alta':
        return <Star className="text-red-400" size={16} fill="currentColor" />;
      case 'média':
        return <Star className="text-yellow-400" size={16} fill="currentColor" />;
      case 'baixa':
        return <Star className="text-green-400" size={16} fill="currentColor" />;
      default:
        return <Star className="text-gray-400" size={16} />;
    }
  };

  const getPriorityColor = (priority: Subject['priority']) => {
    switch (priority) {
      case 'alta':
        return 'border-red-400/30 bg-red-400/10 text-red-300';
      case 'média':
        return 'border-yellow-400/30 bg-yellow-400/10 text-yellow-300';
      case 'baixa':
        return 'border-green-400/30 bg-green-400/10 text-green-300';
      default:
        return 'border-gray-400/30 bg-gray-400/10 text-gray-300';
    }
  };

  return (
    <div className="space-y-8 fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
            <BookOpen className="text-blue-400" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Suas Matérias</h2>
            <p className="text-gray-400 text-base">
              {subjects.length} matéria{subjects.length !== 1 ? 's' : ''} cadastrada{subjects.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowForm(true)} 
          className="btn btn-gradient-primary hover-lift flex items-center gap-2 px-6 py-3 text-base font-semibold"
        >
          <Plus size={20} />
          Nova Matéria
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="scale-in">
            <SubjectForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="text-center py-20 fade-in-up">
          <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6">
            <BookOpen className="text-blue-400" size={64} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Nenhuma matéria cadastrada</h3>
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
            Comece adicionando suas matérias favoritas para organizar melhor seus estudos!
          </p>
          <button 
            onClick={() => setShowForm(true)}
            className="btn btn-gradient-primary hover-lift px-8 py-4 text-lg font-semibold"
          >
            <Plus size={24} className="mr-2" />
            Adicionar Primeira Matéria
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in-up">
          {subjects.map((subject, index) => (
            <div
              key={subject.id}
              className="group card hover-lift transition-all duration-500"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                background: 'rgba(26, 26, 58, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '20px'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg transition-transform group-hover:scale-110"
                    style={{ 
                      background: `linear-gradient(135deg, ${subject.color}, ${subject.color}dd)`,
                      boxShadow: `0 8px 32px ${subject.color}40`
                    }}
                  >
                    {subject.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-1">{subject.name}</h3>
                    <p className="text-gray-400 text-sm">{subject.category}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onDelete(subject.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group/btn"
                    title="Excluir matéria"
                  >
                    <Trash2 size={16} className="text-red-400 group-hover/btn:text-red-300" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {getPriorityIcon(subject.priority)}
                    <span className="text-gray-400 text-sm">Prioridade:</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(subject.priority)}`}>
                    {getPriorityLabel(subject.priority)}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Palette className="text-gray-400" size={16} />
                  <span className="text-gray-400 text-sm">Categoria:</span>
                  <span className="text-white text-sm font-medium">{subject.category}</span>
                </div>
                
                <div className="flex items-center gap-3 pt-2">
                  <div 
                    className="w-5 h-5 rounded-lg shadow-md" 
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="text-gray-400 text-sm">Cor da matéria</span>
                  <div className="ml-auto">
                    <span 
                      className="text-xs font-mono px-2 py-1 rounded bg-black/30 text-gray-300"
                    >
                      {subject.color.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-700/50 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Criada em {new Date().toLocaleDateString('pt-BR')}
                </div>
                <button
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  onClick={() => console.log('Edit subject:', subject.id)}
                >
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectManager;
