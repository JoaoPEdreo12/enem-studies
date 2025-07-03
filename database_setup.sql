
-- Script para configurar o banco de dados do ENEM Studies no Supabase
-- Execute este script no SQL Editor do Supabase
-- Usa apenas o sistema de autenticação nativo do Supabase (auth.users)

-- 1. Estender a tabela auth.users com metadados personalizados
-- Adicionar colunas de perfil diretamente no raw_user_meta_data
-- Isso é feito automaticamente pelo Supabase Auth quando passamos dados no signup

-- 2. Criar tabela de perfis estendidos (opcional para dados mais complexos)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  phone TEXT,
  birth_date DATE,
  exam_year INTEGER,
  target_exam TEXT,
  has_preparatory_course BOOLEAN DEFAULT FALSE,
  preparatory_course TEXT,
  current_grade TEXT,
  study_goal TEXT,
  previous_experience TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de matérias
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

-- 4. Criar tabela de tarefas
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

-- 5. Criar tabela de blocos de estudo
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

-- 6. Criar tabela de sessões de estudo
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

-- 7. Criar tabela de flashcards
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

-- 8. Criar tabela de caderno de erros
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

-- 9. Criar tabela da jornada ENEM
CREATE TABLE IF NOT EXISTS enem_journey (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  area TEXT NOT NULL,
  content TEXT NOT NULL,
  percentage DECIMAL(5,2) DEFAULT 0, -- porcentagem que cai no ENEM
  difficulty TEXT CHECK (difficulty IN ('fácil', 'médio', 'difícil')) DEFAULT 'médio',
  status TEXT CHECK (status IN ('não iniciado', 'em progresso', 'revisando', 'dominado')) DEFAULT 'não iniciado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, area, content)
);

-- 10. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Criar triggers para atualizar updated_at
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

-- 12. Configurar RLS (Row Level Security) para segurança
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_notebook ENABLE ROW LEVEL SECURITY;
ALTER TABLE enem_journey ENABLE ROW LEVEL SECURITY;

-- 13. Criar políticas RLS para que usuários só vejam seus próprios dados
CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own subjects" ON subjects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own study_blocks" ON study_blocks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own study_sessions" ON study_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own flashcards" ON flashcards
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own error_notebook" ON error_notebook
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own enem_journey" ON enem_journey
  FOR ALL USING (auth.uid() = user_id);

-- 14. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_subject_id ON tasks(subject_id);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_study_blocks_user_id ON study_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON flashcards(next_review);
CREATE INDEX IF NOT EXISTS idx_error_notebook_user_id ON error_notebook(user_id);
CREATE INDEX IF NOT EXISTS idx_enem_journey_user_id ON enem_journey(user_id);
CREATE INDEX IF NOT EXISTS idx_enem_journey_area ON enem_journey(area);
CREATE INDEX IF NOT EXISTS idx_enem_journey_status ON enem_journey(status);

