import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      navigate('/');
    }
  }

  return (
    <div className="min-h-screen bg-[#1A1A19] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#FFE600]/10 border border-[#FFE600]/30 rounded mb-4">
            <Shield className="w-7 h-7 text-[#FFE600]" />
          </div>
          <h1 className="text-3xl font-bold tracking-widest text-[#FFE600] uppercase">Arsenal</h1>
          <p className="text-[#D8D59D] text-xs tracking-wider mt-1">Ateliê de Propaganda</p>
          <p className="text-[#606060] text-xs mt-1">Gestão de Ativos e Infraestrutura</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#D8D59D] mb-1.5">
              E-mail <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full bg-[#222221] border border-[#3a3a38] text-white text-sm px-3 py-2.5 rounded outline-none focus:border-[#FFE600] transition-colors placeholder:text-[#505050]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#D8D59D] mb-1.5">
              Senha <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#222221] border border-[#3a3a38] text-white text-sm px-3 py-2.5 pr-10 rounded outline-none focus:border-[#FFE600] transition-colors placeholder:text-[#505050]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#606060] hover:text-[#a0a09e]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-900/40 px-3 py-2 rounded">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFE600] text-[#1A1A19] font-semibold text-sm py-2.5 rounded hover:bg-[#FFE600]/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-8 border-t border-[#2a2a28] pt-6">
          <p className="text-[#606060] text-xs text-center mb-3">Credenciais de demonstração</p>
          <div className="space-y-2">
            {[
              { label: 'Admin', email: 'admin@arsenal.com' },
              { label: 'TI Externo', email: 'ti@arsenal.com' },
              { label: 'Equipe Interna', email: 'equipe@arsenal.com' },
            ].map(cred => (
              <button
                key={cred.email}
                type="button"
                onClick={() => { setEmail(cred.email); setPassword('Arsenal@2025'); }}
                className="w-full text-left flex items-center justify-between px-3 py-2 bg-[#222221] border border-[#2a2a28] rounded hover:border-[#3a3a38] transition-colors"
              >
                <span className="text-xs text-[#D8D59D] font-medium">{cred.label}</span>
                <span className="text-xs text-[#606060] font-mono">{cred.email}</span>
              </button>
            ))}
            <p className="text-[10px] text-[#505050] text-center">Senha: Arsenal@2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}
