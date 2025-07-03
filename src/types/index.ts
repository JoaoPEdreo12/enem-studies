export interface Subject {
  id: string;
  name: string;
  priority: 'baixa' | 'média' | 'alta';
  category: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  date: string;
  duration: number; // em minutos
  status: 'pendente' | 'em_andamento' | 'concluída';
  createdAt: string;
  completedAt?: string;
}

export interface StudyBlock {
  id: string;
  subjectId: string;
  dayOfWeek: number; // 0-6 (domingo-sábado)
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface StudySession {
  id: string;
  subjectId: string;
  date: string;
  duration: number;
  notes?: string;
}

export interface AppData {
  subjects: Subject[];
  tasks: Task[];
  studyBlocks: StudyBlock[];
  studySessions: StudySession[];
}

export interface FlashCardData {
  id: string;
  subjectId: string;
  content: string;
  front: string;
  back: string;
  correctCount?: number;
  wrongCount?: number;
  nextReview?: string; // ISO date
  intervalDays?: number;
  lastDifficulty?: 'easy' | 'medium' | 'hard' | 'veryHard';
}

export interface ErrorNote {
  id: string;
  subjectId: string;
  content: string; // Assunto/conteúdo
  question: string; // Descrição da questão/problema
  wrongAnswer: string; // Resposta errada e explicação do erro
  correctAnswer: string; // Resposta correta e explicação
  insight: string; // Dica para lembrar
  errorType: 'conceitual' | 'distração' | 'interpretação' | 'outro';
  date: string; // Data do erro
  reviewDates: string[]; // Datas de revisão
  lastReviewed?: string; // Última revisão
} 