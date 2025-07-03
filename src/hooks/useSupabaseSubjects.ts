import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export function useSupabaseSubjects(userId: string | null) {
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setSubjects(data || [])
        setLoading(false)
      })
  }, [userId])

  const addSubject = async (subject: Omit<any, 'id'>) => {
    setLoading(true)
    if (!userId) {
      setError('Usuário não autenticado');
      setLoading(false);
      return { error: { message: 'Usuário não autenticado' } };
    }
    console.log('user.id do Supabase:', userId);
    const payload = { ...subject, user_id: userId };
    console.log('Tentando criar matéria no Supabase:', payload);
    const { data, error } = await supabase
      .from('subjects')
      .insert([payload])
      .select()
    if (error) {
      setError(error.message)
      setLoading(false)
      return { error }
    } else {
      setSubjects(prev => [...prev, ...(data || [])])
      setLoading(false)
      return { data }
    }
  }

  const updateSubject = async (id: string, updates: Partial<any>) => {
    setLoading(true)
    const { error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', id)
      .select()
    if (error) setError(error.message)
    else setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
    setLoading(false)
  }

  const deleteSubject = async (id: string) => {
    setLoading(true)
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id)
    if (error) setError(error.message)
    else setSubjects(prev => prev.filter(s => s.id !== id))
    setLoading(false)
  }

  return { subjects, loading, error, addSubject, updateSubject, deleteSubject }
} 