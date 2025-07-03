import { BookOpen, Settings, Calendar, BarChart3 } from 'lucide-react';
import JornadaEnem from './JornadaEnem';

const NAV_ITEMS = [
  { id: 'board', label: 'Quadro', icon: BookOpen },
  { id: 'subjects', label: 'Matérias', icon: Settings },
  { id: 'calendar', label: 'Cronograma', icon: Calendar },
  { id: 'analytics', label: 'Relatórios', icon: BarChart3 },
  { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
  { id: 'review', label: 'Revisão', icon: BarChart3 },
  { id: 'errors', label: 'Caderno de Erros', icon: Settings },
  { id: 'jornada', label: 'Jornada ENEM', icon: BarChart3 },
];

export default function App({ currentView, user }: { currentView: string, user: any }) {
  function renderView() {
    switch (currentView) {
      case 'jornada':
        return <JornadaEnem user={user} />;
      // outros cases...
      default:
        return null;
    }
  }
  return renderView();
} 