import type { Task, Subject } from '../types';
import { getWeekDays } from '../utils/dateUtils';
import { Calendar, Clock } from 'lucide-react';

interface StudyCalendarProps {
  tasks: Task[];
  subjects: Subject[];
}

const StudyCalendar = ({ tasks, subjects }: StudyCalendarProps) => {
  const weekDays = getWeekDays();

  const getSubjectById = (id: string) => subjects.find(s => s.id === id);

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      const t = task as any;
      const taskDate = task.date || (t.due_date ? t.due_date.split('T')[0] : '');
      return taskDate === dateStr;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="text-blue-400" size={24} />
        <h2 className="text-xl font-semibold text-white">Cronograma Semanal</h2>
      </div>

      <div className="rounded-lg p-6" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)'}}>
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const dayTasks = getTasksForDate(day.date);
            
            return (
              <div key={index} className="space-y-3">
                <div className="p-2 rounded-lg" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',textAlign:'center'}}>
                  <div className="text-sm font-medium" style={{color:'var(--color-text)'}}>{day.dayName}</div>
                  <div className="text-lg font-bold" style={{color:'var(--color-text)'}}>{day.dayNumber}</div>
                </div>

                <div className="space-y-2 min-h-[200px]">
                  {dayTasks.length === 0 ? (
                    <div className="text-center" style={{color:'var(--color-text-muted)',fontSize:'0.95rem',padding:'2rem 0'}}>Nenhuma tarefa</div>
                  ) : (
                    dayTasks.map(task => {
                      const t = task as any;
                      const subjectId = task.subjectId || t.subject_id;
                      const subject = getSubjectById(subjectId);
                      const taskDateStr = task.date || (t.due_date ? t.due_date.split('T')[0] : '');
                      const today = new Date();
                      today.setUTCHours(today.getUTCHours() - 3, 0, 0, 0); // Ajusta para Brasília
                      today.setHours(0,0,0,0);
                      const taskDate = new Date(taskDateStr + 'T00:00:00-03:00');
                      taskDate.setHours(0,0,0,0);
                      const isOverdue = taskDate < today && task.status !== 'concluída';
                      
                      return (
                        <div
                          key={task.id}
                          className="p-2 rounded text-xs"
                          style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',marginBottom:4}}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{background: subject?.color || 'var(--color-border)'}} />
                          </div>
                          
                          <div className="font-medium" style={{color:'var(--color-text)'}}>{task.title}</div>
                          
                          {subject && (
                            <div style={{color:'var(--color-text-muted)',fontSize:'0.95rem'}}>{subject.name}</div>
                          )}
                          
                          <div className="flex items-center gap-1" style={{color:'var(--color-text-muted)',fontSize:'0.95rem',marginTop:2}}>
                            <Clock size={10} />
                            {task.duration}min
                          </div>
                          {isOverdue && (
                            <div style={{color:'var(--color-error)',fontWeight:600,marginTop:2}}>
                              ⚠️ Tarefa atrasada
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="rounded-lg p-4" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)'}}>
        <h3 className="font-medium mb-3" style={{color:'var(--color-text)'}}>Legenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{background:'var(--color-border)'}}></div>
            <span className="text-sm" style={{color:'var(--color-text-muted)'}}>Pendente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{background:'var(--color-border)'}}></div>
            <span className="text-sm" style={{color:'var(--color-text-muted)'}}>Em Andamento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{background:'var(--color-border)'}}></div>
            <span className="text-sm" style={{color:'var(--color-text-muted)'}}>Concluída</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{background:'var(--color-border)'}}></div>
            <span className="text-sm" style={{color:'var(--color-text-muted)'}}>Atrasada</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyCalendar; 