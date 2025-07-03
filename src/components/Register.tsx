
import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        }
      }
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Conta criada com sucesso! Verifique seu email para confirmar.')
      setTimeout(() => navigate('/login'), 3000)
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
          <h2 className="auth-subtitle">Crie sua conta</h2>
          <p className="auth-description">
            Junte-se a milhares de estudantes que já transformaram seus estudos
          </p>
        </div>
        
        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              Nome Completo
            </label>
            <div className="input-wrapper">
              <input
                id="fullName"
                type="text"
                placeholder="Digite seu nome completo"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                autoComplete="name"
                className="transition"
              />
              <User className="input-icon" size={20} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Telefone
            </label>
            <div className="input-wrapper">
              <input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                autoComplete="tel"
                className="transition"
              />
              <User className="input-icon" size={20} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Endereço de Email
            </label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                placeholder="Digite seu melhor email"
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
                placeholder="Crie uma senha segura"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
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
            <p className="text-xs text-gray-400 mt-1">
              Mínimo de 6 caracteres
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar Senha
            </label>
            <div className="input-wrapper relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="transition pr-14"
              />
              <Lock className="input-icon" size={20} />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle-btn"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="auth-button btn-gradient-success hover-lift"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Criando conta...
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Criar Conta Gratuita
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
            Já tem uma conta?{' '}
            <button
              type="button"
              className="create-account-btn"
              onClick={() => navigate('/login')}
            >
              Fazer login
            </button>
          </p>
        </div>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-400 text-center font-medium">{success}</p>
          </div>
        )}
      </div>
    </div>
  )
}
