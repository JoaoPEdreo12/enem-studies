import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export function useSupabaseErrorNotebook(userId: string | null) {
  const [errors, setErrors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    supabase
      .from('error_notebook')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setErrors(data || [])
        setLoading(false)
      })
  }, [userId])

  const addError = async (errorNote: Omit<any, 'id'>) => {
    setLoading(true)
    const dbError = {
      subject_id: errorNote.subjectId,
      content: errorNote.content,
      question: errorNote.question,
      wrong_answer: errorNote.wrongAnswer,
      correct_answer: errorNote.correctAnswer,
      insight: errorNote.insight,
      error_type: errorNote.errorType,
      date: errorNote.date,
      review_dates: errorNote.reviewDates,
      last_reviewed: errorNote.lastReviewed,
      user_id: userId
    };
    const { data, error } = await supabase
      .from('error_notebook')
      .insert([dbError])
      .select()
    if (error) setError(error.message)
    else setErrors(prev => [...prev, ...(data || [])])
    setLoading(false)
  }

  const updateError = async (id: string, updates: Partial<any>) => {
    setLoading(true)
    const dbUpdates: any = {};
    if (updates.subjectId !== undefined) dbUpdates.subject_id = updates.subjectId;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.question !== undefined) dbUpdates.question = updates.question;
    if (updates.wrongAnswer !== undefined) dbUpdates.wrong_answer = updates.wrongAnswer;
    if (updates.correctAnswer !== undefined) dbUpdates.correct_answer = updates.correctAnswer;
    if (updates.insight !== undefined) dbUpdates.insight = updates.insight;
    if (updates.errorType !== undefined) dbUpdates.error_type = updates.errorType;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.reviewDates !== undefined) dbUpdates.review_dates = updates.reviewDates;
    if (updates.lastReviewed !== undefined) dbUpdates.last_reviewed = updates.lastReviewed;
    const { error } = await supabase
      .from('error_notebook')
      .update(dbUpdates)
      .eq('id', id)
      .select()
    if (error) setError(error.message)
    else setErrors(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
    setLoading(false)
  }

  const deleteError = async (id: string) => {
    setLoading(true)
    const { error } = await supabase
      .from('error_notebook')
      .delete()
      .eq('id', id)
    if (error) setError(error.message)
    else setErrors(prev => prev.filter(e => e.id !== id))
    setLoading(false)
  }

  return { errors, loading, error, addError, updateError, deleteError }
} 