import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={{maxWidth: 340, margin: '0 auto', padding: 32}}>
      <h2 style={{textAlign: 'center', marginBottom: 24}}>Entrar ou Cadastrar</h2>
      <form onSubmit={handleLogin} style={{marginBottom: 16}}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{width:'100%',marginBottom:8,padding:8}} />
        <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required style={{width:'100%',marginBottom:8,padding:8}} />
        <button type="submit" disabled={loading} style={{width:'100%',padding:10,background:'#3b82f6',color:'#fff',border:'none',borderRadius:6,fontWeight:600}}>Entrar</button>
      </form>
      <form onSubmit={handleSignUp}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{width:'100%',marginBottom:8,padding:8}} />
        <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required style={{width:'100%',marginBottom:8,padding:8}} />
        <button type="submit" disabled={loading} style={{width:'100%',padding:10,background:'#10b981',color:'#fff',border:'none',borderRadius:6,fontWeight:600}}>Cadastrar</button>
      </form>
      {error && <div style={{color: 'red', marginTop: 12, textAlign:'center'}}>{error}</div>}
    </div>
  )
} 