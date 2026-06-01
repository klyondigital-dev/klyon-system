import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, Shield, ChevronRight } from 'lucide-react';

interface LoginProps {
  onLogin: (status: boolean) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        localStorage.setItem('klyon_token', data.token);
        onLogin(true);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-blue/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#0f172a]/60 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          {/* Subtle top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-blue via-accent-purple to-accent-blue opacity-75" />

          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-accent-blue to-accent-purple flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(138,43,226,0.3)]">
              <Shield className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Klyon System
            </h1>
            <p className="text-gray-400 text-sm mt-1">Acesso Restrito</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Usuário</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-accent-blue transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(false); }}
                  className={`w-full bg-[#1e293b]/50 border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-gray-700 focus:border-accent-blue'} rounded-xl py-3 pl-10 pr-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-blue/50 transition-all`}
                  placeholder="Digite seu usuário"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-accent-purple transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(false); }}
                  className={`w-full bg-[#1e293b]/50 border ${error ? 'border-red-500/50 focus:border-red-500' : 'border-gray-700 focus:border-accent-purple'} rounded-xl py-3 pl-10 pr-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-purple/50 transition-all`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-red-400 text-sm text-center"
              >
                Credenciais inválidas. Tente admin / admin123.
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative group overflow-hidden rounded-xl bg-[#1e293b] border border-gray-700 mt-6"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-accent-blue to-accent-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative px-6 py-3 flex items-center justify-center font-medium text-white transition-all">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>
        </motion.div>

        {/* Footer info */}
        <p className="text-center text-gray-500 text-xs mt-8">
          &copy; {new Date().getFullYear()} Klyon Digital. Ambiente Seguro.
        </p>
      </div>
    </div>
  );
}
