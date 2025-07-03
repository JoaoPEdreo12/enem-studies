import { useMemo, useState } from 'react';
import type { FlashCardData, Subject } from '../types';
import FlashCard from './FlashCard';
import { addDays, isBefore, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../supabaseClient';

interface ReviewProps {
  spacedFlashcards: FlashCardData[];
  setFlashcards: (cards: FlashCardData[]) => void;
  subjects: Subject[];
  reviewSubject: string;
  setReviewSubject: (id: string) => void;
}

// Intervalos baseados na dificuldade
const difficultyIntervals = {
  easy: [1, 3, 7, 14, 30, 60],
  medium: [1, 2, 5, 10, 20, 40],
  hard: [1, 1, 3, 7, 14, 30],
  veryHard: [1, 1, 2, 5, 10, 20]
};

const Review = ({ spacedFlashcards, setFlashcards, subjects, reviewSubject, setReviewSubject }: ReviewProps) => {
  const now = new Date();
  const subjectList = subjects.filter(
    s => spacedFlashcards.some(
      f => f.subjectId === s.id || (f as any).subject_id === s.id
    )
  );

  // Filtrar flashcards prontos para revisão da matéria escolhida
  const reviewQueue = useMemo(() => {
    return spacedFlashcards
      .filter(f => f.subjectId === reviewSubject || (f as any).subject_id === reviewSubject)
      .filter(f => {
        const nextReview = f.nextReview || (f as any).next_review;
        if (!nextReview) return true; // Cards novos sempre aparecem
        const reviewDate = parseISO(nextReview);
        return isBefore(reviewDate, now) || reviewDate.toDateString() === now.toDateString();
      })
      .sort((a, b) => {
        const aNext = a.nextReview || (a as any).next_review;
        const bNext = b.nextReview || (b as any).next_review;
        if (!aNext && !bNext) return 0;
        if (!aNext) return -1;
        if (!bNext) return 1;
        return parseISO(aNext).getTime() - parseISO(bNext).getTime();
      });
  }, [spacedFlashcards, reviewSubject]);

  const [current, setCurrent] = useState(0);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [showNextReview, setShowNextReview] = useState(false);
  const [nextReviewDate, setNextReviewDate] = useState<string>('');

  const handleResult = async (difficulty: 'easy' | 'medium' | 'hard' | 'veryHard') => {
    const card = reviewQueue[current];
    if (!card) return;
    
    // Determinar se acertou baseado na dificuldade
    const isCorrect = difficulty === 'easy' || difficulty === 'medium';
    
    // Obter intervalos baseados na dificuldade
    const intervals = difficultyIntervals[difficulty];
    let currentInterval = card.intervalDays || 1;
    let intervalIndex = intervals.indexOf(currentInterval);
    
    if (intervalIndex === -1) intervalIndex = 0;
    
    // Ajustar intervalo baseado no resultado
    if (isCorrect) {
      intervalIndex = Math.min(intervalIndex + 1, intervals.length - 1);
    } else {
      intervalIndex = 0;
    }
    
    const newInterval = intervals[intervalIndex];
    const nextReview = addDays(now, newInterval);
    const nextReviewISO = nextReview.toISOString();
    
    // Formatar data para exibição
    const formattedDate = format(nextReview, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    setNextReviewDate(formattedDate);
    setShowNextReview(true);
    
    // Atualiza localmente
    setFlashcards(spacedFlashcards.map(f =>
      f.id === card.id
        ? { 
            ...f, 
            intervalDays: newInterval, 
            nextReview: nextReviewISO, 
            correctCount: (f.correctCount || 0) + (isCorrect ? 1 : 0), 
            wrongCount: (f.wrongCount || 0) + (isCorrect ? 0 : 1),
            lastDifficulty: difficulty
          }
        : f
    ));
    
    // Atualiza no Supabase
    await supabase.from('flashcards').update({
      interval_days: newInterval,
      next_review: nextReviewISO,
      correct_count: (card.correctCount || 0) + (isCorrect ? 1 : 0),
      wrong_count: (card.wrongCount || 0) + (isCorrect ? 0 : 1),
      last_difficulty: difficulty
    }).eq('id', card.id);
    
    // Aguardar 2 segundos antes de avançar
    setTimeout(() => {
      setShowNextReview(false);
      if (current + 1 < reviewQueue.length) {
        setCurrent(c => c + 1);
        setShowDifficulty(false);
      } else {
        // Revisão concluída
        setCurrent(0);
        setShowDifficulty(false);
      }
    }, 2000);
  };

  const handleCardFlip = () => {
    setShowDifficulty(true);
  };

  const getNextReviewInfo = (card: FlashCardData) => {
    if (!card.nextReview) return 'Primeira revisão';
    const reviewDate = parseISO(card.nextReview);
    const isOverdue = isBefore(reviewDate, now);
    const formattedDate = format(reviewDate, "dd 'de' MMMM", { locale: ptBR });
    
    if (isOverdue) {
      return `Atrasado desde ${formattedDate}`;
    }
    return `Próxima revisão: ${formattedDate}`;
  };

  return (
    <div style={{maxWidth:420,margin:'0 auto',padding:'2rem 0'}}>
      <h2 className="header-title" style={{fontSize:'1.5rem',textAlign:'center'}}>Revisão Espaçada</h2>
      <div style={{margin:'1.5rem 0',textAlign:'center'}}>
        <label style={{color:'var(--color-text-muted)',fontWeight:500,fontSize:'1.1rem'}}>Matéria: </label>
        <select value={reviewSubject} onChange={e => { setReviewSubject(e.target.value); setCurrent(0); setShowDifficulty(false); setShowNextReview(false); }}>
          <option value="">Selecione</option>
          {subjectList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      {reviewSubject && reviewQueue.length > 0 ? (
        <>
          <div style={{marginBottom:24}}>
            <FlashCard
              front={reviewQueue[current]?.front || ''}
              back={reviewQueue[current]?.back || ''}
              subjectColor={'#23232b'}
              onFlip={handleCardFlip}
            />
            {/* Informação da próxima revisão atual */}
            <div style={{textAlign:'center',marginTop:12,color:'#71717a',fontSize:'0.9rem'}}>
              {reviewQueue[current] && getNextReviewInfo(reviewQueue[current])}
            </div>
          </div>
          
          {/* Feedback de dificuldade */}
          {showDifficulty && (
            <div className="card scale-in" style={{marginTop:24,padding:24}}>
              <h3 style={{textAlign:'center',marginBottom:20,fontSize:'1.1rem',fontWeight:600}}>Como foi a dificuldade?</h3>
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <button 
                  className="btn btn-select transition" 
                  style={{justifyContent:'flex-start',padding:'12px 16px'}}
                  onClick={() => handleResult('easy')}
                >
                  <span style={{fontSize:'1.2rem',marginRight:12}}>😊</span>
                  Fácil - Lembrei facilmente
                </button>
                <button 
                  className="btn btn-add transition" 
                  style={{justifyContent:'flex-start',padding:'12px 16px'}}
                  onClick={() => handleResult('medium')}
                >
                  <span style={{fontSize:'1.2rem',marginRight:12}}>😐</span>
                  Médio - Lembrei com esforço
                </button>
                <button 
                  className="btn btn-select transition" 
                  style={{justifyContent:'flex-start',padding:'12px 16px'}}
                  onClick={() => handleResult('hard')}
                >
                  <span style={{fontSize:'1.2rem',marginRight:12}}>😰</span>
                  Difícil - Quase não lembrei
                </button>
                <button 
                  className="btn btn-remove transition" 
                  style={{justifyContent:'flex-start',padding:'12px 16px'}}
                  onClick={() => handleResult('veryHard')}
                >
                  <span style={{fontSize:'1.2rem',marginRight:12}}>😵</span>
                  Muito difícil - Não lembrei
                </button>
              </div>
            </div>
          )}

          {/* Confirmação da próxima revisão */}
          {showNextReview && (
            <div className="card scale-in" style={{marginTop:24,padding:24,textAlign:'center',background:'var(--color-success-light)'}}>
              <div style={{fontSize:'1.2rem',marginBottom:8,color:'var(--color-success)'}}>✅ Revisão registrada!</div>
              <div style={{color:'var(--color-text-muted)',fontSize:'1rem'}}>
                Próxima revisão: <strong style={{color:'var(--color-text)'}}>{nextReviewDate}</strong>
              </div>
            </div>
          )}
          
          <div style={{textAlign:'center',color:'#a1a1aa',fontSize:'1.05rem',marginTop:24}}>
            {current + 1} de {reviewQueue.length} flashcards para revisar
          </div>
        </>
      ) : reviewSubject ? (
        <div style={{textAlign:'center',color:'#a1a1aa',marginTop:32}}>Nenhum flashcard para revisar nesta matéria agora.</div>
      ) : (
        <div style={{textAlign:'center',color:'#a1a1aa',marginTop:32}}>Escolha uma matéria para revisar.</div>
      )}
    </div>
  );
};

export default Review; 