import React, { useState } from 'react';
import { loginWithGoogle, auth, db } from '@/src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Shield, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/src/components/ui/Logo';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [debugUid, setDebugUid] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginWithGoogle();
      const user = result.user;
      setDebugUid(user.uid);
      
      // Check if user exists in admins collection
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      const isMaster = user.email?.toLowerCase() === 'lojaarcadaalianca34@gmail.com';
      
      if (!adminDoc.exists() && !isMaster) {
        setError('Acesso negado. Você não tem permissão de administrador.');
        // Don't auto-logout yet to show the message, 
        // but the dashboard check will block them anyway
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/popup-closed-by-user' || err.message?.includes('popup-closed-by-user')) {
        setError('A janela de autenticação foi fechada. Por favor, tente novamente e certifique-se de permitir pop-ups no seu navegador para este site.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Uma solicitação de login já está em andamento. Verifique se há outra janela aberta.');
      } else {
        setError('Erro ao autenticar: ' + (err.message || 'Erro desconhecido'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-masonic-dark p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-masonic-blue/80 p-12 rounded-3xl border border-gold-500/30 text-center"
      >
        <div className="w-24 h-24 mx-auto mb-8">
          <Logo className="w-full h-full" />
        </div>
        
        <h1 className="font-serif text-3xl font-bold text-white mb-2 uppercase tracking-widest">Acesso Restrito</h1>
        <p className="text-gold-200/50 text-sm mb-8">Somente OFICIAIS autorizados da Arca nº 34</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex flex-col gap-3 text-red-400 text-sm text-left">
            <div className="flex items-center gap-3">
              <AlertCircle className="shrink-0" />
              <span>{error}</span>
            </div>
            {debugUid && (
              <div className="pt-2 border-t border-red-500/20">
                <p className="text-[10px] uppercase font-bold text-white/40 mb-1">Seu UID para autorização:</p>
                <code className="bg-black/20 p-2 rounded block break-all text-white select-all">{debugUid}</code>
                
                {auth.currentUser?.email?.toLowerCase() === 'lojaarcadaalianca34@gmail.com' && (
                  <button 
                    onClick={async () => {
                      try {
                        const { setDoc, doc } = await import('firebase/firestore');
                        await setDoc(doc(db, 'admins', debugUid), { email: auth.currentUser?.email });
                        window.location.reload();
                      } catch (e) {
                        setError('Erro ao auto-promover: ' + (e as Error).message);
                      }
                    }}
                    className="mt-4 w-full bg-gold-500/20 text-gold-500 border border-gold-500/40 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gold-500 hover:text-masonic-dark transition-all"
                  >
                    Ativar meu acesso Admin
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <button 
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-4 bg-white text-masonic-dark font-sans font-bold py-5 rounded-2xl hover:bg-gold-50 transition-all disabled:opacity-50 shadow-[0_0_50px_rgba(255,255,255,0.3)] active:scale-[0.98] group border-2 border-gold-500"
        >
          {loading ? 'Verificando...' : (
            <>
              <div className="bg-white p-1 rounded-full shadow-md group-hover:scale-110 transition-transform">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-7 h-7" />
              </div>
              <span className="text-sm uppercase tracking-widest font-black">Acessar Painel Master</span>
            </>
          )}
        </button>

        <div className="mt-4 p-4 bg-gold-500/5 rounded-xl border border-gold-500/10">
          <p className="text-[10px] text-gold-200/40 uppercase tracking-widest leading-relaxed">
            Se o login não abrir, verifique se o seu navegador bloqueou a janela pop-up. 
            Você deve permitir pop-ups para este site para completar a autenticação.
          </p>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="w-full mt-6 flex items-center justify-center gap-2 text-gold-200/40 hover:text-gold-400 text-xs font-bold uppercase tracking-widest transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao site
        </button>

        <div className="mt-8 flex items-center justify-center gap-2 text-gold-500/30 text-[10px] uppercase tracking-widest">
          <Lock className="w-3 h-3" /> Conexão Segura
        </div>
      </motion.div>
    </div>
  );
}
