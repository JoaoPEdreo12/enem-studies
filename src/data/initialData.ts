import type { AppData } from '../types';

export const initialData: AppData & { flashcards?: any[] } = {
  subjects: [
    {
      id: '1',
      name: 'Matemática',
      priority: 'alta',
      category: 'Ciências Exatas',
      color: '#3B82F6'
    },
    {
      id: '2',
      name: 'Português',
      priority: 'alta',
      category: 'Linguagens',
      color: '#EF4444'
    },
    {
      id: '3',
      name: 'História',
      priority: 'média',
      category: 'Ciências Humanas',
      color: '#10B981'
    },
    {
      id: '4',
      name: 'Geografia',
      priority: 'média',
      category: 'Ciências Humanas',
      color: '#F59E0B'
    },
    {
      id: '5',
      name: 'Biologia',
      priority: 'média',
      category: 'Ciências da Natureza',
      color: '#8B5CF6'
    },
    {
      id: '6',
      name: 'Física',
      priority: 'alta',
      category: 'Ciências da Natureza',
      color: '#EC4899'
    },
    {
      id: '7',
      name: 'Química',
      priority: 'média',
      category: 'Ciências da Natureza',
      color: '#06B6D4'
    },
    {
      id: '8',
      name: 'Filosofia',
      priority: 'baixa',
      category: 'Ciências Humanas',
      color: '#84CC16'
    }
  ],
  tasks: [],
  studyBlocks: [],
  studySessions: [],
  flashcards: []
}; 