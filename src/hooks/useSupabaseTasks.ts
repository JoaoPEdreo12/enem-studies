import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export function useSupabaseTasks(userId: string | null) {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setTasks(data || [])
        setLoading(false)
      })
  }, [userId])

  const addTask = async (task: Omit<any, 'id'>) => {
    setLoading(true)
    const dbTask = {
      title: task.title,
      description: task.description,
      subject_id: task.subjectId,
      due_date: task.date,
      duration: task.duration,
      completed: task.status === 'concluída',
      status: task.status,
      user_id: userId
    };
    const { data, error } = await supabase
      .from('tasks')
      .insert([dbTask])
      .select()
    if (error) setError(error.message)
    else setTasks(prev => [...prev, ...(data || [])])
    setLoading(false)
  }

  const updateTask = async (id: string, updates: Partial<any>) => {
    setLoading(true)
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.subjectId !== undefined) dbUpdates.subject_id = updates.subjectId;
    if (updates.date !== undefined) dbUpdates.due_date = updates.date;
    if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
    if (updates.status !== undefined) {
      dbUpdates.completed = updates.status === 'concluída';
      dbUpdates.status = updates.status;
    }
    const { error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id)
      .select()
    if (error) setError(error.message)
    else setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
    setLoading(false)
  }

  const deleteTask = async (id: string) => {
    setLoading(true)
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    if (error) setError(error.message)
    else setTasks(prev => prev.filter(t => t.id !== id))
    setLoading(false)
  }

  return { tasks, loading, error, addTask, updateTask, deleteTask }
} 