import { useState, useEffect, useCallback } from 'react'
import { Plus, BookOpen, Calendar, BarChart3, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import TaskBoard from './components/TaskBoard'
import SubjectManager from './components/SubjectManager'
import StudyCalendar from './components/StudyCalendar'
import Analytics from './components/Analytics'
import TaskForm from './components/TaskForm'
import SubjectForm from './components/SubjectForm'
import FlashCardManager from './components/FlashCardManager'
import Review from './components/Review'
import ErrorNotebook from './components/ErrorNotebook'
import { supabase } from './supabaseClient'
import Login from './components/Login'
import Register from './components/Register'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useSupabaseTasks } from './hooks/useSupabaseTasks'
import { useSupabaseSubjects } from './hooks/useSupabaseSubjects'
import { useSupabaseFlashcards } from './hooks/useSupabaseFlashcards'
import { useSupabaseErrorNotebook } from './hooks/useSupabaseErrorNotebook'
import type { Task, Subject } from './types'

// Tipos de views possíveis no dashboard
const NAV_ITEMS = [
  { id: 'board', label: 'Quadro', icon: BookOpen },
  { id: 'subjects', label: 'Matérias', icon: Settings },
  { id: 'calendar', label: 'Cronograma', icon: Calendar },
  { id: 'analytics', label: 'Relatórios', icon: BarChart3 },
  { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
  { id: 'review', label: 'Revisão', icon: BarChart3 },
  { id: 'errors', label: 'Caderno de Erros', icon: Settings },
]

type View = typeof NAV_ITEMS[number]['id']

export default function App() {
  // Estados globais do app
  const [currentView, setCurrentView] = useState<View>('board')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showSubjectForm, setShowSubjectForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [reviewSubject, setReviewSubject] = useState('')
  const [user, setUser] = useState<any>(null)
  const [menuCollapsed, setMenuCollapsed] = useState(false)

  // Hooks customizados para dados do Supabase
  const { tasks, addTask, updateTask, deleteTask } = useSupabaseTasks(user?.id || null)
  const { subjects, addSubject, updateSubject, deleteSubject } = useSupabaseSubjects(user?.id || null)
  const { flashcards, addFlashcard, updateFlashcard, deleteFlashcard } = useSupabaseFlashcards(user?.id || null)
  const { errors, addError, updateError, deleteError } = useSupabaseErrorNotebook(user?.id || null)

  // Autenticação: mantém usuário logado e escuta mudanças
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    return () => { listener?.subscription.unsubscribe() }
  }, [])

  // Alterna status da tarefa (concluída/pendente)
  function handleToggleComplete(task: Task) {
    const newStatus = task.status === 'concluída' ? 'pendente' : 'concluída'
    updateTask(task.id, { status: newStatus })
  }

  // Abre modal de edição de tarefa
  function handleEditTask(task: Task) {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  // Renderiza o conteúdo principal conforme a view selecionada
  function renderView() {
    switch (currentView) {
      case 'board':
        return <TaskBoard tasks={tasks} subjects={subjects} onEdit={handleEditTask} onDelete={deleteTask} onToggleComplete={handleToggleComplete} />
      case 'subjects':
        return <SubjectManager subjects={subjects} onEdit={setEditingSubject} onDelete={deleteSubject} addSubject={addSubject} />
      case 'calendar':
        return <StudyCalendar tasks={tasks} subjects={subjects} />
      case 'analytics':
        return <Analytics />
      case 'flashcards':
        return <FlashCardManager flashcards={flashcards} addFlashcard={addFlashcard} updateFlashcard={updateFlashcard} deleteFlashcard={deleteFlashcard} subjects={subjects} />
      case 'review':
        return <Review spacedFlashcards={flashcards} setFlashcards={addFlashcard} subjects={subjects} reviewSubject={reviewSubject} setReviewSubject={setReviewSubject} />
      case 'errors':
        return <ErrorNotebook errors={errors} addError={addError} updateError={updateError} deleteError={deleteError} subjects={subjects} />
      default:
        return null
    }
  }

  // Logout do usuário
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  // Se não estiver logado, mostra rotas de autenticação
  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    )
  }

  // Layout principal do dashboard
  return (
    <Router>
      <div style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
        {/* Sidebar/Menu lateral */}
        <nav className={`nav${menuCollapsed ? ' collapsed' : ''}`} style={{position: 'relative', zIndex: 41}}>
          {/* Botão de recolher/expandir menu */}
          <button
            className="collapse-menu-btn"
            onClick={() => setMenuCollapsed(!menuCollapsed)}
            aria-label={menuCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {menuCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>
          {/* Itens do menu (só aparecem se não estiver recolhido) */}
          {!menuCollapsed && NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={`nav-btn transition${currentView === item.id ? ' active' : ''}`}
              >
                <Icon size={18} style={{marginRight: 6, marginBottom: -3}} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Conteúdo principal (header + página) */}
        <div style={{flex: 1, minWidth: 0}}>
          {/* Header fixo no topo */}
          <header className="header">
            <h1 className="header-title">ENEM Studies</h1>
            <div className="header-actions">
              <button onClick={() => setShowTaskForm(true)} className="btn transition">
                <Plus size={18} style={{marginRight: 6}} /> Nova Tarefa
              </button>
              <button onClick={() => setShowSubjectForm(true)} className="btn transition" style={{background:'var(--color-surface-alt)', color:'var(--color-text)', border:'1px solid var(--color-border)'}}>
                <Plus size={18} style={{marginRight: 6}} /> Nova Matéria
              </button>
              <button onClick={handleLogout} className="btn transition" style={{background:'#ef4444', color:'#fff', marginLeft: 12}}>
                Sair
              </button>
            </div>
          </header>

          {/* Área central do dashboard */}
          <main className="main-content" style={{marginLeft: 0}}>
            <div className="fade-in">
              {renderView()}
            </div>
          </main>
        </div>

        {/* Menu mobile fixo (aparece só em telas pequenas) */}
        <nav className="mobile-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={`nav-btn transition${currentView === item.id ? ' active' : ''}`}
              >
                <Icon size={22} />
                <span style={{fontSize: 12}}>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Modais de tarefa e matéria */}
        {showTaskForm && (
          <TaskForm
            subjects={subjects}
            task={editingTask}
            onSubmit={editingTask ? (updates) => { updateTask(editingTask.id, updates); setShowTaskForm(false); setEditingTask(null); } : (task) => { addTask(task); setShowTaskForm(false); }}
            onClose={() => { setShowTaskForm(false); setEditingTask(null) }}
          />
        )}
        {showSubjectForm && (
          <SubjectForm
            subject={editingSubject}
            onSubmit={editingSubject ? (updates) => updateSubject(editingSubject.id, updates) : addSubject}
            onClose={() => { setShowSubjectForm(false); setEditingSubject(null) }}
          />
        )}
      </div>
    </Router>
  )
}
