import { useState } from 'react';
import type { FlashCardData, Subject } from '../types';
import FlashCard from './FlashCard';
import { format, parseISO, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FlashCardManagerProps {
  flashcards: FlashCardData[];
  addFlashcard: (card: Omit<FlashCardData, 'id'>) => void;
  updateFlashcard: (id: string, updates: Partial<FlashCardData>) => void;
  deleteFlashcard: (id: string) => void;
  subjects: Subject[];
  categoryFilter?: string;
  setCategoryFilter?: (cat: string) => void;
}

// Novo tipo para conteúdo
interface Content {
  subjectId: string;
  value: string;
}

const FlashCardManager = ({ flashcards, addFlashcard, updateFlashcard, deleteFlashcard, subjects, categoryFilter }: FlashCardManagerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<FlashCardData>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedContent, setSelectedContent] = useState<string>('');
  const [contents, setContents] = useState<Content[]>([]);
  const [newContent, setNewContent] = useState('');
  // Novo: formulário dedicado para criar conteúdo
  const [showContentForm, setShowContentForm] = useState(false);
  const [contentSubject, setContentSubject] = useState('');
  const [contentValue, setContentValue] = useState('');

  const filteredSubjects = categoryFilter
    ? subjects.filter(s => s.category === categoryFilter)
    : subjects;

  // Conteúdos cadastrados manualmente + os já usados em flashcards
  const subjectContents = selectedSubject
    ? Array.from(new Set([
        ...contents.filter(c => c.subjectId === selectedSubject).map(c => c.value),
        ...flashcards.filter(f => f.subjectId === selectedSubject).map(f => f.content)
      ]))
    : [];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subjectId || !form.content || !form.front || !form.back) return;
    if (editingId) {
      updateFlashcard(editingId, form);
    } else {
      addFlashcard({ ...form, id: crypto.randomUUID() } as FlashCardData);
    }
    setShowForm(false);
    setForm({});
    setEditingId(null);
  };

  const handleEdit = (card: FlashCardData) => {
    setForm(card);
    setEditingId(card.id);
    setShowForm(true);
    setSelectedSubject(card.subjectId);
    setSelectedContent(card.content);
  };

  const handleDelete = (id: string) => {
    deleteFlashcard(id);
  };

  const handleAddContent = () => {
    if (!selectedSubject || !newContent.trim()) return;
    if (!subjectContents.includes(newContent.trim())) {
      setContents([...contents, { subjectId: selectedSubject, value: newContent.trim() }]);
      setNewContent('');
    }
  };

  // Remover conteúdo
  const handleRemoveContent = (content: string) => {
    setContents(contents.filter(c => !(c.subjectId === selectedSubject && c.value === content)));
    if (selectedContent === content) setSelectedContent('');
  };

  // Flashcards filtrados por matéria e conteúdo
  const filteredCards = flashcards.filter(f =>
    (!selectedSubject || f.subjectId === selectedSubject) &&
    (!selectedContent || f.content === selectedContent)
  );

  const handleCreateContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentSubject || !contentValue.trim()) return;
    if (!contents.some(c => c.subjectId === contentSubject && c.value === contentValue.trim())) {
      setContents([...contents, { subjectId: contentSubject, value: contentValue.trim() }]);
      setShowContentForm(false);
      setContentValue('');
      setContentSubject('');
      // Sincronizar seleção automática no formulário de flashcard
      setForm(f => ({ ...f, subjectId: contentSubject, content: contentValue.trim() }));
      setShowForm(true);
    }
  };

  const getReviewStats = () => {
    const now = new Date();
    const stats = subjects.map(subject => {
      const subjectCards = flashcards.filter(f => f.subjectId === subject.id);
      const readyForReview = subjectCards.filter(f => {
        if (!f.nextReview) return true;
        const reviewDate = parseISO(f.nextReview);
        return isBefore(reviewDate, now) || reviewDate.toDateString() === now.toDateString();
      });
      const overdue = subjectCards.filter(f => {
        if (!f.nextReview) return false;
        return isBefore(parseISO(f.nextReview), now);
      });
      const nextReviews = subjectCards
        .filter(f => f.nextReview && !isBefore(parseISO(f.nextReview), now))
        .sort((a, b) => parseISO(a.nextReview!).getTime() - parseISO(b.nextReview!).getTime())
        .slice(0, 3);
      
      return {
        subject,
        total: subjectCards.length,
        ready: readyForReview.length,
        overdue: overdue.length,
        nextReviews
      };
    });
    return stats;
  };

  const reviewStats = getReviewStats();

  return (
    <div style={{maxWidth: 900, margin: '0 auto', padding: '2rem 0'}}>
      <h2 className="header-title" style={{fontSize:'1.6rem',marginBottom:32}}>Gerenciar Flashcards</h2>
      {/* Estatísticas de revisão */}
      <div style={{marginBottom:32}}>
        <h3 style={{fontSize:'1.2rem',fontWeight:600,marginBottom:16,textAlign:'center'}}>Status das Revisões</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:16}}>
          {reviewStats.map(stat => (
            <div key={stat.subject.id} className="card fade-in" style={{padding:16}}>
              <div style={{display:'flex',alignItems:'center',marginBottom:12}}>
                <div style={{width:12,height:12,borderRadius:'50%',background:stat.subject.color,marginRight:8}}></div>
                <h4 style={{fontWeight:600,fontSize:'1rem'}}>{stat.subject.name}</h4>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <span style={{color:'var(--color-text-muted)',fontSize:'0.9rem'}}>Total:</span>
                <span style={{fontWeight:600}}>{stat.total}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <span style={{color:'var(--color-text-muted)',fontSize:'0.9rem'}}>Prontos para revisão:</span>
                <span style={{fontWeight:600,color:stat.ready > 0 ? 'var(--color-success)' : 'var(--color-text-muted)'}}>{stat.ready}</span>
              </div>
              {stat.overdue > 0 && (
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                  <span style={{color:'var(--color-text-muted)',fontSize:'0.9rem'}}>Atrasados:</span>
                  <span style={{fontWeight:600,color:'var(--color-error)'}}>{stat.overdue}</span>
                </div>
              )}
              {stat.nextReviews.length > 0 && (
                <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid var(--color-border)'}}>
                  <div style={{color:'var(--color-text-muted)',fontSize:'0.8rem',marginBottom:4}}>Próximas revisões:</div>
                  {stat.nextReviews.map(card => (
                    <div key={card.id} style={{fontSize:'0.8rem',color:'var(--color-text-light)',marginBottom:2}}>
                      {format(parseISO(card.nextReview!), "dd/MM", { locale: ptBR })} - {card.front.substring(0, 30)}...
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Formulário dedicado para criar conteúdo */}
      <div style={{display:'flex',justifyContent:'center',marginBottom:24}}>
        {!showContentForm ? (
          <button className="btn btn-add transition" onClick={() => setShowContentForm(true)}>
            + Novo Conteúdo
          </button>
        ) : (
          <form className="card scale-in" style={{maxWidth:420,minWidth:320,margin:'0 auto',display:'flex',flexDirection:'column',gap:12}} onSubmit={handleCreateContent}>
            <h3 style={{fontWeight:600,fontSize:'1.1rem',marginBottom:8}}>Adicionar Conteúdo</h3>
            <label>Matéria*</label>
            <select required value={contentSubject} onChange={e => setContentSubject(e.target.value)}>
              <option value="">Selecione</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <label>Conteúdo*</label>
            <input required value={contentValue} onChange={e => setContentValue(e.target.value)} placeholder="Ex: Funções do 1º grau" />
            <div style={{display:'flex',gap:12,marginTop:8,justifyContent:'flex-end'}}>
              <button type="button" className="btn btn-cancel transition" style={{background:'var(--color-surface-alt)',color:'var(--color-text)'}} onClick={()=>{setShowContentForm(false);setContentValue('');setContentSubject('');}}>Cancelar</button>
              <button type="submit" className="btn btn-add transition">Criar</button>
            </div>
          </form>
        )}
      </div>
      {/* Formulário de criação/edição sempre acessível no topo */}
      {showForm && (
        <div style={{display:'flex',justifyContent:'center',marginBottom:40}}>
          <form className="card scale-in" style={{maxWidth:420,minWidth:320,margin:'0 auto'}} onSubmit={handleSave}>
            <h3 style={{fontWeight:600,fontSize:'1.15rem',marginBottom:16}}>{editingId ? 'Editar' : 'Adicionar'} Flashcard</h3>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <label>Matéria*</label>
              <select required value={form.subjectId || ''} onChange={e => setForm(f => ({...f, subjectId: e.target.value}))}>
                <option value="">Selecione</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <label>Conteúdo*</label>
              <select required value={form.content || ''} onChange={e => setForm(f => ({...f, content: e.target.value}))} disabled={!form.subjectId}>
                <option value="">Selecione</option>
                {form.subjectId && Array.from(new Set([
                  ...contents.filter(c => c.subjectId === form.subjectId).map(c => c.value),
                  ...flashcards.filter(f => f.subjectId === form.subjectId).map(f => f.content)
                ])).map(content => <option key={content} value={content}>{content}</option>)}
              </select>
              <label>Frente*</label>
              <input required value={form.front || ''} onChange={e => setForm(f => ({...f, front: e.target.value}))} placeholder="Pergunta ou termo" />
              <label>Verso*</label>
              <input required value={form.back || ''} onChange={e => setForm(f => ({...f, back: e.target.value}))} placeholder="Resposta ou explicação" />
            </div>
            <div style={{display:'flex',gap:12,marginTop:16,justifyContent:'flex-end'}}>
              <button type="button" className="btn btn-cancel transition" style={{background:'var(--color-surface-alt)',color:'var(--color-text)'}} onClick={()=>{setShowForm(false);setForm({});setEditingId(null);}}>Cancelar</button>
              <button type="submit" className="btn btn-add transition">{editingId ? 'Salvar' : 'Criar'}</button>
            </div>
          </form>
        </div>
      )}
      {/* Botão para abrir formulário de novo flashcard */}
      {!showForm && (
        <div style={{display:'flex',justifyContent:'center',marginBottom:32}}>
          <button className="btn btn-add transition" onClick={() => { setShowForm(true); setForm({}); setEditingId(null); }}>Novo Flashcard</button>
        </div>
      )}
      {/* ETAPA 1: Seleção de matéria */}
      <div style={{marginBottom:32,display:'flex',gap:24,alignItems:'flex-start',justifyContent:'center'}}>
        <div>
          <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1.05rem'}}>Matéria:</label>
          <select value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedContent(''); }}>
            <option value="">Selecione</option>
            {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        {/* ETAPA 2: Gerenciar conteúdos */}
        {selectedSubject && (
          <div style={{minWidth:260}}>
            <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1.05rem'}}>Conteúdo:</label>
            <select value={selectedContent} onChange={e => setSelectedContent(e.target.value)}>
              <option value="">Selecione</option>
              {subjectContents.map(content => <option key={content} value={content}>{content}</option>)}
            </select>
            <div style={{marginTop:10,display:'flex',gap:8,alignItems:'center'}}>
              <input
                type="text"
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="Novo conteúdo"
              />
              <button className="btn btn-add transition" type="button" style={{padding:'0.4rem 1.2rem'}} onClick={handleAddContent}>Adicionar</button>
            </div>
            {contents.filter(c => c.subjectId === selectedSubject).length > 0 && (
              <div style={{marginTop:8}}>
                <span style={{color:'#a1a1aa',fontSize:'0.98rem'}}>Conteúdos cadastrados:</span>
                <ul style={{margin:0,paddingLeft:18}}>
                  {contents.filter(c => c.subjectId === selectedSubject).map(c => (
                    <li key={c.value} style={{display:'flex',alignItems:'center',gap:6}}>
                      <span>{c.value}</span>
                      <button className="btn btn-remove transition" type="button" style={{background:'var(--color-surface-alt)',color:'var(--color-text)',fontSize:'0.85rem',padding:'0.1rem 0.7rem'}} onClick={()=>handleRemoveContent(c.value)}>Remover</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Visualização dos flashcards filtrados */}
      <div style={{marginTop:8}}>
        {filteredCards.length === 0 ? (
          <div style={{textAlign:'center',color:'#888',marginTop:32}}>Nenhum flashcard encontrado para o filtro selecionado.</div>
        ) : (
          <div style={{display:'flex',flexWrap:'wrap',gap:'2.5rem',justifyContent:'center',alignItems:'stretch'}}>
            {filteredCards.map(card => (
              <div key={card.id} style={{position:'relative',minWidth:320,maxWidth:340,flex:'1 1 320px',display:'flex',flexDirection:'column',alignItems:'center'}}>
                <FlashCard
                  front={card.front}
                  back={card.back}
                  subjectColor={'#23232b'}
                />
                <div style={{position:'absolute',top:10,right:10,display:'flex',gap:8}}>
                  <button className="btn" style={{background:'#23232b',padding:'0.3rem 1rem',fontSize:'0.95rem'}} onClick={()=>handleEdit(card)} type="button">Editar</button>
                  <button className="btn" style={{background:'#ef4444',padding:'0.3rem 1rem',fontSize:'0.95rem'}} onClick={()=>handleDelete(card.id)} type="button">Excluir</button>
                </div>
                <div style={{textAlign:'center',marginTop:8,color:'#a1a1aa',fontSize:'0.98rem'}}>{card.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashCardManager; 