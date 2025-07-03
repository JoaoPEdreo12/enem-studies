
import { useState } from 'react';
import { BookOpen, Settings, Calendar, BarChart3, CreditCard, RotateCcw, AlertTriangle, Trophy, Menu, X } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import TaskBoard from './TaskBoard';
import SubjectManager from './SubjectManager';
import StudyCalendar from './StudyCalendar';
import Analytics from './Analytics';
import FlashCardManager from './FlashCardManager';
import Review from './Review';
import ErrorNotebook from './ErrorNotebook';
import JornadaEnem from './JornadaEnem';

const NAV_ITEMS = [
  { id: 'board', label: 'Quadro', icon: BookOpen, color: '#3B82F6' },
  { id: 'subjects', label: 'Matérias', icon: Settings, color: '#10B981' },
  { id: 'calendar', label: 'Cronograma', icon: Calendar, color: '#F59E0B' },
  { id: 'analytics', label: 'Relatórios', icon: BarChart3, color: '#8B5CF6' },
  { id: 'flashcards', label: 'Flashcards', icon: CreditCard, color: '#EF4444' },
  { id: 'review', label: 'Revisão', icon: RotateCcw, color: '#06B6D4' },
  { id: 'errors', label: 'Caderno de Erros', icon: AlertTriangle, color: '#F97316' },
  { id: 'jornada', label: 'Jornada ENEM', icon: Trophy, color: '#EC4899' },
];

export default function App({ user }: { user: any }) {
  const [currentView, setCurrentView] = useLocalStorage('current-view', 'jornada');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'board':
        return <TaskBoard user={user} />;
      case 'subjects':
        return <SubjectManager user={user} />;
      case 'calendar':
        return <StudyCalendar user={user} />;
      case 'analytics':
        return <Analytics user={user} />;
      case 'flashcards':
        return <FlashCardManager user={user} />;
      case 'review':
        return <Review user={user} />;
      case 'errors':
        return <ErrorNotebook user={user} />;
      case 'jornada':
        return <JornadaEnem user={user} />;
      default:
        return <JornadaEnem user={user} />;
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    setIsMobileMenuOpen(false); // Fechar menu mobile após seleção
  };

  return (
    <div className="app-container">
      {/* Header Mobile */}
      <div className="mobile-header">
        <div className="mobile-header-content">
          <div className="app-logo">
            <Trophy className="text-primary" size={24} />
            <span>ENEM Studies</span>
          </div>
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`nav-container ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="nav-header">
          <div className="app-logo desktop-only">
            <Trophy className="text-primary animate-pulse" size={28} />
            <span>ENEM Studies</span>
          </div>
          <div className="user-info">
            <div className="user-avatar">
              <span>{user?.user_metadata?.full_name?.charAt(0) || 'U'}</span>
            </div>
            <div className="user-details desktop-only">
              <span className="user-name">{user?.user_metadata?.full_name || 'Usuário'}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
        </div>

        <div className="nav-content">
          <div className="nav-tabs">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-tab ${currentView === item.id ? 'active' : ''}`}
                style={{
                  '--tab-color': item.color,
                  '--tab-color-light': `${item.color}20`
                } as React.CSSProperties}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {currentView === item.id && <div className="nav-tab-indicator" />}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div 
            className="mobile-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="view-container">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