-- 15. Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Inserir conteúdos iniciais da jornada ENEM para o novo usuário
  INSERT INTO enem_journey (user_id, area, content, percentage, difficulty) VALUES
  -- Matemática
  (NEW.id, 'Matemática', 'Funções do 1º grau', 15.2, 'fácil'),
  (NEW.id, 'Matemática', 'Funções do 2º grau', 12.8, 'médio'),
  (NEW.id, 'Matemática', 'Geometria Plana', 18.5, 'médio'),
  (NEW.id, 'Matemática', 'Geometria Espacial', 10.3, 'difícil'),
  (NEW.id, 'Matemática', 'Estatística e Probabilidade', 16.7, 'médio'),
  (NEW.id, 'Matemática', 'Trigonometria', 8.9, 'difícil'),
  (NEW.id, 'Matemática', 'Logaritmos', 7.4, 'difícil'),
  (NEW.id, 'Matemática', 'Progressões', 9.2, 'médio'),
  
  -- Português
  (NEW.id, 'Linguagens', 'Interpretação de Texto', 25.3, 'fácil'),
  (NEW.id, 'Linguagens', 'Gramática', 18.7, 'médio'),
  (NEW.id, 'Linguagens', 'Literatura Brasileira', 15.1, 'médio'),
  (NEW.id, 'Linguagens', 'Figuras de Linguagem', 12.4, 'médio'),
  (NEW.id, 'Linguagens', 'Redação', 20.0, 'médio'),
  (NEW.id, 'Linguagens', 'Gêneros Textuais', 8.5, 'fácil'),
  
  -- Física
  (NEW.id, 'Ciências da Natureza', 'Mecânica', 22.1, 'médio'),
  (NEW.id, 'Ciências da Natureza', 'Termologia', 15.8, 'médio'),
  (NEW.id, 'Ciências da Natureza', 'Óptica', 12.3, 'médio'),
  (NEW.id, 'Ciências da Natureza', 'Ondulatória', 9.7, 'difícil'),
  (NEW.id, 'Ciências da Natureza', 'Eletromagnetismo', 18.9, 'difícil'),
  (NEW.id, 'Ciências da Natureza', 'Física Moderna', 6.2, 'difícil'),
  
  -- Química
  (NEW.id, 'Ciências da Natureza', 'Química Orgânica', 19.4, 'médio'),
  (NEW.id, 'Ciências da Natureza', 'Físico-Química', 16.8, 'difícil'),
  (NEW.id, 'Ciências da Natureza', 'Química Inorgânica', 14.2, 'médio'),
  (NEW.id, 'Ciências da Natureza', 'Química Geral', 13.6, 'fácil'),
  (NEW.id, 'Ciências da Natureza', 'Estequiometria', 11.9, 'médio'),
  (NEW.id, 'Ciências da Natureza', 'Radioatividade', 7.1, 'difícil'),
  
  -- Biologia
  (NEW.id, 'Ciências da Natureza', 'Ecologia', 17.3, 'fácil'),
  (NEW.id, 'Ciências da Natureza', 'Genética', 15.7, 'médio'),
  (NEW.id, 'Ciências da Natureza', 'Evolução', 13.2, 'médio'),
  (NEW.id, 'Ciências da Natureza', 'Citologia', 12.8, 'médio'),
  (NEW.id, 'Ciências da Natureza', 'Fisiologia Humana', 11.4, 'médio'),
  (NEW.id, 'Ciências da Natureza', 'Botânica', 9.6, 'difícil'),
  (NEW.id, 'Ciências da Natureza', 'Zoologia', 8.3, 'difícil'),
  
  -- História
  (NEW.id, 'Ciências Humanas', 'História do Brasil', 24.6, 'fácil'),
  (NEW.id, 'Ciências Humanas', 'História Geral', 18.9, 'médio'),
  (NEW.id, 'Ciências Humanas', 'Era Vargas', 12.7, 'médio'),
  (NEW.id, 'Ciências Humanas', 'República Velha', 10.8, 'médio'),
  (NEW.id, 'Ciências Humanas', 'Ditadura Militar', 9.4, 'médio'),
  (NEW.id, 'Ciências Humanas', 'Idade Contemporânea', 13.6, 'médio'),
  
  -- Geografia
  (NEW.id, 'Ciências Humanas', 'Geografia do Brasil', 21.3, 'fácil'),
  (NEW.id, 'Ciências Humanas', 'Geografia Física', 16.8, 'médio'),
  (NEW.id, 'Ciências Humanas', 'Geografia Humana', 15.2, 'médio'),
  (NEW.id, 'Ciências Humanas', 'Geopolítica', 12.9, 'médio'),
  (NEW.id, 'Ciências Humanas', 'Cartografia', 8.7, 'difícil'),
  (NEW.id, 'Ciências Humanas', 'Climatologia', 7.1, 'difícil'),
  
  -- Sociologia
  (NEW.id, 'Ciências Humanas', 'Sociologia Contemporânea', 14.6, 'médio'),
  (NEW.id, 'Ciências Humanas', 'Movimentos Sociais', 11.3, 'médio'),
  (NEW.id, 'Ciências Humanas', 'Cultura e Sociedade', 9.8, 'fácil'),
  (NEW.id, 'Ciências Humanas', 'Direitos Humanos', 8.4, 'fácil'),
  
  -- Filosofia
  (NEW.id, 'Ciências Humanas', 'Filosofia Moderna', 12.7, 'difícil'),
  (NEW.id, 'Ciências Humanas', 'Ética e Moral', 10.5, 'médio'),
  (NEW.id, 'Ciências Humanas', 'Filosofia Política', 9.2, 'médio'),
  (NEW.id, 'Ciências Humanas', 'Filosofia Antiga', 7.6, 'difícil');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Trigger para criar perfil automaticamente quando usuário se registra
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 17. Função para obter estatísticas do usuário
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
    'enem_progress', (SELECT COUNT(*) FROM enem_journey WHERE user_id = user_uuid AND status = 'dominado'),
    'completion_percentage', (
      SELECT ROUND(
        (COUNT(*) FILTER (WHERE status = 'dominado') * 100.0 / 
         NULLIF(COUNT(*), 0))::numeric, 2
      )
      FROM enem_journey WHERE user_id = user_uuid
    )
  ) INTO stats;

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 18. Função para obter progresso por área
CREATE OR REPLACE FUNCTION get_area_progress(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  progress JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'area', area,
      'total', total_count,
      'completed', completed_count,
      'percentage', ROUND((completed_count * 100.0 / total_count)::numeric, 2)
    )
  ) INTO progress
  FROM (
    SELECT 
      area,
      COUNT(*) as total_count,
      COUNT(*) FILTER (WHERE status = 'dominado') as completed_count
    FROM enem_journey 
    WHERE user_id = user_uuid
    GROUP BY area
  ) subquery;

  RETURN progress;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 19. View para dados do usuário (facilita consultas)
