import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Key, Landmark, ShieldCheck, ArrowRight, Chrome, Eye, EyeOff, Send, X } from 'lucide-react';
import { auth, db, loginWithGoogle, handleFirestoreError, OperationType } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { AnimatePresence } from 'motion/react';

export default function MemberLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestName, setRequestName] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [requestSending, setRequestSending] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const isMaster = ['lojaarcadaalianca34@gmail.com', 'sophiabohn@gmail.com'].includes(userCredential.user.email?.toLowerCase() || '');
      
      // Check if user exists in users collection
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        await auth.signOut();
        setError('Sua conta ainda não possui permissão de ingresso. Solicite autorização ou faça o cadastro via convite.');
        setLoading(false);
        return;
      }

      const fromObj = (location.state as any)?.from;
      const from = isMaster ? '/admin' : (
        fromObj 
          ? (fromObj.pathname + (fromObj.search || '') + (fromObj.hash || ''))
          : '/area-restrita'
      );
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Credenciais inválidas ou acesso recusado. Apenas membros autorizados podem acessar este oriente.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await loginWithGoogle();
      const user = result.user;
      
      // Check if user already exists as member
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      const isMaster = ['lojaarcadaalianca34@gmail.com', 'sophiabohn@gmail.com'].includes(user.email?.toLowerCase() || '');
      
      if (!userDoc.exists()) {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        
        if (adminDoc.exists() || isMaster) {
          // Admins/Masters are automatic members
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || (isMaster ? 'Mestre Sophia' : 'Ir. Administrador'),
            role: 'admin',
            createdAt: serverTimestamp()
          });
        } else {
          // ... rest of logic
          // Check if invited
          const inviteEmail = user.email?.toLowerCase().trim() || '';
          const inviteDoc = await getDoc(doc(db, 'invitations', inviteEmail));
          
          if (inviteDoc.exists() && inviteDoc.data().status !== 'ACCEPTED') {
            // Auto-register!
            await setDoc(doc(db, 'users', user.uid), {
              uid: user.uid,
              email: inviteEmail,
              displayName: user.displayName || 'Irmão',
              role: 'member',
              createdAt: serverTimestamp()
            });
            
            await updateDoc(doc(db, 'invitations', inviteEmail), {
              status: 'ACCEPTED',
              acceptedAt: serverTimestamp(),
              userId: user.uid
            });
          } else {
            await auth.signOut();
            setError(`O e-mail ${inviteEmail} não possui convite autorizado. Entre em contato com a secretaria.`);
            setLoading(false);
            return;
          }
        }
      }

      const fromObj = (location.state as any)?.from;
      const from = isMaster ? '/admin' : (
        fromObj 
          ? (fromObj.pathname + (fromObj.search || '') + (fromObj.hash || ''))
          : '/area-restrita'
      );
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Google login error:', err);
      setError('Falha ao conectar com Google. Verifique se pop-ups estão permitidos.');
      setLoading(false);
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestName || !requestEmail) return;
    
    setRequestSending(true);
    try {
      await addDoc(collection(db, 'membership_requests'), {
        name: requestName,
        email: requestEmail.toLowerCase().trim(),
        status: 'PENDING',
        createdAt: serverTimestamp()
      });
      setRequestSuccess(true);
      setTimeout(() => {
        setShowRequestModal(false);
        setRequestSuccess(false);
        setRequestName('');
        setRequestEmail('');
      }, 3000);
    } catch (err) {
      console.error('Error sending request:', err);
      setError('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setRequestSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-masonic-dark">
      <Navbar />
      <main className="pt-40 pb-20 px-6 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-10 bg-white md:bg-white/40 border border-[#0b1d3a]/10 rounded-[2.5rem] md:backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#c5a059]/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#c5a059]/5 rounded-full blur-3xl" />

          <div className="text-center mb-10 relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#0b1d3a]/5 border border-[#0b1d3a]/10 mb-6 text-[#0b1d3a]">
              <Lock className="w-10 h-10" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#0b1d3a] mb-2 uppercase tracking-tight">Área Restrita</h1>
            <p className="text-[#c5a059] text-xs uppercase tracking-[0.3em] font-bold">Somente para Obreiros da Arca</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] text-[#0b1d3a]/60 uppercase font-black tracking-widest ml-1 font-bold">E-mail de Cadastro</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b1d3a]/20" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/40 border border-[#0b1d3a]/10 p-4 pl-12 text-[#0b1d3a] rounded-xl focus:outline-none focus:border-[#c5a059] transition-all font-sans text-sm shadow-sm"
                  placeholder="Seu e-mail cadastrado"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-[#0b1d3a]/60 uppercase font-black tracking-widest ml-1 font-bold">Palavra de Passe</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b1d3a]/20" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/40 border border-[#0b1d3a]/10 p-4 pl-12 pr-12 text-[#0b1d3a] rounded-xl focus:outline-none focus:border-[#c5a059] transition-all font-sans text-sm shadow-sm"
                  placeholder="********"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0b1d3a]/20 hover:text-[#0b1d3a] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs text-center font-bold tracking-tight"
              >
                {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-between px-8 py-4 bg-[#0b1d3a] text-[#f4efe2] border border-[#c5a059]/30 font-black uppercase tracking-[0.15em] text-[10px] rounded-xl hover:bg-[#c5a059] transition-all shadow-xl hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>{loading ? 'Validando...' : 'Adentrar ao Templo'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="relative py-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#0b1d3a]/10"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#c5a059] text-[#0b1d3a] px-6 py-1.5 text-[14px] font-black tracking-normal shadow-lg rounded-full border border-white/20 transition-all">OU</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white/60 text-[#0b1d3a] font-black uppercase tracking-[0.1em] text-[12px] rounded-xl hover:bg-[#0b1d3a] hover:text-[#f4efe2] transition-all shadow-sm active:scale-[0.99] group border border-[#0b1d3a]/10"
            >
              <div className="bg-white p-0.5 rounded-full">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              </div>
              Entrar com conta Google
            </button>

            <div className="text-center pt-4">
              <p className="text-[#0b1d3a]/40 text-[10px] uppercase tracking-widest font-bold">
                Ainda não possui conta?
              </p>
              <div className="flex flex-col gap-2 mt-2">
                <Link 
                  to="/cadastro" 
                  className="text-[#c5a059] hover:text-[#0b1d3a] font-black text-[11px] uppercase tracking-[0.15em]"
                >
                  Fazer Cadastro Por Convite
                </Link>
                <button 
                  type="button"
                  onClick={() => setShowRequestModal(true)}
                  className="text-[#0b1d3a]/40 hover:text-[#c5a059] font-bold text-[10px] uppercase tracking-widest transition-colors"
                >
                  Não tenho convite, solicitar acesso
                </button>
              </div>
            </div>
          </form>

          {/* Request Access Modal */}
          <AnimatePresence>
            {showRequestModal && (
              <motion.div 
                key="request-access-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-masonic-dark/80 backdrop-blur-md flex items-center justify-center p-6"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-sm bg-white border border-[#0b1d3a]/10 p-8 rounded-[2rem] shadow-2xl relative"
                >
                  <button 
                    onClick={() => setShowRequestModal(false)}
                    className="absolute top-6 right-6 text-[#0b1d3a]/20 hover:text-[#0b1d3a] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#0b1d3a]/5 border border-[#0b1d3a]/10 flex items-center justify-center text-[#0b1d3a] mx-auto mb-4">
                      <Send className="w-8 h-8" />
                    </div>
                    <h3 className="font-serif text-2xl text-[#0b1d3a] uppercase tracking-widest mb-2 font-bold">Solicitar Acesso</h3>
                    <p className="text-[#0b1d3a]/40 text-[10px] uppercase tracking-widest leading-relaxed">
                      Seu pedido será enviado para a secretaria da loja para análise.
                    </p>
                  </div>

                  {requestSuccess ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-8"
                    >
                      <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <p className="text-[#0b1d3a] font-bold text-sm">Solicitação enviada com sucesso!</p>
                      <p className="text-[#0b1d3a]/40 text-[10px] mt-2 uppercase tracking-widest">Aguarde o contato por e-mail.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleRequestAccess} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] text-[#0b1d3a]/40 uppercase font-black tracking-widest ml-1 font-bold">Nome Completo</label>
                        <input 
                          type="text"
                          required
                          value={requestName}
                          onChange={e => setRequestName(e.target.value)}
                          className="w-full bg-white/40 border border-[#0b1d3a]/10 rounded-xl p-3 text-[#0b1d3a] text-sm focus:outline-none focus:border-[#c5a059]"
                          placeholder="Ir. Nome Completo"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-[#0b1d3a]/40 uppercase font-black tracking-widest ml-1 font-bold">E-mail para Contato</label>
                        <input 
                          type="email"
                          required
                          value={requestEmail}
                          onChange={e => setRequestEmail(e.target.value)}
                          className="w-full bg-white/40 border border-[#0b1d3a]/10 rounded-xl p-3 text-[#0b1d3a] text-sm focus:outline-none focus:border-[#c5a059]"
                          placeholder="seu@email.com"
                        />
                      </div>
                      <button 
                        disabled={requestSending}
                        className="w-full py-4 bg-[#0b1d3a] text-[#f4efe2] border border-[#c5a059]/30 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-[#c5a059] transition-all shadow-xl disabled:opacity-50 mt-4"
                      >
                        {requestSending ? 'Enviando...' : 'Enviar Solicitação de Ingresso'}
                      </button>
                    </form>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-center gap-2 text-[#0b1d3a]/20">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Acesso Criptografado e Monitorado</span>
          </div>
        </motion.div>

        <div className="mt-12 text-center max-w-xs">
          <p className="text-[#0b1d3a]/20 text-[10px] leading-relaxed uppercase tracking-widest italic font-bold">
            "Pedi, e dar-se-vos-á; buscai, e encontrareis; batei, e abrir-se-vos-á."
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
