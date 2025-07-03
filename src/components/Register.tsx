
import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, Eye, EyeOff, Sparkles, Calendar, GraduationCap, BookOpen, Users } from 'lucide-react'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [examYear, setExamYear] = useState('')
  const [targetExam, setTargetExam] = useState('')
  const [hasPreparatoryEourse, setHasPreparatoryEourse] = useState('')
  const [preparatoryCourse, setPreparatoryCourse] = useState('')
  const [currentGrade, setCurrentGrade] = useState('')
  const [studyGoal, setStudyGoal] = useState('')
  const [previousExperience, setPreviousExperience] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [step, setStep] = useState(1)
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

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          birth_date: birthDate,
          exam_year: examYear,
          target_exam: targetExam,
          has_preparatory_course: hasPreparatoryEourse === 'sim',
          preparatory_course: preparatoryCourse,
          current_grade: currentGrade,
          study_goal: studyGoal,
          previous_experience: previousExperience
        }
      }
    })

    if (authError) {
      setError(authError.message)
    } else {
      // Inserir dados adicionais na tabela user_profiles
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authData.user.id,
            birth_date: birthDate,
            exam_year: parseInt(examYear),
            target_exam: targetExam,
            has_preparatory_course: hasPreparatoryEourse === 'sim',
            preparatory_course: preparatoryCourse || null,
            current_grade: currentGrade,
            study_goal: studyGoal,
            previous_experience: previousExperience
          })

        if (profileError) {
          console.error('Erro ao salvar perfil:', profileError)
        }
      }

      setSuccess('Conta criada com sucesso! Verifique seu email para confirmar.')
      setTimeout(() => navigate('/login'), 3000)
    }

    setLoading(false)
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="text-primary animate-pulse" size={32} />
            <h1 className="auth-title">ENEM Studies</h1>
            <Sparkles className="text-primary animate-pulse" size={32} />
          </div>
          <h2 className="auth-subtitle">Crie sua conta</h2>
          <p className="auth-description">
            Vamos personalizar sua experiência de estudos
          </p>
          
          {/* Progress indicator */}
          <div className="register-progress">
            <div className="progress-steps">
              <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
              <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
              <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
              <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
              <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
            </div>
            <div className="step-labels">
              <span className={step === 1 ? 'active' : ''}>Dados Pessoais</span>
              <span className={step === 2 ? 'active' : ''}>Informações do Vestibular</span>
              <span className={step === 3 ? 'active' : ''}>Perfil de Estudo</span>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleRegister} className="auth-form register-form">
          {/* Step 1: Dados Pessoais */}
          {step === 1 && (
            <div className="form-step active">
              <h3 className="step-title">
                <User className="text-blue-400" size={24} />
                Dados Pessoais
              </h3>
              
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">Nome Completo</label>
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

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <div className="input-wrapper">
                    <input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
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
                  <label htmlFor="phone" className="form-label">Telefone</label>
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
              </div>

              <div className="form-group">
                <label htmlFor="birthDate" className="form-label">Data de Nascimento</label>
                <div className="input-wrapper">
                  <input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    required
                    className="transition"
                  />
                  <Calendar className="input-icon" size={20} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password" className="form-label">Senha</label>
                  <div className="input-wrapper relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
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
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirmar Senha</label>
                  <div className="input-wrapper relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Digite novamente"
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
              </div>

              <button type="button" onClick={nextStep} className="step-button next">
                Próximo <span>→</span>
              </button>
            </div>
          )}

          {/* Step 2: Informações do Vestibular */}
          {step === 2 && (
            <div className="form-step active">
              <h3 className="step-title">
                <GraduationCap className="text-green-400" size={24} />
                Informações do Vestibular
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="examYear" className="form-label">Ano do Vestibular</label>
                  <div className="input-wrapper">
                    <select
                      id="examYear"
                      value={examYear}
                      onChange={e => setExamYear(e.target.value)}
                      required
                      className="transition"
                    >
                      <option value="">Selecione o ano</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                    </select>
                    <Calendar className="input-icon" size={20} />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="targetExam" className="form-label">Vestibular Pretendido</label>
                  <div className="input-wrapper">
                    <select
                      id="targetExam"
                      value={targetExam}
                      onChange={e => setTargetExam(e.target.value)}
                      required
                      className="transition"
                    >
                      <option value="">Selecione o vestibular</option>
                      <option value="ENEM">ENEM</option>
                      <option value="FUVEST">FUVEST (USP)</option>
                      <option value="UNICAMP">UNICAMP</option>
                      <option value="UNESP">UNESP</option>
                      <option value="UERJ">UERJ</option>
                      <option value="UnB">UnB (PAS)</option>
                      <option value="Outros">Outros</option>
                    </select>
                    <BookOpen className="input-icon" size={20} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="currentGrade" className="form-label">Série Atual</label>
                <div className="input-wrapper">
                  <select
                    id="currentGrade"
                    value={currentGrade}
                    onChange={e => setCurrentGrade(e.target.value)}
                    required
                    className="transition"
                  >
                    <option value="">Selecione sua série</option>
                    <option value="1º Ensino Médio">1º Ano do Ensino Médio</option>
                    <option value="2º Ensino Médio">2º Ano do Ensino Médio</option>
                    <option value="3º Ensino Médio">3º Ano do Ensino Médio</option>
                    <option value="Formado">Já me formei</option>
                    <option value="EJA">EJA (Educação de Jovens e Adultos)</option>
                  </select>
                  <GraduationCap className="input-icon" size={20} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="hasPreparatoryEourse" className="form-label">Faz Cursinho?</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="hasPreparatoryEourse"
                      value="sim"
                      checked={hasPreparatoryEourse === 'sim'}
                      onChange={e => setHasPreparatoryEourse(e.target.value)}
                    />
                    <span>Sim</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="hasPreparatoryEourse"
                      value="não"
                      checked={hasPreparatoryEourse === 'não'}
                      onChange={e => setHasPreparatoryEourse(e.target.value)}
                    />
                    <span>Não</span>
                  </label>
                </div>
              </div>

              {hasPreparatoryEourse === 'sim' && (
                <div className="form-group">
                  <label htmlFor="preparatoryCourse" className="form-label">Qual Cursinho?</label>
                  <div className="input-wrapper">
                    <input
                      id="preparatoryCourse"
                      type="text"
                      placeholder="Nome do cursinho"
                      value={preparatoryCourse}
                      onChange={e => setPreparatoryCourse(e.target.value)}
                      className="transition"
                    />
                    <Users className="input-icon" size={20} />
                  </div>
                </div>
              )}

              <div className="form-buttons">
                <button type="button" onClick={prevStep} className="step-button prev">
                  <span>←</span> Voltar
                </button>
                <button type="button" onClick={nextStep} className="step-button next">
                  Próximo <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Perfil de Estudo */}
          {step === 3 && (
            <div className="form-step active">
              <h3 className="step-title">
                <BookOpen className="text-purple-400" size={24} />
                Perfil de Estudo
              </h3>

              <div className="form-group">
                <label htmlFor="studyGoal" className="form-label">Meta de Estudo</label>
                <div className="input-wrapper">
                  <select
                    id="studyGoal"
                    value={studyGoal}
                    onChange={e => setStudyGoal(e.target.value)}
                    required
                    className="transition"
                  >
                    <option value="">Selecione sua meta</option>
                    <option value="Passar em universidade pública">Passar em universidade pública</option>
                    <option value="Conseguir bolsa integral">Conseguir bolsa integral (ProUni)</option>
                    <option value="Melhorar nota do ENEM">Melhorar nota do ENEM</option>
                    <option value="Ingressar em curso específico">Ingressar em curso específico</option>
                    <option value="Reforçar conhecimentos">Reforçar conhecimentos gerais</option>
                  </select>
                  <BookOpen className="input-icon" size={20} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="previousExperience" className="form-label">Experiência Anterior</label>
                <div className="input-wrapper">
                  <select
                    id="previousExperience"
                    value={previousExperience}
                    onChange={e => setPreviousExperience(e.target.value)}
                    required
                    className="transition"
                  >
                    <option value="">Selecione sua experiência</option>
                    <option value="Primeira vez">Primeira vez prestando vestibular</option>
                    <option value="Segunda tentativa">Segunda tentativa</option>
                    <option value="Terceira tentativa ou mais">Terceira tentativa ou mais</option>
                    <option value="Já passei antes">Já passei em vestibular antes</option>
                  </select>
                  <GraduationCap className="input-icon" size={20} />
                </div>
              </div>

              <div className="form-buttons">
                <button type="button" onClick={prevStep} className="step-button prev">
                  <span>←</span> Voltar
                </button>
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
                      Criar Conta
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
        
        <div className="auth-footer">
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
