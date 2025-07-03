import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useSupabaseEnemJourney(userId: string | null) {
  const [journey, setJourney] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    supabase
      .from('enem_journey')
      .select('*')
      .eq('user_id', userId)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setJourney(data || []);
        setLoading(false);
      });
  }, [userId]);

  const updateStatus = async (area: string, content: string, status: string) => {
    setLoading(true);
    const existing = journey.find(j => j.area === area && j.content === content);
    if (existing) {
      const { error } = await supabase
        .from('enem_journey')
        .update({ status, last_update: new Date().toISOString() })
        .eq('id', existing.id);
      if (error) setError(error.message);
      else setJourney(journey => journey.map(j => j.id === existing.id ? { ...j, status } : j));
    } else {
      const { data, error } = await supabase
        .from('enem_journey')
        .insert({ user_id: userId, area, content, status })
        .select();
      if (error) setError(error.message);
      else setJourney(journey => [...journey, ...(data || [])]);
    }
    setLoading(false);
  };

  return { journey, loading, error, updateStatus };
} 