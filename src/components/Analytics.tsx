import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle, Clock, BookOpen, Settings } from 'lucide-react';
import { useSupabaseTasks } from '../hooks/useSupabaseTasks';
import { useSupabaseSubjects } from '../hooks/useSupabaseSubjects';
import { useSupabaseFlashcards } from '../hooks/useSupabaseFlashcards';
import { useSupabaseErrorNotebook } from '../hooks/useSupabaseErrorNotebook';
import { supabase } from '../supabaseClient';

const Analytics = () => {
  // Estado para o usuário autenticado
  const [user, setUser] = useState<any>(null);

  // Autenticação: mantém usuário logado e escuta mudanças
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    return () => { listener?.subscription.unsubscribe() }
  }, [])

  // Hooks para dados do Supabase
  const { tasks } = useSupabaseTasks(user?.id || null);
  const { subjects } = useSupabaseSubjects(user?.id || null);
  const { flashcards: dbFlashcards } = useSupabaseFlashcards(user?.id || null);
  const { errors: dbErrors } = useSupabaseErrorNotebook(user?.id || null);

  // Usar dados do banco
  const allTasks = tasks || [];
  const allSubjects = subjects || [];
  const allFlashcards = dbFlashcards || [];
  const allErrors = dbErrors || [];

  // DEBUG: Verificar se os dados estão vindo corretamente
  console.log('=== DEBUG ANALYTICS ===');
  console.log('User ID:', user?.id);
  console.log('Tasks:', allTasks);
  console.log('Subjects:', allSubjects);
  console.log('Flashcards:', allFlashcards);
  console.log('Errors:', allErrors);
  console.log('======================');

  // Ajustar campos para compatibilidade
  const getSubjectId = (task: any) => task.subjectId || task.subject_id;
  const getDate = (task: any) => task.date || (task.due_date ? task.due_date.split('T')[0] : '');
  const getStatus = (task: any) => task.status;
  const getDuration = (task: any) => task.duration || 0;

  // Estatísticas gerais
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(task => getStatus(task) === 'concluída').length;
  const pendingTasks = allTasks.filter(task => getStatus(task) === 'pendente').length;
  const inProgressTasks = allTasks.filter(task => getStatus(task) === 'em_andamento').length;
  const overdueTasks = allTasks.filter(task => 
    new Date(getDate(task)) < new Date() && getStatus(task) !== 'concluída'
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Estatísticas por matéria
  const tasksBySubject = allSubjects.map(subject => {
    const subjectTasks = allTasks.filter(task => getSubjectId(task) === subject.id);
    const completed = subjectTasks.filter(task => getStatus(task) === 'concluída').length;
    const total = subjectTasks.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      subject,
      total,
      completed,
      rate
    };
  }).filter(item => item.total > 0);

  // Tempo total de estudo
  const totalStudyTime = allTasks.reduce((acc, task) => acc + getDuration(task), 0);
  const completedStudyTime = allTasks
    .filter(task => getStatus(task) === 'concluída')
    .reduce((acc, task) => acc + getDuration(task), 0);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  // Função para formatar datas das próximas revisões
  const formatNextReviewDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays < 7) return `Em ${diffDays} dias`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // Relatório de flashcards
  const getFlashcardSubjectId = (f: any) => f.subjectId || f.subject_id;
  const getCorrectCount = (f: any) => f.correctCount || f.correct_count || 0;
  const getWrongCount = (f: any) => f.wrongCount || f.wrong_count || 0;
  const getNextReview = (f: any) => f.nextReview || f.next_review;
  
  const flashcardStats = allSubjects.map(subject => {
    const cards = allFlashcards.filter((f: any) => getFlashcardSubjectId(f) === subject.id);
    const correct = cards.reduce((acc: number, c: any) => acc + getCorrectCount(c), 0);
    const wrong = cards.reduce((acc: number, c: any) => acc + getWrongCount(c), 0);
    return { subject, correct, wrong };
  }).filter(item => item.correct > 0 || item.wrong > 0);

  // Estatísticas de revisão dos flashcards
  const now = new Date();
  const flashcardReviewStats = allSubjects.map(subject => {
    const subjectCards = allFlashcards.filter((f: any) => getFlashcardSubjectId(f) === subject.id);
    const readyForReview = subjectCards.filter((f: any) => {
      const nextReview = getNextReview(f);
      if (!nextReview) return true; // Cards novos sempre aparecem
      const reviewDate = new Date(nextReview);
      return reviewDate <= now || reviewDate.toDateString() === now.toDateString();
    });
    const overdue = subjectCards.filter((f: any) => {
      const nextReview = getNextReview(f);
      if (!nextReview) return false;
      return new Date(nextReview) < now;
    });
    const nextReviews = subjectCards
      .filter((f: any) => {
        const nextReview = getNextReview(f);
        return nextReview && new Date(nextReview) > now;
      })
      .sort((a, b) => new Date(getNextReview(a)).getTime() - new Date(getNextReview(b)).getTime())
      .slice(0, 3);
    
    return {
      subject,
      total: subjectCards.length,
      ready: readyForReview.length,
      overdue: overdue.length,
      nextReviews
    };
  }).filter(stat => stat.total > 0);

  // Estatísticas de revisão do caderno de erros
  const errorReviewStats = allSubjects.map(subject => {
    const subjectErrors = allErrors.filter((e: any) => getErrorSubjectId(e) === subject.id);
    
    // Calcular próximas revisões baseado no sistema de revisão espaçada
    const readyForReview = subjectErrors.filter((e: any) => {
      const reviewDates = getReviewDates(e);
      if (reviewDates.length === 0) return true; // Erros novos sempre aparecem
      
      // Sistema de revisão espaçada: 1, 3, 7, 14, 30 dias
      const intervals = [1, 3, 7, 14, 30];
      const lastReview = new Date(reviewDates[reviewDates.length - 1]);
      const nextReviewDate = new Date(lastReview);
      nextReviewDate.setDate(lastReview.getDate() + intervals[Math.min(reviewDates.length - 1, intervals.length - 1)]);
      
      return nextReviewDate <= now;
    });
    
    const overdue = subjectErrors.filter((e: any) => {
      const reviewDates = getReviewDates(e);
      if (reviewDates.length === 0) return false;
      
      const intervals = [1, 3, 7, 14, 30];
      const lastReview = new Date(reviewDates[reviewDates.length - 1]);
      const nextReviewDate = new Date(lastReview);
      nextReviewDate.setDate(lastReview.getDate() + intervals[Math.min(reviewDates.length - 1, intervals.length - 1)]);
      
      return nextReviewDate < now;
    });
    
    const nextReviews = subjectErrors
      .filter((e: any) => {
        const reviewDates = getReviewDates(e);
        if (reviewDates.length === 0) return false;
        
        const intervals = [1, 3, 7, 14, 30];
        const lastReview = new Date(reviewDates[reviewDates.length - 1]);
        const nextReviewDate = new Date(lastReview);
        nextReviewDate.setDate(lastReview.getDate() + intervals[Math.min(reviewDates.length - 1, intervals.length - 1)]);
        
        return nextReviewDate > now;
      })
      .map((e: any) => {
        const reviewDates = getReviewDates(e);
        const intervals = [1, 3, 7, 14, 30];
        const lastReview = new Date(reviewDates[reviewDates.length - 1]);
        const nextReviewDate = new Date(lastReview);
        nextReviewDate.setDate(lastReview.getDate() + intervals[Math.min(reviewDates.length - 1, intervals.length - 1)]);
        
        return {
          ...e,
          nextReviewDate: nextReviewDate.toISOString()
        };
      })
      .sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime())
      .slice(0, 3);
    
    return {
      subject,
      total: subjectErrors.length,
      ready: readyForReview.length,
      overdue: overdue.length,
      nextReviews
    };
  }).filter(stat => stat.total > 0);

  // Estatísticas do Caderno de Erros
  const getErrorSubjectId = (e: any) => e.subjectId || e.subject_id;
  const getErrorType = (e: any) => e.errorType || e.error_type;
  const getReviewDates = (e: any) => e.reviewDates || e.review_dates || [];
  const totalErrors = allErrors.length;
  const totalErrorReviews = allErrors.reduce((acc, e) => acc + (getReviewDates(e)?.length || 0), 0);
  const errorsByType = ['conceitual','distração','interpretação','outro'].map(type => ({
    type,
    count: allErrors.filter(e => getErrorType(e) === type).length
  }));
  const errorsBySubject = allSubjects.map(subject => ({
    subject,
    count: allErrors.filter(e => getErrorSubjectId(e) === subject.id).length
  })).sort((a,b)=>b.count-a.count);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="text-blue-400" size={24} />
        <h2 className="text-xl font-semibold text-white">Relatórios de Desempenho</h2>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',borderRadius:'0.7rem'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Tarefas</p>
              <p className="text-2xl font-bold text-white">{totalTasks}</p>
            </div>
            <div>
              <BarChart3 className="text-blue-400" size={24} />
            </div>
          </div>
        </div>
        <div className="p-4" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',borderRadius:'0.7rem'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tarefas Concluídas</p>
              <p className="text-2xl font-bold text-green-400">{completedTasks}</p>
            </div>
            <div>
              <CheckCircle className="text-green-400" size={24} />
            </div>
          </div>
        </div>
        <div className="p-4" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',borderRadius:'0.7rem'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Taxa de Conclusão</p>
              <p className="text-2xl font-bold text-blue-400">{completionRate}%</p>
            </div>
            <div>
              <TrendingUp className="text-blue-400" size={24} />
            </div>
          </div>
        </div>
        <div className="p-4" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',borderRadius:'0.7rem'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tarefas Atrasadas</p>
              <p className="text-2xl font-bold text-red-400">{overdueTasks}</p>
            </div>
            <div>
              <Clock className="text-red-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Resumo de revisões */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',borderRadius:'0.7rem'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Flashcards Prontos</p>
              <p className="text-2xl font-bold text-green-400">
                {flashcardReviewStats.reduce((acc, stat) => acc + stat.ready, 0)}
              </p>
            </div>
            <div>
              <BookOpen className="text-green-400" size={24} />
            </div>
          </div>
        </div>
        <div className="p-4" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',borderRadius:'0.7rem'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Erros Prontos</p>
              <p className="text-2xl font-bold text-yellow-400">
                {errorReviewStats.reduce((acc, stat) => acc + stat.ready, 0)}
              </p>
            </div>
            <div>
              <Settings className="text-yellow-400" size={24} />
            </div>
          </div>
        </div>
        <div className="p-4" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',borderRadius:'0.7rem'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Pronto</p>
              <p className="text-2xl font-bold text-blue-400">
                {flashcardReviewStats.reduce((acc, stat) => acc + stat.ready, 0) + 
                 errorReviewStats.reduce((acc, stat) => acc + stat.ready, 0)}
              </p>
            </div>
            <div>
              <BarChart3 className="text-blue-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas por matéria */}
      <div className="p-6" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',borderRadius:'0.7rem',marginTop:32}}>
        <h3 className="text-lg font-semibold text-white mb-4">Desempenho por Matéria</h3>
        {tasksBySubject.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400">Nenhuma tarefa encontrada para gerar estatísticas</div>
          </div>
        ) :
          <div className="space-y-4">
            {tasksBySubject.map(({ subject, total, completed, rate }) => (
              <div key={subject.id} className="flex items-center justify-between p-4" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',borderRadius:'0.7rem'}}>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }} />
                  <div>
                    <p className="font-medium text-white">{subject.name}</p>
                    <p className="text-sm text-gray-400">{completed}/{total} tarefas concluídas</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-white">{rate}%</p>
                    <p className="text-sm text-gray-400">Taxa de conclusão</p>
                  </div>
                  <div className="w-24" style={{background:'var(--color-border)',borderRadius:'999px',height:'0.5rem'}}>
                    <div
                      style={{height:'0.5rem',borderRadius:'999px',width:`${rate}%`,background:subject.color,transition:'width 0.3s'}}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      </div>

      {/* Tempo de estudo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',borderRadius:'0.7rem'}}>
          <h3 className="text-lg font-semibold text-white mb-4">Tempo de Estudo</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Tempo Total Planejado:</span>
              <span className="text-white font-semibold">{formatTime(totalStudyTime)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Tempo Concluído:</span>
              <span className="text-green-400 font-semibold">{formatTime(completedStudyTime)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Tempo Restante:</span>
              <span className="text-yellow-400 font-semibold">{formatTime(totalStudyTime - completedStudyTime)}</span>
            </div>
          </div>
        </div>

        <div className="p-6" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',borderRadius:'0.7rem'}}>
          <h3 className="text-lg font-semibold text-white mb-4">Status das Tarefas</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{background:'var(--color-border)'}}></div>
                <span className="text-gray-300">Concluídas</span>
              </div>
              <span className="text-white font-semibold">{completedTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{background:'var(--color-border)'}}></div>
                <span className="text-gray-300">Em Andamento</span>
              </div>
              <span className="text-white font-semibold">{inProgressTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{background:'var(--color-border)'}}></div>
                <span className="text-gray-300">Pendentes</span>
              </div>
              <span className="text-white font-semibold">{pendingTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{background:'var(--color-border)'}}></div>
                <span className="text-gray-300">Atrasadas</span>
              </div>
              <span className="text-white font-semibold">{overdueTasks}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Relatório de flashcards */}
      {flashcardStats.length > 0 && (
        <div className="p-6 mt-8" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',borderRadius:'0.7rem'}}>
          <h3 className="text-lg font-semibold text-white mb-4">Desempenho em Flashcards</h3>
          <div className="space-y-4">
            {flashcardStats.map(({ subject, correct, wrong }) => (
              <div key={subject.id} className="flex items-center justify-between p-4" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',borderRadius:'0.7rem'}}>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }} />
                  <div>
                    <p className="font-medium text-white">{subject.name}</p>
                    <p className="text-sm text-gray-400">{correct} acertos / {wrong} erros</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-400">{correct}</p>
                    <p className="text-sm text-gray-400">Acertos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-red-400">{wrong}</p>
                    <p className="text-sm text-gray-400">Erros</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estatísticas de revisão dos flashcards */}
      {flashcardReviewStats.length > 0 && (
        <div className="p-6 mt-8" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',borderRadius:'0.7rem'}}>
          <h3 className="text-lg font-semibold text-white mb-4">Status de Revisão dos Flashcards</h3>
          <div className="space-y-4">
            {flashcardReviewStats.map(({ subject, total, ready, overdue, nextReviews }) => (
              <div key={subject.id} className="p-4" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',borderRadius:'0.7rem'}}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }} />
                    <div>
                      <p className="font-medium text-white">{subject.name}</p>
                      <p className="text-sm text-gray-400">Total: {total} cards</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-400">{ready}</p>
                      <p className="text-sm text-gray-400">Prontos</p>
                    </div>
                    {overdue > 0 && (
                      <div className="text-right">
                        <p className="text-lg font-semibold text-red-400">{overdue}</p>
                        <p className="text-sm text-gray-400">Atrasados</p>
                      </div>
                    )}
                  </div>
                </div>
                {nextReviews.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">Próximas revisões:</p>
                    <div className="space-y-1">
                      {nextReviews.map((card, index) => (
                        <div key={index} className="text-xs text-gray-300">
                          {formatNextReviewDate(getNextReview(card))} - {card.front?.substring(0, 30)}...
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estatísticas de revisão do caderno de erros */}
      {errorReviewStats.length > 0 && (
        <div className="p-6 mt-8" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',borderRadius:'0.7rem'}}>
          <h3 className="text-lg font-semibold text-white mb-4">Status de Revisão do Caderno de Erros</h3>
          <div className="space-y-4">
            {errorReviewStats.map(({ subject, total, ready, overdue, nextReviews }) => (
              <div key={subject.id} className="p-4" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',borderRadius:'0.7rem'}}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }} />
                    <div>
                      <p className="font-medium text-white">{subject.name}</p>
                      <p className="text-sm text-gray-400">Total: {total} erros</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-400">{ready}</p>
                      <p className="text-sm text-gray-400">Prontos</p>
                    </div>
                    {overdue > 0 && (
                      <div className="text-right">
                        <p className="text-lg font-semibold text-red-400">{overdue}</p>
                        <p className="text-sm text-gray-400">Atrasados</p>
                      </div>
                    )}
                  </div>
                </div>
                                 {nextReviews.length > 0 && (
                   <div className="mt-3 pt-3 border-t border-gray-700">
                     <p className="text-sm text-gray-400 mb-2">Próximas revisões:</p>
                     <div className="space-y-1">
                       {nextReviews.map((error, index) => (
                         <div key={index} className="text-xs text-gray-300">
                           {formatNextReviewDate(error.nextReviewDate)} - {error.content?.substring(0, 30)}...
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estatísticas do Caderno de Erros */}
      <div className="p-6" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',borderRadius:'0.7rem',marginTop:32}}>
        <h3 className="text-lg font-semibold text-white mb-4">Caderno de Erros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',borderRadius:'0.7rem'}}>
            <div className="text-gray-400 text-sm">Total de Erros</div>
            <div className="text-2xl font-bold text-red-400">{totalErrors}</div>
          </div>
          <div className="p-4" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',borderRadius:'0.7rem'}}>
            <div className="text-gray-400 text-sm">Total de Revisões de Erros</div>
            <div className="text-2xl font-bold text-blue-400">{totalErrorReviews}</div>
          </div>
          {errorsByType.map(t => (
            <div key={t.type} className="p-4" style={{background:'var(--color-surface)',border:'1.5px solid var(--color-border)',borderRadius:'0.7rem'}}>
              <div className="text-gray-400 text-sm">{t.type.charAt(0).toUpperCase()+t.type.slice(1)}</div>
              <div className="text-2xl font-bold text-white">{t.count}</div>
            </div>
          ))}
        </div>
        <div className="mb-4">
          <h4 className="text-white font-semibold mb-2">Ranking de Matérias com Mais Erros</h4>
          <ol className="list-decimal ml-6 text-gray-300">
            {errorsBySubject.filter(e=>e.count>0).map((e)=>(
              <li key={e.subject.id}><span style={{color:e.subject.color,fontWeight:600}}>{e.subject.name}</span>: {e.count} erro(s)</li>
            ))}
            {errorsBySubject.every(e=>e.count===0) && <li>Nenhum erro registrado.</li>}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 