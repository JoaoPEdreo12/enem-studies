import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }
    
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="text-primary" size={32} />
            <h1 className="auth-title">ENEM Studies</h1>
            <Sparkles className="text-primary" size={32} />
          </div>
          <h2 className="auth-subtitle">Bem-vindo de volta!</h2>
          <p className="auth-description">
            Entre na sua conta para continuar sua jornada de estudos
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Endereço de Email
            </label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="transition"
              />
              <Mail className="input-icon" size={20} />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Senha
            </label>
            <div className="input-wrapper relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="transition pr-14"
              />
              <Lock className="input-icon" size={20} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="auth-button btn-gradient-primary hover-lift"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Entrando...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Entrar na Conta
              </>
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
            <span className="px-4 text-sm">ou</span>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
          </div>
          
          <p className="text-center text-gray-300">
            Ainda não tem uma conta?{' '}
            <button
              type="button"
              className="create-account-btn"
              onClick={() => navigate('/cadastro')}
            >
              Criar conta gratuita
            </button>
          </p>
        </div>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
