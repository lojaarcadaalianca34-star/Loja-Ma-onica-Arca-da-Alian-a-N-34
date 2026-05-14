import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ProfessionalBoard from '../components/restricted/ProfessionalBoard';
import { 
  BookMarked, Lock, FileText, Download, Shield, Eye, LogOut, 
  Search, Filter, Plus, MessageSquare, Send, Share2, Clipboard, 
  X, Link as LinkIcon, Globe, File as FileIcon,
  Briefcase, Handshake, Users, Circle, UserCircle, Save, Camera,
  Calendar, Award, BookOpen, Star, ExternalLink, ShieldCheck
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { auth, logout, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useContent } from '../context/ContentContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  collection, query, orderBy, onSnapshot, addDoc, 
  serverTimestamp, deleteDoc, doc, Timestamp,
  limit, where, updateDoc, getDoc
} from 'firebase/firestore';

interface LibraryItem {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  description: string;
  fileType: string;
  url?: string;
  addedBy: string;
  addedByEmail?: string;
  createdAt: any;
}

interface Comment {
  id: string;
  itemId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: any;
}

export default function RestrictedLibraryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');
  
  const [activeMainTab, setActiveMainTab] = useState<'studies' | 'professional' | 'profile'>('studies');
  const [searchTerm, setSearchTerm] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const { content } = useContent();

  // Fetch Current User Data
  useEffect(() => {
    if (!auth.currentUser) return;
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setUserData(doc.data());
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Online Users
  useEffect(() => {
    const q = query(collection(db, 'users'), where('isOnline', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOnlineUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching online users:", error);
    });
    return () => unsubscribe();
  }, []);
  
  // Form State
  const [newItem, setNewItem] = useState({
    title: '',
    category: 'Estudos',
    author: '',
    date: new Date().getFullYear().toString(),
    description: '',
    fileType: 'LINK',
    url: ''
  });

  // Fetch Items
  useEffect(() => {
    const q = query(collection(db, 'library_items'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LibraryItem[];
      setItems(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'library_items');
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login-membro');
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      await addDoc(collection(db, 'library_items'), {
        ...newItem,
        addedBy: auth.currentUser.uid,
        addedByEmail: auth.currentUser.email,
        createdAt: serverTimestamp()
      });
      setShowAddModal(false);
      setNewItem({
        title: '',
        category: 'Estudos',
        author: '',
        date: new Date().getFullYear().toString(),
        description: '',
        fileType: 'LINK',
        url: ''
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'library_items');
    }
  };

  const handleShare = (item: LibraryItem) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?id=${item.id}`;
    const message = `Meus irmãos, estava lendo essa obra e desejo estudar com vcs, desejo saber o que pensam sobre.\n\n📚 *${item.title}*\n\nAcesse e comente aqui: ${shareUrl}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(message).then(() => {
      // Use fallback alert if window.open is blocked or fails
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      const newWin = window.open(whatsappUrl, '_blank');
      
      if (!newWin || newWin.closed || typeof newWin.closed=='undefined') {
        alert('Link copiado! Por favor, cole no grupo de WhatsApp da loja.');
      }
    });
  };

  const filteredItems = items.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-masonic-dark">
      <Navbar />
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-white uppercase tracking-wider">
                  Biblioteca <span className="gold-text">Restrita</span>
                </h1>
                <p className="text-gold-200/60 font-sans tracking-[0.2em] uppercase text-[9px] mt-1 font-bold">
                  Acesso exclusivo a Obreiros da Arte Real
                </p>
              </div>
            </motion.div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowOnlineUsers(!showOnlineUsers)}
                    className="relative p-3 bg-white/5 border border-white/10 rounded-2xl text-gold-500 hover:bg-white/10 transition-all group"
                  >
                    <Users className="w-5 h-5" />
                    {onlineUsers.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-masonic-dark text-[10px] flex items-center justify-center rounded-full font-black border-2 border-masonic-dark animate-pulse">
                        {onlineUsers.length}
                      </span>
                    )}
                    
                    {/* Floating Online List */}
                    <AnimatePresence>
                      {showOnlineUsers && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 top-full mt-4 w-64 bg-masonic-blue/95 backdrop-blur-xl border border-gold-500/30 rounded-2xl shadow-2xl z-50 p-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                            <h4 className="text-[10px] uppercase font-black tracking-widest text-gold-500">Irmãos Online</h4>
                            <span className="text-[8px] text-white/40 uppercase tracking-widest font-bold">{onlineUsers.length} Presentes</span>
                          </div>
                          <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                            {onlineUsers.length === 0 ? (
                              <p className="text-[10px] text-white/20 italic py-4 text-center">Nenhum irmão online no momento.</p>
                            ) : (
                              onlineUsers.map(user => (
                                <div key={user.id} className="flex items-center gap-3">
                                  <div className="relative">
                                    <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 text-[10px] font-bold border border-gold-500/20">
                                      {user.displayName?.[0]?.toUpperCase() || 'I'}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-masonic-blue shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                                  </div>
                                  <div className="overflow-hidden">
                                    <p className="text-white text-[11px] font-bold truncate leading-tight">{user.displayName || 'Irmão'}</p>
                                    <span className="text-[8px] text-gold-500/50 uppercase font-black tracking-widest block">{user.role}</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>

                  {auth.currentUser?.email?.toLowerCase() === 'lojaarcadaalianca34@gmail.com' && (
                    <button 
                      onClick={() => navigate('/admin')}
                      className="hidden md:flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-gold-500 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                    >
                      Painel Administrativo
                    </button>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gold-500 hover:text-gold-400 transition-colors uppercase tracking-[0.2em] text-[10px] font-black ml-4"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
          </div>

          {/* Mensagem de Boas-vindas (Pergaminho) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16 relative"
          >
            <div className="absolute inset-0 bg-[#fdf6e3] rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.4)] rotate-[-0.5deg]" />
            <div className="relative p-8 md:p-10 bg-[#f4e4bc] rounded-[2rem] border-2 border-[#d4b068] overflow-hidden">
              {/* Marca d'água discreta */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                <Shield className="w-[300px] h-[300px] text-[#8b5e34]" />
              </div>

              <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
                <h2 className="font-serif text-2xl md:text-3xl text-[#5d4037] font-bold italic tracking-tight">
                  Bem-vindo à nossa Coluna de Estudos Virtual
                </h2>
                
                <div className="h-px w-24 bg-[#d4b068] mx-auto" />

                <div className="font-serif text-[#5d4037]/90 text-base md:text-lg leading-relaxed space-y-4 text-justify italic">
                  <p>
                    Meus Irmãos, este espaço é uma extensão de nossa oficina, destinado ao polimento da Pedra Bruta através do estudo e do apoio mútuo. Como guardiões da Arca da Aliança, sabemos que a busca pela Verdade exige o livre debate de ideias.
                  </p>
                  
                  <p>
                    As divergências de opinião são o cinzel que aprimora o intelecto, mas lembramos que o desrespeito jamais terá assento entre nós. A honra de um Irmão, o respeito às nossas Cunhadas e a proteção de nossas famílias são valores inegociáveis, mesmo quando não estamos sob a vista física uns dos outros. Opiniões contrárias não justificam ataques pessoais ou posturas agressivas.
                  </p>
                  
                  <p className="font-bold">
                    Somos Maçons: que nossa conduta neste ambiente digital reflita a mesma retidão que praticamos em Loja. Que a Tolerância seja nossa bússola e a Fraternidade o nosso prumo.
                  </p>
                </div>

                <div className="flex justify-center gap-6 pt-2">
                  <div className="w-7 h-7 rounded-full border border-[#d4b068] flex items-center justify-center text-[#d4b068] text-[10px] font-serif font-bold">A</div>
                  <div className="w-7 h-7 rounded-full border border-[#d4b068] flex items-center justify-center text-[#d4b068] text-[10px] font-serif font-bold">N</div>
                  <div className="w-7 h-7 rounded-full border border-[#d4b068] flex items-center justify-center text-[#d4b068] text-[10px] font-serif font-bold">34</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Navigation Tabs */}
          <div className="flex gap-4 mb-12 border-b border-white/5 pb-1">
            <button 
              onClick={() => setActiveMainTab('studies')}
              className={`pb-4 px-6 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${activeMainTab === 'studies' ? 'text-gold-500' : 'text-white/30 hover:text-white'}`}
            >
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4" />
                Biblioteca de Estudos
              </div>
              {activeMainTab === 'studies' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-gold-500 shadow-[0_0_10px_rgba(230,176,0,0.5)]" />}
            </button>
            <button 
              onClick={() => setActiveMainTab('professional')}
              className={`pb-4 px-6 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${activeMainTab === 'professional' ? 'text-gold-500' : 'text-white/30 hover:text-white'}`}
            >
              <div className="flex items-center gap-2">
                <Handshake className="w-4 h-4" />
                Vamos nos Ajudar?
              </div>
              {activeMainTab === 'professional' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-gold-500 shadow-[0_0_10px_rgba(230,176,0,0.5)]" />}
            </button>
            <button 
              onClick={() => setActiveMainTab('profile')}
              className={`pb-4 px-6 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${activeMainTab === 'profile' ? 'text-gold-500' : 'text-white/30 hover:text-white'}`}
            >
              <div className="flex items-center gap-2">
                <UserCircle className="w-4 h-4" />
                Meus Dados
              </div>
              {activeMainTab === 'profile' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-gold-500 shadow-[0_0_10px_rgba(230,176,0,0.5)]" />}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeMainTab === 'studies' ? (
              <motion.div
                key="studies"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-10">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500/30 group-focus-within:text-gold-500 transition-colors" />
                    <input 
                      type="text"
                      placeholder="Buscar rituais, trabalhos ou documentos..."
                      className="w-full bg-masonic-blue/40 border border-white/5 rounded-2xl p-4 pl-12 text-white text-sm focus:outline-none focus:border-gold-500/50 transition-all placeholder:text-white/20"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-gold-500 text-masonic-dark rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gold-400 transition-all shadow-xl whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Obra
                  </button>
                </div>

                {/* Grid of Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <AnimatePresence mode="popLayout">
                    {filteredItems.map((item: LibraryItem, index: number) => (
                      <LibraryItemCard 
                        key={item.id} 
                        item={item} 
                        index={index} 
                        isHighlighted={highlightId === item.id}
                        isExpanded={expandedComments === item.id}
                        onToggleComments={() => setExpandedComments(expandedComments === item.id ? null : item.id)}
                        onShare={() => handleShare(item)}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {!loading && filteredItems.length === 0 && (
                  <div className="text-center py-20">
                     <BookMarked className="w-12 h-12 text-gold-500/20 mx-auto mb-4" />
                     <p className="text-gold-200/40 uppercase tracking-[0.2em] text-xs">Nenhum documento encontrado.</p>
                  </div>
                )}
              </motion.div>
            ) : activeMainTab === 'professional' ? (
              <motion.div
                key="professional"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-10 p-8 bg-gold-500/5 border border-gold-500/20 rounded-[2.5rem]">
                  <h2 className="text-2xl font-serif font-bold text-white mb-4 uppercase tracking-widest leading-tight">Cadastre sua Empresa /  <span className="gold-text">Produto / Serviço</span></h2>
                  <p className="text-gold-100/60 text-base leading-relaxed italic max-w-3xl">
                    "Um espaço para o auxílio mútuo e fomento da nossa própria rede de cooperação e fraternidade prática."
                    <br /><br />
                    Irmãos, a união faz a força. Este canal foi criado para fortalecermos nossos laços comerciais e profissionais, priorizando sempre o trabalho do Obreiro. Ao contratarmos uns aos outros, circulamos a riqueza dentro de nossa própria Arca e praticamos a verdadeira fraternidade econômica.
                  </p>
                </div>
                <ProfessionalBoard />
              </motion.div>
            ) : (
              <motion.div
                key="profile"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-masonic-blue/40 border border-white/5 rounded-[3rem] p-10 backdrop-blur-md shadow-2xl">
                  <div className="flex flex-col md:flex-row gap-10 items-start">
                    {/* Avatar and Basic Info */}
                    <div className="flex flex-col items-center gap-6 w-full md:w-64">
                      <div className="relative group">
                        <div className="w-40 h-40 rounded-[2.5rem] bg-gold-500/10 border-4 border-gold-500/20 overflow-hidden shadow-2xl">
                          {userData?.photoURL ? (
                            <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gold-500 text-6xl font-serif">
                              {userData?.displayName?.[0] || 'I'}
                            </div>
                          )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 p-3 bg-gold-500 text-masonic-dark rounded-2xl cursor-pointer shadow-xl hover:scale-110 transition-transform">
                          <Camera className="w-5 h-5" />
                          <input 
                            type="text" 
                            className="hidden" 
                            placeholder="URL da Foto"
                            onBlur={async (e) => {
                              if (!e.target.value) return;
                              await updateDoc(doc(db, 'users', auth.currentUser!.uid), { photoURL: e.target.value });
                            }}
                          />
                        </label>
                      </div>
                      <div className="text-center">
                        <h3 className="font-serif text-2xl font-bold gold-text uppercase tracking-widest">{userData?.displayName || 'Ir. Obreiro'}</h3>
                        <p className="text-white/40 text-[10px] uppercase font-black tracking-widest mt-1">{userData?.role} • Arca da Aliança nº 34</p>
                      </div>
                    </div>

                    {/* Editor Form */}
                    <div className="flex-1 space-y-8 w-full">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                           <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest ml-2">Nome de Obreiro</label>
                           <input 
                             className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold-500 transition-all"
                             value={userData?.displayName || ''}
                             onChange={async (e) => await updateDoc(doc(db, 'users', auth.currentUser!.uid), { displayName: e.target.value })}
                           />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest ml-2">Link Direto MVU (GLMDF)</label>
                           <div className="flex gap-2">
                             <input 
                               className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold-500 transition-all text-xs"
                               placeholder="Link do seu sistema de gestão..."
                               value={userData?.mvu_link || ''}
                               onChange={async (e) => await updateDoc(doc(db, 'users', auth.currentUser!.uid), { mvu_link: e.target.value })}
                             />
                             {userData?.mvu_link && (
                               <a href={userData.mvu_link} target="_blank" rel="noopener noreferrer" className="p-4 bg-gold-500/10 border border-gold-500/20 text-gold-500 rounded-xl hover:bg-gold-500/20 transition-all">
                                 <ExternalLink className="w-5 h-5" />
                               </a>
                             )}
                           </div>
                           <p className="text-[8px] text-white/20 italic ml-2 mt-1">Espaço reservado para adicionar o link direto do MVU para fácil acesso aos seus dados gerais na GLMDF.</p>
                         </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                           <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest ml-2">Profissão</label>
                           <input 
                             className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold-500 transition-all"
                             placeholder="Sua área de atuação..."
                             value={userData?.occupation || ''}
                             onChange={async (e) => await updateDoc(doc(db, 'users', auth.currentUser!.uid), { occupation: e.target.value })}
                           />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest ml-2">Empresa</label>
                           <input 
                             className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold-500 transition-all"
                             placeholder="Nome da sua empresa..."
                             value={userData?.company || ''}
                             onChange={async (e) => await updateDoc(doc(db, 'users', auth.currentUser!.uid), { company: e.target.value })}
                           />
                         </div>
                       </div>

                       <div className="p-6 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-center justify-between gap-6">
                         <p className="text-[11px] text-gold-100 font-bold uppercase tracking-wider">
                           Deseja cadastrar sua profissão ou empresa na nossa seção de classificados?
                         </p>
                         <button 
                           onClick={() => setActiveMainTab('professional')}
                           className="px-6 py-2 bg-gold-500 text-masonic-dark rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-gold-400 transition-all whitespace-nowrap"
                         >
                           Ir para Classificados
                         </button>
                       </div>

                       <div className="space-y-2">
                         <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest ml-2">Cargos e História na Oficina</label>
                         <textarea 
                           className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-gold-500 transition-all text-sm resize-none"
                           rows={4}
                           placeholder="Ex: Tesoureiro (2023-2025), Segundo Vigilante (2021)..."
                           value={userData?.roles_history || ''}
                           onChange={async (e) => await updateDoc(doc(db, 'users', auth.currentUser!.uid), { roles_history: e.target.value })}
                         />
                       </div>

                       <div className="bg-gold-500/5 border border-gold-500/10 p-8 rounded-[2rem] space-y-4">
                         <h4 className="text-xs gold-text font-black uppercase tracking-[0.2em] flex items-center gap-2">
                           <BookOpen className="w-4 h-4" /> Diário do Maçom: Metas e Desejos
                         </h4>
                         <p className="text-[10px] text-white/30 leading-relaxed">
                           Um espaço sagrado e pessoal para você registrar seus objetivos na vida maçônica, o que deseja aprender e como pretende contribuir com a Ordem este ano.
                         </p>
                         <textarea 
                           className="w-full bg-masonic-dark/50 border border-white/5 rounded-2xl p-6 text-white focus:outline-none focus:border-gold-500 transition-all text-sm italic"
                           rows={6}
                           placeholder="Minhas aspirações para evoluir em minha jornada..."
                           value={userData?.masonic_diary || ''}
                           onChange={async (e) => await updateDoc(doc(db, 'users', auth.currentUser!.uid), { masonic_diary: e.target.value })}
                         />
                         <div className="flex justify-end pt-2">
                           <div className="flex items-center gap-2 text-[8px] text-gold-500/40 uppercase font-black">
                             <ShieldCheck className="w-3 h-3" /> Auto-salvamento ativo no oriente
                           </div>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </main>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-masonic-dark/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-masonic-blue border border-gold-500/30 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold text-white uppercase tracking-wider">Expandir <span className="gold-text">Biblioteca</span></h2>
                <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddItem} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gold-500/60 ml-2">Título da Obra</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gold-500/50"
                      value={newItem.title}
                      onChange={e => setNewItem({...newItem, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gold-500/60 ml-2">Categoria</label>
                    <select 
                      className="w-full bg-masonic-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gold-500/50"
                      value={newItem.category}
                      onChange={e => setNewItem({...newItem, category: e.target.value})}
                    >
                      {content.librarySections?.map(section => (
                        <option key={section} value={section}>{section}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gold-500/60 ml-2">Autor</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gold-500/50"
                      value={newItem.author}
                      onChange={e => setNewItem({...newItem, author: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gold-500/60 ml-2">Tipo</label>
                    <select 
                      className="w-full bg-masonic-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gold-500/50"
                      value={newItem.fileType}
                      onChange={e => setNewItem({...newItem, fileType: e.target.value})}
                    >
                      <option value="LINK">Link Externo</option>
                      <option value="PDF">PDF</option>
                      <option value="DOC">Documento</option>
                      <option value="OTHER">Outro</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gold-500/60 ml-2">URL / Link do Arquivo</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                      type="url" 
                      placeholder="https://..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-gold-500/50"
                      value={newItem.url}
                      onChange={e => setNewItem({...newItem, url: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gold-500/60 ml-2">Breve Descrição</label>
                  <textarea 
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-gold-500/50 resize-none"
                    value={newItem.description}
                    onChange={e => setNewItem({...newItem, description: e.target.value})}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-gold-500 text-masonic-dark rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gold-400 transition-all shadow-xl"
                >
                  Confirmar Inclusão na Biblioteca
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

interface LibraryItemCardProps {
  key?: string;
  item: LibraryItem; 
  index: number; 
  isHighlighted: boolean;
  isExpanded: boolean;
  onToggleComments: () => void;
  onShare: () => void;
}

function LibraryItemCard({ 
  item, 
  index, 
  isHighlighted, 
  isExpanded, 
  onToggleComments, 
  onShare 
}: LibraryItemCardProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isExpanded) return;
    
    const q = query(
      collection(db, 'library_comments'), 
      where('itemId', '==', item.id),
      orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Comment[]);
    }, (error) => {
      console.error('Error fetching comments:', error);
    });

    return () => unsubscribe();
  }, [isExpanded, item.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !auth.currentUser || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'library_comments'), {
        itemId: item.id,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0],
        text: newComment,
        createdAt: serverTimestamp()
      });
      setNewComment('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'library_comments');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        borderColor: isHighlighted ? 'rgba(230, 176, 0, 0.5)' : 'transparent'
      }}
      className={`group relative p-[1px] bg-gradient-to-br from-gold-500/20 to-transparent rounded-[2rem] h-fit ${isHighlighted ? 'ring-2 ring-gold-500/50' : ''}`}
    >
      <div className="bg-masonic-blue p-8 rounded-[2rem] flex flex-col border border-white/5 hover:border-gold-500/30 transition-all shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
          <Lock className="w-20 h-20 text-gold-500" />
        </div>

        <div className="flex items-start justify-between mb-6">
          <div className="p-3 bg-gold-500/10 rounded-xl text-gold-500">
            {item.fileType === 'LINK' ? <Globe className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
          </div>
          <span className="px-3 py-1 bg-gold-500/10 border border-gold-500/20 rounded-full text-[9px] uppercase font-black text-gold-500 tracking-widest">
            {item.fileType}
          </span>
        </div>

        <h3 className="font-serif text-xl font-bold text-white mb-2 leading-tight group-hover:gold-text transition-colors">
          {item.title}
        </h3>
        <p className="text-gold-500/80 text-[10px] uppercase tracking-widest font-black mb-4">
          {item.category} • {item.date}
        </p>
        
        <p className="text-white/50 text-xs font-sans leading-relaxed mb-6 flex-1 italic">
          "{item.description || 'Sem descrição.'}"
        </p>

        <div className="flex flex-col gap-4">
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="text-[10px] text-white/30 uppercase tracking-widest">
              Por: <span className="text-white/60">{item.author || 'Membro Arca'}</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={onToggleComments}
                className="p-2 bg-white/5 border border-white/10 rounded-lg text-gold-500 hover:bg-gold-500 hover:text-masonic-dark transition-all relative"
              >
                <MessageSquare className="w-4 h-4" />
                {comments.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold-500 text-masonic-dark text-[8px] flex items-center justify-center rounded-full font-black">
                    {comments.length}
                  </span>
                )}
              </button>
              {item.url && (
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white/5 border border-white/10 rounded-lg text-gold-500 hover:bg-gold-500 hover:text-masonic-dark transition-all"
                >
                  <Eye className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <button 
            onClick={onShare}
            className="w-full flex items-center justify-center gap-3 py-4 bg-green-500/10 border border-green-500/30 text-green-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-masonic-dark transition-all shadow-lg"
          >
            <MessageSquare className="w-4 h-4" />
            Convidar Irmãos para Estudar (WhatsApp)
          </button>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 pt-6 border-t border-white/5 overflow-hidden"
            >
              <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-gold-500/60 mb-4">Diálogos de Estudo</h4>
              
              <div className="space-y-4 max-h-64 overflow-y-auto mb-4 pr-2 custom-scrollbar">
                {comments.length === 0 ? (
                  <p className="text-[10px] text-white/20 italic">Seja o primeiro a iniciar um estudo sobre esta obra...</p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-black text-gold-500 uppercase tracking-tighter">{comment.userName}</span>
                        <span className="text-[8px] text-white/20">
                          {comment.createdAt?.toDate().toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="relative">
                <input 
                  type="text"
                  placeholder="Escreva seu pensamento..."
                  className="w-full bg-masonic-dark border border-white/10 rounded-xl p-3 pr-12 text-xs text-white focus:outline-none focus:border-gold-500"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gold-500 hover:text-gold-400 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

