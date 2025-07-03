# 📚 ENEM Studies

Um aplicativo minimalista e moderno para organizar seus estudos para o ENEM, inspirado no design do Trello.

## ✨ Características

### 🗂️ Organização de Estudos
- **Cadastro de matérias** com prioridade e categoria
- **Criação de blocos de estudo** por dia e horário
- **Planejamento semanal/mensal** em formato de cronograma
- **Editor de tarefas** completo (título, descrição, data, duração, status)

### 📊 Relatórios de Desempenho
- **Gráficos de tarefas concluídas** por matéria
- **Frequência semanal e mensal** de estudos
- **Percentual de metas cumpridas**
- **Visualizações** como gráfico de barras, linha do tempo, calendário e radar

### 🎯 Funcionalidades Adicionais
- **Lembretes de tarefas pendentes**
- **Filtros** por disciplina, status e datas
- **Design limpo, intuitivo e mobile-friendly**
- **Armazenamento local** (não precisa de internet)

## 🚀 Como Usar

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd enem-studies
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto:
```bash
npm run dev
```

4. Abra o navegador em `http://localhost:5173`

### Primeiros Passos

1. **Adicione suas matérias**: Vá para a aba "Matérias" e clique em "Nova Matéria"
2. **Crie tarefas**: No "Quadro", clique em "Nova Tarefa" para adicionar atividades de estudo
3. **Organize seu cronograma**: Use a aba "Cronograma" para visualizar sua semana
4. **Acompanhe seu progresso**: Veja estatísticas na aba "Relatórios"

## 🛠️ Tecnologias Utilizadas

- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática para JavaScript
- **Vite** - Build tool rápida e moderna
- **Lucide React** - Ícones bonitos e consistentes
- **date-fns** - Manipulação de datas
- **CSS Custom** - Estilização minimalista e responsiva

## 📱 Design

O aplicativo foi projetado com foco em:

- **Minimalismo**: Interface limpa e sem distrações
- **Usabilidade**: Navegação intuitiva e rápida
- **Responsividade**: Funciona bem em desktop e mobile
- **Acessibilidade**: Cores contrastantes e navegação por teclado
- **Performance**: Carregamento rápido e operações fluidas

## 🎨 Paleta de Cores

- **Fundo**: Tons de cinza escuro (#0f0f0f, #1a1a1a)
- **Cards**: Cinza médio (#1f2937, #374151)
- **Acentos**: Azul (#3b82f6), Verde (#10b981), Vermelho (#ef4444)
- **Texto**: Branco e tons de cinza claro

## 📊 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── TaskBoard.tsx    # Quadro principal de tarefas
│   ├── SubjectManager.tsx # Gerenciador de matérias
│   ├── StudyCalendar.tsx # Cronograma semanal
│   ├── Analytics.tsx    # Relatórios e estatísticas
│   ├── TaskForm.tsx     # Formulário de tarefas
│   └── SubjectForm.tsx  # Formulário de matérias
├── hooks/               # Hooks personalizados
│   └── useLocalStorage.ts # Hook para localStorage
├── types/               # Definições TypeScript
│   └── index.ts         # Interfaces e tipos
├── utils/               # Utilitários
│   └── dateUtils.ts     # Funções de manipulação de data
├── data/                # Dados iniciais
│   └── initialData.ts   # Matérias padrão do ENEM
└── App.tsx              # Componente principal
```

## 🔧 Funcionalidades Técnicas

### Armazenamento Local
- Todos os dados são salvos no `localStorage` do navegador
- Não há necessidade de servidor ou internet
- Dados persistem entre sessões

### Responsividade
- Layout adaptativo para diferentes tamanhos de tela
- Grid system flexível
- Componentes otimizados para mobile

### Performance
- Lazy loading de componentes
- Otimizações de re-render
- CSS otimizado com classes utilitárias

## 🎯 Próximas Funcionalidades

- [ ] Exportação de relatórios em PDF
- [ ] Sincronização com Google Calendar
- [ ] Modo offline completo
- [ ] Temas personalizáveis
- [ ] Notificações push
- [ ] Backup na nuvem

## 🤝 Contribuindo

Este é um projeto pessoal para estudos, mas sugestões são bem-vindas!

## 📄 Licença

Este projeto é de uso pessoal e educacional.

---

**Desenvolvido com ❤️ para organizar estudos do ENEM**
