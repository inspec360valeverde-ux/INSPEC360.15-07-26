import { useState } from 'react';
import newLogo from '../../imports/Firefly_Gemini_Flash_recrie_a_imagem_com_qualidade_melhor__331567-1.png';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { authenticate } from '../data/store';
import type { User } from '../App';
import { ShieldCheck } from 'lucide-react';
import { useVersionInfo, formatUpdateTime } from '@/hooks/useVersionInfo';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const versionInfo = useVersionInfo();

  // Debug: log version info no console
  React.useEffect(() => {
    if (versionInfo) {
      console.log('[LoginScreen] Version Info:', versionInfo);
    }
  }, [versionInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const sysUser = authenticate(email, password);
      if (sysUser) {
        onLogin({
          id: sysUser.id,
          name: sysUser.name,
          email: sysUser.email,
          role: sysUser.role,
          avatar: sysUser.avatar,
        });
      } else {
        setError('E-mail ou senha inválidos. Verifique suas credenciais.');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative" style={{ backgroundColor: '#193A2A' }}>
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, #AA8933, #AA8933 1px, transparent 1px, transparent 40px)`,
        }}
      />

      {/* Vale Verde Badge - top of screen */}
      <div className="relative z-10 mb-4 flex items-center gap-2 px-4 py-2 rounded-full text-xs"
        style={{ backgroundColor: 'rgba(170,137,51,0.15)', border: '1px solid rgba(170,137,51,0.3)', color: '#AA8933' }}>
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>✅ ATUALIZADO EM 21/07/2026 - Sistema ao vivo</span>
      </div>

      <div className="relative w-full max-w-sm px-6">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Top accent */}
          <div className="h-1.5" style={{ backgroundColor: '#AA8933' }} />

          <div className="p-8">
            {/* Dual Logo */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <img src={newLogo} alt="Logo" className="h-28 w-auto object-contain" />
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 style={{ color: '#193A2A' }} className="text-lg">Sistema de Inspeções</h1>
              <p className="text-xs text-gray-500 mt-1">LT 230kV – Gestão de Estruturas</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" style={{ color: '#193A2A' }} className="text-sm">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gray-200 focus:border-[#AA8933]"
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" style={{ color: '#193A2A' }} className="text-sm">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gray-200 focus:border-[#AA8933]"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="text-xs text-red-600 bg-red-50 rounded p-2 text-center">{error}</div>
              )}

              <Button
                type="submit"
                className="w-full text-white"
                style={{ backgroundColor: '#AA8933' }}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Entrando...
                  </span>
                ) : ('Entrar')}
              </Button>
            </form>

            {/* Demo hint */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-2">Contas de demonstração:</p>
              <div className="space-y-1">
                {[
                  { email: 'carlos@inspec360.com', label: 'Técnico' },
                  { email: 'supervisor@inspec360.com', label: 'Supervisor' },
                  { email: 'admin@inspec360.com', label: 'Super Admin' },
                ].map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => { setEmail(acc.email); setPassword('123456'); }}
                    className="w-full text-left text-xs px-3 py-1.5 rounded hover:bg-gray-50 transition-colors flex justify-between items-center"
                  >
                    <span className="text-gray-600">{acc.email}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#193A2A' }}>
                      {acc.label}
                    </span>
                  </button>
                ))}
                <p className="text-xs text-gray-400 text-center pt-1">Senha: 123456</p>
              </div>
            </div>
          </div>
        </div>

        {/* Last update info - HIGHLIGHT */}
        {versionInfo && (
          <div className="mt-6 pt-4 border-t border-white/20">
            <p className="text-center text-white/60 text-[11px] font-medium">
              📦 Versão: v{versionInfo?.version || '2.2.0'}
            </p>
            <p className="text-center text-[#AA8933] text-[12px] font-semibold mt-2 bg-white/5 rounded px-3 py-2">
              🕐 Última atualização:{'\n'}{formatUpdateTime(versionInfo.buildDate)}
            </p>
          </div>
        )}

        {/* Bottom watermark */}
        <p className="text-center text-white/25 text-[9px] mt-3">
          © 2026 INSPEC360 · Mineração Vale Verde
        </p>
      </div>
    </div>
  );
}