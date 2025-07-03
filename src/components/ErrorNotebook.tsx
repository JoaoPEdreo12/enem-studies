import React, { useState, useMemo } from 'react';
import type { ErrorNote, Subject } from '../types';
import { Plus, Edit, Trash2, CheckCircle } from 'lucide-react';

interface ErrorNotebookProps {
  errors: ErrorNote[];
  addError: (error: Omit<ErrorNote, 'id'>) => void;
  updateError: (id: string, updates: Partial<ErrorNote>) => void;
  deleteError: (id: string) => void;
  subjects: Subject[];
}

const errorTypes = [
  { value: 'conceitual', label: 'Conceitual' },
  { value: 'distração', label: 'Distração' },
  { value: 'interpretação', label: 'Interpretação' },
  { value: 'outro', label: 'Outro' },
];

function ErrorNotebook({ errors, addError, updateError, deleteError, subjects }: ErrorNotebookProps) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ErrorNote | null>(null);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterContent, setFilterContent] = useState('');
  const [filterType, setFilterType] = useState('');
  const [reviewing, setReviewing] = useState<ErrorNote | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Form state
  const [form, setForm] = useState<Omit<ErrorNote, 'id' | 'reviewDates' | 'lastReviewed'>>({
    subjectId: '',
    content: '',
    question: '',
    wrongAnswer: '',
    correctAnswer: '',
    insight: '',
    errorType: 'conceitual',
    date: '',
  });

  // Filtros
  const filteredErrors = useMemo(() => {
    return errors.filter(e =>
      (!filterSubject || e.subjectId === filterSubject) &&
      (!filterContent || e.content.toLowerCase().includes(filterContent.toLowerCase())) &&
      (!filterType || e.errorType === filterType)
    );
  }, [errors, filterSubject, filterContent, filterType]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = errors.length;
    const byType = errorTypes.map(t => ({ type: t.value, count: errors.filter(e => e.errorType === t.value).length }));
    const bySubject = subjects.map(s => ({ subject: s, count: errors.filter(e => e.subjectId === s.id).length }));
    return { total, byType, bySubject };
  }, [errors, subjects]);

  // Handlers
  const handleFormChange = (field: keyof typeof form, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subjectId || !form.content || !form.question || !form.wrongAnswer || !form.correctAnswer || !form.date) return;
    if (editing) {
      updateError(editing.id, { ...editing, ...form });
    } else {
      addError({
        ...form,
        reviewDates: [],
      });
    }
    setShowForm(false);
    setEditing(null);
    setForm({
      subjectId: '',
      content: '',
      question: '',
      wrongAnswer: '',
      correctAnswer: '',
      insight: '',
      errorType: 'conceitual',
      date: '',
    });
  };

  const handleEdit = (err: ErrorNote) => {
    setEditing(err);
    setForm({
      subjectId: err.subjectId,
      content: err.content,
      question: err.question,
      wrongAnswer: err.wrongAnswer,
      correctAnswer: err.correctAnswer,
      insight: err.insight,
      errorType: err.errorType,
      date: err.date,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este erro?')) {
      deleteError(id);
    }
  };

  const handleReview = (id: string) => {
    const note = errors.find(e => e.id === id);
    if (note) {
      setReviewing(note);
      setShowAnswer(false);
      setShowHint(false);
    }
  };

  const handleRegisterReview = (id: string) => {
    const today = new Date().toISOString().slice(0, 10);
    updateError(id, { ...errors.find(e => e.id === id), reviewDates: [...(errors.find(e => e.id === id)?.reviewDates || []), today], lastReviewed: today });
    setReviewing(null);
    setShowAnswer(false);
    setShowHint(false);
  };

  // Agrupamento por matéria
  const grouped = useMemo(() => {
    const map: { [subjectId: string]: ErrorNote[] } = {};
    filteredErrors.forEach(e => {
      if (!map[e.subjectId]) map[e.subjectId] = [];
      map[e.subjectId].push(e);
    });
    return map;
  }, [filteredErrors]);

  return (
    <div style={{maxWidth: 900, margin: '0 auto', padding: '2rem 0'}}>
      <h2 className="header-title" style={{fontSize:'1.6rem',marginBottom:32}}>Caderno de Erros</h2>
      {/* Estatísticas */}
      <div style={{display:'flex',gap:24,flexWrap:'wrap',marginBottom:32}}>
        <div className="card" style={{padding:16,minWidth:180}}>
          <div style={{fontWeight:600,fontSize:'1.1rem',color:'#fff'}}>Total de Erros</div>
          <div style={{fontSize:'2rem',fontWeight:700,color:'#3b82f6'}}>{stats.total}</div>
        </div>
        {stats.byType.map(t => (
          <div key={t.type} className="card" style={{padding:16,minWidth:120}}>
            <div style={{fontWeight:600,fontSize:'1rem',color:'#fff'}}>{errorTypes.find(et=>et.value===t.type)?.label}</div>
            <div style={{fontSize:'1.3rem',fontWeight:700,color:'#a1a1aa'}}>{t.count}</div>
          </div>
        ))}
        {stats.bySubject.map(s => (
          <div key={s.subject.id} className="card" style={{padding:16,minWidth:120}}>
            <div style={{fontWeight:600,fontSize:'1rem',color:s.subject.color}}>{s.subject.name}</div>
            <div style={{fontSize:'1.3rem',fontWeight:700,color:'#a1a1aa'}}>{s.count}</div>
          </div>
        ))}
      </div>
      {/* Filtros */}
      <div style={{display:'flex',gap:16,alignItems:'center',marginBottom:24,flexWrap:'wrap'}}>
        <div>
          <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1rem'}}>Matéria:</label>
          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
            <option value="">Todas</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1rem'}}>Conteúdo:</label>
          <input value={filterContent} onChange={e => setFilterContent(e.target.value)} placeholder="Buscar conteúdo..." />
        </div>
        <div>
          <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1rem'}}>Tipo de erro:</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">Todos</option>
            {errorTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <button className="btn btn-add transition" style={{marginLeft:16}} onClick={()=>{setShowForm(true);setEditing(null);}}> <Plus size={16} style={{marginRight:6}}/> Novo Erro</button>
      </div>
      {/* Lista de erros agrupados por matéria */}
      {subjects.length === 0 ? (
        <div style={{textAlign:'center',color:'#888',marginTop:32}}>Cadastre matérias para começar a registrar erros.</div>
      ) : (
        Object.keys(grouped).length === 0 ? (
          <div style={{textAlign:'center',color:'#888',marginTop:32}}>Nenhum erro encontrado para os filtros selecionados.</div>
        ) : (
          Object.entries(grouped).map(([subjectId, notes]) => {
            const subject = subjects.find(s => s.id === subjectId);
            return (
              <div key={subjectId} style={{marginBottom:32}}>
                <h3 style={{color:subject?.color||'#fff',fontWeight:700,fontSize:'1.2rem',marginBottom:12}}>{subject?.name||'Matéria'}</h3>
                <div style={{display:'flex',flexWrap:'wrap',gap:24}}>
                  {notes.map(note => (
                    <div key={note.id} className="card fade-in" style={{minWidth:320,maxWidth:360,flex:'1 1 320px',padding:20,position:'relative',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:'1.05rem',marginBottom:6}}>{note.content}</div>
                        <div style={{color:'#a1a1aa',fontSize:'0.98rem',marginBottom:8}}><b>Tipo:</b> {errorTypes.find(t=>t.value===note.errorType)?.label}</div>
                        <div style={{marginBottom:8}}><b>Questão:</b> <span style={{color:'#e0e0e0'}}>{note.question}</span></div>
                        <div style={{marginBottom:8}}><b>Erro:</b> <span style={{color:'#ef4444'}}>{note.wrongAnswer}</span></div>
                        {note.insight && <div style={{marginBottom:8}}><b>Dica:</b> <span style={{color:'#a3e635'}}>{note.insight}</span></div>}
                        <div style={{color:'#a1a1aa',fontSize:'0.95rem',marginBottom:8}}><b>Data do erro:</b> {note.date}</div>
                        <div style={{color:'#a1a1aa',fontSize:'0.95rem',marginBottom:8}}><b>Revisões:</b> {note.reviewDates?.length || 0} {note.reviewDates && note.reviewDates.length > 0 && `- Última: ${note.reviewDates[note.reviewDates.length-1]}`}</div>
                      </div>
                      <div style={{display:'flex',gap:8,marginTop:12}}>
                        <button className="btn btn-select transition" onClick={()=>handleEdit(note)}><Edit size={15} style={{marginRight:4}}/>Editar</button>
                        <button className="btn btn-remove transition" onClick={()=>handleDelete(note.id)}><Trash2 size={15} style={{marginRight:4}}/>Excluir</button>
                        <button className="btn btn-add transition" onClick={()=>handleReview(note.id)}><CheckCircle size={15} style={{marginRight:4}}/>Revisar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )
      )}
      {/* Formulário de erro */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(6px)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'#111112',border:'2px solid #3b82f6',borderRadius:24,padding:'2.5rem 1.5rem',width:'100%',maxWidth:440,boxShadow:'0 8px 32px 0 rgba(0,0,0,0.35)',animation:'fadeIn 0.4s',position:'relative',maxHeight:'90vh',overflowY:'auto'}}>
            <button onClick={()=>{setShowForm(false);setEditing(null);}} style={{position:'absolute',top:18,right:18,background:'none',border:'none',color:'#a1a1aa',fontSize:26,cursor:'pointer',transition:'color 0.2s'}} aria-label="Fechar">×</button>
            <h2 style={{fontSize:'1.4rem',fontWeight:700,color:'#fff',marginBottom:28,letterSpacing:'-1px',textAlign:'center',textShadow:'0 2px 12px #0008'}}>
              {editing ? 'Editar Erro' : 'Novo Erro'}
            </h2>
            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:18}}>
              <div>
                <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1rem',marginBottom:6,display:'block'}}>Matéria *</label>
                <select required value={form.subjectId} onChange={e => handleFormChange('subjectId', e.target.value)}>
                  <option value="">Selecione</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1rem',marginBottom:6,display:'block'}}>Conteúdo *</label>
                <input required value={form.content} onChange={e => handleFormChange('content', e.target.value)} placeholder="Ex: Funções do 1º grau" />
              </div>
              <div>
                <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1rem',marginBottom:6,display:'block'}}>Descrição da questão *</label>
                <textarea required value={form.question} onChange={e => handleFormChange('question', e.target.value)} placeholder="Enunciado, contexto ou resumo da questão..." rows={2} style={{resize:'vertical'}} />
              </div>
              <div>
                <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1rem',marginBottom:6,display:'block'}}>Sua resposta/erro *</label>
                <textarea required value={form.wrongAnswer} onChange={e => handleFormChange('wrongAnswer', e.target.value)} placeholder="O que você respondeu e por que errou?" rows={2} style={{resize:'vertical'}} />
              </div>
              <div>
                <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1rem',marginBottom:6,display:'block'}}>Resposta correta *</label>
                <textarea required value={form.correctAnswer} onChange={e => handleFormChange('correctAnswer', e.target.value)} placeholder="Qual seria a resposta correta e explicação?" rows={2} style={{resize:'vertical'}} />
              </div>
              <div>
                <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1rem',marginBottom:6,display:'block'}}>Dica/Insight</label>
                <input value={form.insight} onChange={e => handleFormChange('insight', e.target.value)} placeholder="Como evitar esse erro no futuro?" />
              </div>
              <div>
                <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1rem',marginBottom:6,display:'block'}}>Tipo de erro *</label>
                <select required value={form.errorType} onChange={e => handleFormChange('errorType', e.target.value)}>
                  {errorTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1rem',marginBottom:6,display:'block'}}>Data do erro *</label>
                <input required type="date" value={form.date} onChange={e => handleFormChange('date', e.target.value)} />
              </div>
              <div style={{display:'flex',gap:14,marginTop:8}}>
                <button type="button" onClick={()=>{setShowForm(false);setEditing(null);}} style={{flex:1,background:'#23232b',color:'#fff',border:'none',borderRadius:12,padding:'0.95rem 0',fontSize:'1.08rem',fontWeight:500,letterSpacing:0.5,transition:'background 0.18s',cursor:'pointer'}}>Cancelar</button>
                <button type="submit" style={{flex:1,background:'#3b82f6',color:'#fff',border:'none',borderRadius:12,padding:'0.95rem 0',fontSize:'1.08rem',fontWeight:600,letterSpacing:0.5,boxShadow:'0 2px 16px 0 #3b82f633',transition:'background 0.18s',cursor:'pointer'}}>{editing ? 'Salvar' : 'Criar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de revisão */}
      {reviewing && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(6px)',zIndex:60,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:'#18181b',border:'2px solid #3b82f6',borderRadius:24,padding:'2.2rem 1.2rem',width:'100%',maxWidth:420,boxShadow:'0 8px 32px 0 rgba(0,0,0,0.35)',animation:'fadeIn 0.4s',position:'relative',maxHeight:'90vh',overflowY:'auto'}}>
            <button onClick={()=>{setReviewing(null);setShowAnswer(false);setShowHint(false);}} style={{position:'absolute',top:18,right:18,background:'none',border:'none',color:'#a1a1aa',fontSize:26,cursor:'pointer',transition:'color 0.2s'}} aria-label="Fechar">×</button>
            <h2 style={{fontSize:'1.25rem',fontWeight:700,color:'#fff',marginBottom:18,textAlign:'center'}}>Revisão do Erro</h2>
            <div style={{marginBottom:16}}>
              <div style={{color:'#a1a1aa',fontWeight:500,fontSize:'1.05rem',marginBottom:6}}><b>Matéria:</b> {subjects.find(s=>s.id===reviewing.subjectId)?.name}</div>
              <div style={{color:'#a1a1aa',fontWeight:500,fontSize:'1.05rem',marginBottom:6}}><b>Conteúdo:</b> {reviewing.content}</div>
              <div style={{margin:'18px 0 10px 0',color:'#fff',fontWeight:600,fontSize:'1.08rem'}}>Questão:</div>
              <div style={{background:'#23232b',borderRadius:10,padding:'1rem',color:'#e0e0e0',marginBottom:10}}>{reviewing.question}</div>
            </div>
            {!showAnswer && (
              <>
                <div style={{marginBottom:16}}>
                  <label style={{color:'#a1a1aa',fontWeight:500,fontSize:'1rem',marginBottom:6,display:'block'}}>Tente responder ou reflita sobre o erro.</label>
                  <textarea placeholder="Escreva sua resposta mentalmente ou aqui..." rows={2} style={{width:'100%',background:'#18181b',border:'1.5px solid #23232b',borderRadius:10,padding:'0.7rem',color:'#fff',marginTop:4,resize:'vertical'}} />
                </div>
                {reviewing.insight && !showHint && (
                  <button className="btn btn-select transition" style={{marginBottom:12}} onClick={()=>setShowHint(true)}>Ver Dica</button>
                )}
                {showHint && reviewing.insight && (
                  <div style={{background:'#23232b',borderRadius:10,padding:'0.8rem',color:'#a3e635',marginBottom:12}}><b>Dica:</b> {reviewing.insight}</div>
                )}
                <button className="btn btn-add transition" style={{marginBottom:8}} onClick={()=>setShowAnswer(true)}>Mostrar Resposta</button>
              </>
            )}
            {showAnswer && (
              <>
                <div style={{marginBottom:10}}><b>Resposta correta:</b> <span style={{color:'#22d3ee'}}>{reviewing.correctAnswer}</span></div>
                {reviewing.insight && (
                  <div style={{background:'#23232b',borderRadius:10,padding:'0.8rem',color:'#a3e635',marginBottom:12}}><b>Dica:</b> {reviewing.insight}</div>
                )}
                <button className="btn btn-add transition" style={{marginTop:8}} onClick={()=>handleRegisterReview(reviewing.id)}>Registrar Revisão</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ErrorNotebook; 