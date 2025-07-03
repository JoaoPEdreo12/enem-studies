
-- Script para configurar o banco de dados do ENEM Studies no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela de perfis de usuário (estende o auth.users do Supabase)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_date DATE,
  exam_year INTEGER,
  target_exam TEXT,
  has_preparatory_course BOOLEAN DEFAULT FALSE,
  preparatory_course TEXT,
  current_grade TEXT,
  study_goal TEXT,
  previous_experience TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- 2. Criar tabela de matérias
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('baixa', 'média', 'alta')),
  category TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Criar tabela de tarefas
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE,
  duration INTEGER DEFAULT 0, -- em minutos
  status TEXT CHECK (status IN ('pendente', 'em progresso', 'concluída', 'atrasada')) DEFAULT 'pendente',
  priority TEXT CHECK (priority IN ('baixa', 'média', 'alta')) DEFAULT 'média',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Criar tabela de blocos de estudo
CREATE TABLE IF NOT EXISTS study_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = domingo
  start_time TIME,
  end_time TIME,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Criar tabela de sessões de estudo
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  date DATE,
  duration INTEGER, -- em minutos
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Criar tabela de flashcards
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  content TEXT,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  correct_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  next_review DATE,
  interval_days INTEGER DEFAULT 1,
  last_difficulty INTEGER CHECK (last_difficulty >= 1 AND last_difficulty <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Criar tabela de caderno de erros
CREATE TABLE IF NOT EXISTS error_notebook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  question TEXT NOT NULL,
  wrong_answer TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  insight TEXT,
  error_type TEXT CHECK (error_type IN ('conceitual', 'cálculo', 'interpretação', 'distração', 'tempo')),
  date DATE,
  review_dates DATE[],
  last_reviewed DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Criar tabela da jornada ENEM
CREATE TABLE IF NOT EXISTS enem_journey (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  area TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT CHECK (status IN ('não iniciado', 'em progresso', 'revisando', 'dominado')) DEFAULT 'não iniciado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, area, content)
);

-- 9. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Criar triggers para atualizar updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_blocks_updated_at BEFORE UPDATE ON study_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at BEFORE UPDATE ON flashcards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_error_notebook_updated_at BEFORE UPDATE ON error_notebook
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enem_journey_updated_at BEFORE UPDATE ON enem_journey
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Configurar RLS (Row Level Security) para segurança
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_notebook ENABLE ROW LEVEL SECURITY;
ALTER TABLE enem_journey ENABLE ROW LEVEL SECURITY;

-- 12. Criar políticas RLS para que usuários só vejam seus próprios dados
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subjects" ON subjects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own study_blocks" ON study_blocks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own study_sessions" ON study_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own flashcards" ON flashcards
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own error_notebook" ON error_notebook
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own enem_journey" ON enem_journey
  FOR ALL USING (auth.uid() = user_id);

-- 13. Criar índices para melhor performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_subjects_user_id ON subjects(user_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_subject_id ON tasks(subject_id);
CREATE INDEX idx_tasks_date ON tasks(date);
CREATE INDEX idx_study_blocks_user_id ON study_blocks(user_id);
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX idx_flashcards_next_review ON flashcards(next_review);
CREATE INDEX idx_error_notebook_user_id ON error_notebook(user_id);
CREATE INDEX idx_enem_journey_user_id ON enem_journey(user_id);
CREATE INDEX idx_enem_journey_area ON enem_journey(area);

-- 14. Inserir dados iniciais de exemplo (opcional)
-- Esta função será executada quando um novo usuário se registrar
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente quando usuário se registra
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 15. Função para obter estatísticas do usuário
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_subjects', (SELECT COUNT(*) FROM subjects WHERE user_id = user_uuid),
    'total_tasks', (SELECT COUNT(*) FROM tasks WHERE user_id = user_uuid),
    'completed_tasks', (SELECT COUNT(*) FROM tasks WHERE user_id = user_uuid AND status = 'concluída'),
    'total_flashcards', (SELECT COUNT(*) FROM flashcards WHERE user_id = user_uuid),
    'total_errors', (SELECT COUNT(*) FROM error_notebook WHERE user_id = user_uuid),
    'enem_progress', (SELECT COUNT(*) FROM enem_journey WHERE user_id = user_uuid AND status = 'dominado')
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários para documentação
COMMENT ON TABLE user_profiles IS 'Perfis estendidos dos usuários com informações do vestibular';
COMMENT ON TABLE subjects IS 'Matérias de estudo dos usuários';
COMMENT ON TABLE tasks IS 'Tarefas e atividades de estudo';
COMMENT ON TABLE study_blocks IS 'Blocos de horário reservados para estudo';
COMMENT ON TABLE study_sessions IS 'Registros de sessões de estudo realizadas';
COMMENT ON TABLE flashcards IS 'Cartões de memorização para revisão espaçada';
COMMENT ON TABLE error_notebook IS 'Caderno de erros para análise e revisão';
COMMENT ON TABLE enem_journey IS 'Progresso na jornada de conteúdos do ENEM';