CREATE OR REPLACE VIEW user_dashboard AS
SELECT 
  u.id,
  u.email,
  u.created_at as user_created_at,
  up.full_name,
  up.exam_year,
  up.target_exam,
  up.current_grade,
  up.study_goal,
  get_user_stats(u.id) as stats,
  get_area_progress(u.id) as area_progress
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id;

-- Comentários para documentação
COMMENT ON TABLE user_profiles IS 'Perfis estendidos dos usuários integrados com auth.users do Supabase';
COMMENT ON TABLE subjects IS 'Matérias de estudo dos usuários';
COMMENT ON TABLE tasks IS 'Tarefas e atividades de estudo';
COMMENT ON TABLE study_blocks IS 'Blocos de horário reservados para estudo';
COMMENT ON TABLE study_sessions IS 'Registros de sessões de estudo realizadas';
COMMENT ON TABLE flashcards IS 'Cartões de memorização para revisão espaçada';
COMMENT ON TABLE error_notebook IS 'Caderno de erros para análise e revisão';
COMMENT ON TABLE enem_journey IS 'Progresso na jornada de conteúdos do ENEM com percentuais reais';
COMMENT ON FUNCTION handle_new_user() IS 'Função automática para criar perfil e dados iniciais quando usuário se registra';
COMMENT ON FUNCTION get_user_stats(UUID) IS 'Função para obter estatísticas completas do usuário';
COMMENT ON FUNCTION get_area_progress(UUID) IS 'Função para obter progresso por área do conhecimento';
COMMENT ON VIEW user_dashboard IS 'View consolidada com dados do usuário e estatísticas';

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Banco de dados do ENEM Studies configurado com sucesso!';
    RAISE NOTICE 'Integração completa com Supabase Auth realizada.';
    RAISE NOTICE 'Conteúdos da jornada ENEM com percentuais reais inseridos.';
END $$;
