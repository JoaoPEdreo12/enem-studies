import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export function useSupabaseFlashcards(userId: string | null) {
  const [flashcards, setFlashcards] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setFlashcards(data || [])
        setLoading(false)
      })
  }, [userId])

  const addFlashcard = async (flashcard: Omit<any, 'id'>) => {
    setLoading(true)
    const dbFlashcard = {
      subject_id: flashcard.subjectId,
      content: flashcard.content,
      front: flashcard.front,
      back: flashcard.back,
      correct_count: flashcard.correctCount,
      wrong_count: flashcard.wrongCount,
      next_review: flashcard.nextReview,
      interval_days: flashcard.intervalDays,
      last_difficulty: flashcard.lastDifficulty,
      user_id: userId
    };
    const { data, error } = await supabase
      .from('flashcards')
      .insert([dbFlashcard])
      .select()
    if (error) setError(error.message)
    else setFlashcards(prev => [...prev, ...(data || [])])
    setLoading(false)
  }

  const updateFlashcard = async (id: string, updates: Partial<any>) => {
    setLoading(true)
    const dbUpdates: any = {};
    if (updates.subjectId !== undefined) dbUpdates.subject_id = updates.subjectId;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.front !== undefined) dbUpdates.front = updates.front;
    if (updates.back !== undefined) dbUpdates.back = updates.back;
    if (updates.correctCount !== undefined) dbUpdates.correct_count = updates.correctCount;
    if (updates.wrongCount !== undefined) dbUpdates.wrong_count = updates.wrongCount;
    if (updates.nextReview !== undefined) dbUpdates.next_review = updates.nextReview;
    if (updates.intervalDays !== undefined) dbUpdates.interval_days = updates.intervalDays;
    if (updates.lastDifficulty !== undefined) dbUpdates.last_difficulty = updates.lastDifficulty;
    const { error } = await supabase
      .from('flashcards')
      .update(dbUpdates)
      .eq('id', id)
      .select()
    if (error) setError(error.message)
    else setFlashcards(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f))
    setLoading(false)
  }

  const deleteFlashcard = async (id: string) => {
    setLoading(true)
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', id)
    if (error) setError(error.message)
    else setFlashcards(prev => prev.filter(f => f.id !== id))
    setLoading(false)
  }

  return { flashcards, loading, error, addFlashcard, updateFlashcard, deleteFlashcard }
} 