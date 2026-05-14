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
      const isMaster = userCredential.user.email?.toLowerCase() === 'lojaarcadaalianca34@gmail.com';
      
      // Check if user exists in users collection
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        await auth.signOut();
        setError('Sua conta ainda não possui permissão de ingresso. Solicite autorização ou faça o cadastro via convite.');
        setLoading(false);
        return;
      }

      const from = isMaster ? '/admin' : ((location.state as any)?.from?.pathname || '/biblioteca-restrita');
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
      
      const isMaster = user.email?.toLowerCase() === 'lojaarcadaalianca34@gmail.com';
      
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

      const from = isMaster ? '/admin' : ((location.state as any)?.from?.pathname || '/biblioteca-restrita');
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
          className="w-full max-w-md p-10 bg-masonic-blue/40 border border-gold-500/20 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gold-500/5 rounded-full blur-3xl" />

          <div className="text-center mb-10 relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gold-500/10 border border-gold-500/30 mb-6 text-gold-500">
              <Lock className="w-10 h-10" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-white mb-2 uppercase tracking-tight">Área Restrita</h1>
            <p className="text-gold-200/60 text-xs uppercase tracking-[0.3em]">Somente para Obreiros da Arca</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] text-gold-500/80 uppercase font-black tracking-widest ml-1">E-mail de Cadastro</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500/40" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border-b border-white/10 p-4 pl-12 text-white focus:outline-none focus:border-gold-500 transition-all font-sans"
                  placeholder="Seu e-mail cadastrado"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-gold-500/80 uppercase font-black tracking-widest ml-1">Palavra de Passe</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500/40" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border-b border-white/10 p-4 pl-12 pr-12 text-white focus:outline-none focus:border-gold-500 transition-all font-sans"
                  placeholder="********"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gold-500/40 hover:text-gold-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-bold tracking-tight"
              >
                {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-between px-6 py-3.5 bg-gold-500 text-masonic-dark font-black uppercase tracking-[0.15em] text-[10px] rounded-full hover:bg-gold-400 transition-all shadow-[0_0_20px_rgba(230,176,0,0.2)] hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>{loading ? 'Validando...' : 'Adentrar ao Templo'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="relative py-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gold-500/40"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gold-500 text-masonic-dark px-6 py-1.5 text-[14px] font-black tracking-normal shadow-[0_0_20px_rgba(230,176,0,0.5)] rounded-full border-2 border-white/20 transition-all">OU</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-masonic-dark font-black uppercase tracking-[0.1em] text-[12px] rounded-full hover:bg-gold-50 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-[0.99] group border-2 border-gold-500/30"
            >
              <div className="bg-white p-0.5 rounded-full">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              </div>
              Entrar com conta Google
            </button>

            <div className="text-center pt-4">
              <p className="text-gold-100/30 text-[10px] uppercase tracking-widest font-bold">
                Ainda não possui conta?
              </p>
              <div className="flex flex-col gap-2 mt-2">
                <Link 
                  to="/cadastro" 
                  className="text-gold-500 hover:text-gold-400 font-black text-[11px] uppercase tracking-[0.15em]"
                >
                  Fazer Cadastro Por Convite
                </Link>
                <button 
                  type="button"
                  onClick={() => setShowRequestModal(true)}
                  className="text-white/40 hover:text-gold-500 font-bold text-[10px] uppercase tracking-widest transition-colors"
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-masonic-dark/80 backdrop-blur-md flex items-center justify-center p-6"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-sm bg-masonic-blue/90 border border-gold-500/30 p-8 rounded-[2rem] shadow-2xl relative"
                >
                  <button 
                    onClick={() => setShowRequestModal(false)}
                    className="absolute top-6 right-6 text-gold-500/40 hover:text-gold-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500 mx-auto mb-4">
                      <Send className="w-8 h-8" />
                    </div>
                    <h3 className="font-serif text-2xl gold-text uppercase tracking-widest mb-2 font-bold">Solicitar Acesso</h3>
                    <p className="text-gold-100/40 text-[10px] uppercase tracking-widest leading-relaxed">
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
                      <p className="text-white font-bold text-sm">Solicitação enviada com sucesso!</p>
                      <p className="text-white/40 text-[10px] mt-2 uppercase tracking-widest">Aguarde o contato por e-mail.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleRequestAccess} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] text-gold-500/60 uppercase font-black tracking-widest ml-1">Nome Completo</label>
                        <input 
                          type="text"
                          required
                          value={requestName}
                          onChange={e => setRequestName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-gold-500"
                          placeholder="Ir. Nome Completo"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-gold-500/60 uppercase font-black tracking-widest ml-1">E-mail para Contato</label>
                        <input 
                          type="email"
                          required
                          value={requestEmail}
                          onChange={e => setRequestEmail(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-gold-500"
                          placeholder="seu@email.com"
                        />
                      </div>
                      <button 
                        disabled={requestSending}
                        className="w-full py-4 bg-gold-500 text-masonic-dark font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-gold-400 transition-all shadow-xl disabled:opacity-50 mt-4"
                      >
                        {requestSending ? 'Enviando...' : 'Enviar Solicitação de Ingresso'}
                      </button>
                    </form>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-center gap-2 text-gold-200/30">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Acesso Criptografado e Monitorado</span>
          </div>
        </motion.div>

        <div className="mt-12 text-center max-w-xs">
          <p className="text-gold-200/40 text-[10px] leading-relaxed uppercase tracking-widest italic">
            "Pedi, e dar-se-vos-á; buscai, e encontrareis; batei, e abrir-se-vos-á."
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
