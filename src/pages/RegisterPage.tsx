import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserPlus, User, Key, Mail, ShieldCheck, ArrowRight, ChevronLeft, Chrome, Eye, EyeOff } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType, loginWithGoogle } from '../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [personalNote, setPersonalNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check for invitation note when email changes
  React.useEffect(() => {
    const checkInvite = async () => {
      if (!email.includes('@') || email.length < 5) {
        setPersonalNote('');
        return;
      }
      try {
        const inviteDoc = await getDoc(doc(db, 'invitations', email.toLowerCase().trim()));
        if (inviteDoc.exists() && inviteDoc.data().personalMessage) {
          setPersonalNote(inviteDoc.data().personalMessage);
        } else {
          setPersonalNote('');
        }
      } catch (err) {
        console.error("Invite check error:", err);
      }
    };

    const timer = setTimeout(checkInvite, 800);
    return () => clearTimeout(timer);
  }, [email]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const inviteEmail = email.toLowerCase().trim();
      const inviteDoc = await getDoc(doc(db, 'invitations', inviteEmail));

      if (!inviteDoc.exists()) {
        setError('Este e-mail não possui convite autorizado. Entre em contato com a secretaria da loja.');
        setLoading(false);
        return;
      }

      if (inviteDoc.data().status === 'ACCEPTED') {
        setError('Este convite já foi utilizado para outro cadastro.');
        setLoading(false);
        return;
      }

      // Create user in Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Firebase Profile
      await updateProfile(user, { displayName });

      // Create User Record in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: inviteEmail,
        displayName,
        role: 'member',
        createdAt: serverTimestamp()
      });

      // Mark invitation as accepted
      await updateDoc(doc(db, 'invitations', inviteEmail), {
        status: 'ACCEPTED',
        acceptedAt: serverTimestamp(),
        userId: user.uid
      });

      navigate('/biblioteca-restrita');
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else {
        setError('Erro ao realizar cadastro. Tente novamente mais tarde.');
      }
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await loginWithGoogle();
      const user = result.user;
      
      const inviteEmail = user.email?.toLowerCase().trim() || '';
      const inviteDoc = await getDoc(doc(db, 'invitations', inviteEmail));

      if (!inviteDoc.exists()) {
        await auth.signOut();
        setError(`O e-mail ${inviteEmail} não possui convite autorizado. Entre em contato com a secretaria.`);
        setLoading(false);
        return;
      }

      // Check if user already exists as member
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
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
      }

      navigate('/biblioteca-restrita');
    } catch (err: any) {
      console.error('Google register error:', err);
      setError('Falha ao conectar com Google.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-masonic-dark">
      <Navbar />
      <main className="pt-40 pb-20 px-6 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl p-10 bg-masonic-blue/40 border border-gold-500/20 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gold-500/5 rounded-full blur-3xl" />
          
          <div className="mb-8">
            <Link to="/login-membro" className="inline-flex items-center gap-2 text-gold-500/60 hover:text-gold-500 transition-colors text-xs uppercase font-black">
              <ChevronLeft className="w-4 h-4" /> Voltar ao Login
            </Link>
          </div>

          <div className="text-center mb-10 relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gold-500/10 border border-gold-500/30 mb-6 text-gold-500">
              <UserPlus className="w-10 h-10" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-white mb-2 uppercase tracking-tight">Novo Cadastro</h1>
            <p className="text-gold-200/60 text-xs uppercase tracking-[0.3em]">Exclusivo para Irmãos Convidados</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] text-gold-500/80 uppercase font-black tracking-widest ml-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500/40" />
                  <input 
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-white/[0.03] border-b border-white/10 p-4 pl-12 text-white focus:outline-none focus:border-gold-500 transition-all font-sans text-sm"
                    placeholder="Nome do Irmão"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gold-500/80 uppercase font-black tracking-widest ml-1">E-mail Autorizado</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500/40" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border-b border-white/10 p-4 pl-12 text-white focus:outline-none focus:border-gold-500 transition-all font-sans text-sm"
                    placeholder="email@autorizado.com"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] text-gold-500/80 uppercase font-black tracking-widest ml-1">Crie uma Senha</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500/40" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border-b border-white/10 p-4 pl-12 pr-12 text-white focus:outline-none focus:border-gold-500 transition-all font-sans text-sm"
                    placeholder="Min. 6 caracteres"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gold-500/40 hover:text-gold-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gold-500/80 uppercase font-black tracking-widest ml-1">Confirme a Senha</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500/40" />
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border-b border-white/10 p-4 pl-12 pr-12 text-white focus:outline-none focus:border-gold-500 transition-all font-sans text-sm"
                    placeholder="Repita a senha"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gold-500/40 hover:text-gold-500 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {personalNote && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-gold-500/10 border border-gold-500/30 rounded-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                  <ShieldCheck className="w-12 h-12 text-gold-500" />
                </div>
                <p className="text-[10px] text-gold-500 uppercase font-black tracking-widest mb-2">Mensagem do Ir. Secretário</p>
                <p className="text-white/80 text-xs italic leading-relaxed">
                  "{personalNote}"
                </p>
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-bold"
              >
                {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-between px-8 py-5 bg-gold-500 text-masonic-dark font-black uppercase tracking-[0.2em] text-xs rounded-full hover:bg-gold-400 transition-all shadow-[0_0_30px_rgba(230,176,0,0.3)]"
            >
              <span>{loading ? 'Processando Cadastro...' : 'Solicitar Ingresso Restrito'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                <span className="bg-masonic-blue px-4 text-white/20">OU</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleRegister}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-white/5 text-white font-bold uppercase tracking-widest text-[10px] rounded-full border border-white/10 hover:bg-white/10 transition-all"
            >
              <Chrome className="w-4 h-4 text-gold-500" />
              Cadastrar com Google
            </button>
          </form>

          <div className="mt-10 flex items-center justify-center gap-2 text-gold-200/30">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Acesso Protegido por Convite Individual</span>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
