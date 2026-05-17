import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ProfessionalBoard from '../components/restricted/ProfessionalBoard';
import { 
  BookMarked, Lock, FileText, Download, Shield, Eye, LogOut, 
  Search, Filter, Plus, MessageSquare, Send, Share2, Clipboard, 
  X, Link as LinkIcon, Globe, File as FileIcon,
  Briefcase, Handshake, Users, Circle, UserCircle, Save, Camera,
  Calendar, Award, BookOpen, Star, ExternalLink, ShieldCheck,
  LayoutDashboard, Heart, Settings, AlertCircle, RefreshCw, Trash2
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
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

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

export default function MemberDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');
  
  const [activeTab, setActiveTab] = useState<'welcome' | 'library' | 'professional' | 'profile' | 'social'>('welcome');
  const [searchTerm, setSearchTerm] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const { content } = useContent();

  const isSuperAdmin = auth.currentUser?.email?.toLowerCase() === 'lojaarcadaalianca34@gmail.com' || 
    auth.currentUser?.email?.toLowerCase() === 'sophiabohn@gmail.com';
  const hasElevatedAccess = isSuperAdmin || 
    ['Venerável Mestre', 'Venerável', 'Tesoureiro', 'Secretário', 'Secretario'].some(role => 
      (userData?.currentRole || userData?.role || '').toLowerCase().includes(role.toLowerCase())
    );

  // Fetch Current User Data
  useEffect(() => {
    if (!auth.currentUser) return;
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    
    // Update online status and last seen
    updateDoc(userDocRef, { 
      isOnline: true, 
      lastSeen: serverTimestamp() 
    }).catch(console.error);

    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserData(data);
        // Recognition of first login to change status from Pending to Member
        if (data.status === 'PENDING') {
          updateDoc(userDocRef, { status: 'MEMBER' }).catch(console.error);
        }
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

  const [socialItems, setSocialItems] = useState<any[]>([]);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialType, setSocialType] = useState<'decision' | 'poll' | 'philanthropy'>('decision');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [isSubmittingSocial, setIsSubmittingSocial] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [newItemType, setNewItemType] = useState<'LINK' | 'PDF'>('LINK');

  // Fetch Library Items
  useEffect(() => {
    const q = query(collection(db, 'library_items'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LibraryItem[]);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'library_items');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Social Content
  useEffect(() => {
    const q = query(collection(db, 'social_actions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSocialItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'social_actions');
    });
    return () => unsubscribe();
  }, []);

  const handleVote = async (actionId: string, optionIndex: number) => {
    if (!auth.currentUser) return;
    const actionRef = doc(db, 'social_actions', actionId);
    try {
      const snap = await getDoc(actionRef);
      if (snap.exists()) {
        const data = snap.data();
        const votes = data.votes || {};
        const userId = auth.currentUser.uid;
        
        // Prevent double voting
        if (votes[userId] !== undefined) {
          alert('Você já votou nesta enquete.');
          return;
        }

        votes[userId] = optionIndex;
        const options = [...data.options];
        options[optionIndex].count = (options[optionIndex].count || 0) + 1;

        await updateDoc(actionRef, { votes, options });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'social_actions');
    }
  };

  const handleCreateSocialAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmittingSocial) return;
    setIsSubmittingSocial(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const baseData = {
        type: socialType,
        title: formData.get('title'),
        description: formData.get('description'),
        createdBy: auth.currentUser?.uid,
        creatorName: userData?.displayName || 'Irmão',
        createdAt: serverTimestamp(),
      };

      if (socialType === 'poll') {
        const filteredOptions = pollOptions.filter(o => o.trim() !== '').map(o => ({ text: o.trim(), count: 0 }));
        if (filteredOptions.length < 2) {
          alert('Por favor, adicione pelo menos 2 opções.');
          return;
        }
        await addDoc(collection(db, 'social_actions'), { ...baseData, options: filteredOptions, votes: {} });
      } else if (socialType === 'philanthropy') {
        await addDoc(collection(db, 'social_actions'), { 
          ...baseData, 
          goal: Number(formData.get('goal')),
          current: 0,
          deadline: formData.get('deadline')
        });
      } else {
        await addDoc(collection(db, 'social_actions'), baseData);
      }

      setShowSocialModal(false);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'social_actions');
    } finally {
      setIsSubmittingSocial(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login-membro');
  };

  const handleUpdatePhoto = () => {
    const url = prompt('Cole aqui o link direto da sua foto (Ex: ImgBB):', userData?.photoURL || '');
    if (url !== null) {
      updateDoc(doc(db, 'users', auth.currentUser!.uid), { photoURL: url }).catch(e => {
        handleFirestoreError(e, OperationType.UPDATE, 'users');
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!isSuperAdmin) return;
    if (window.confirm('Tem certeza que deseja excluir esta obra da biblioteca?')) {
      try {
        await deleteDoc(doc(db, 'library_items', itemId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'library_items');
      }
    }
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
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold text-white uppercase tracking-tight">
                  Templo <span className="gold-text">Restrito</span>
                </h1>
                <p className="text-gold-200/40 font-sans tracking-[0.2em] uppercase text-[9px] font-bold">
                  Bem-vindo de volta, Ir. {userData?.displayName || auth.currentUser?.email?.split('@')[0]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
               <button 
                onClick={() => setShowOnlineUsers(!showOnlineUsers)}
                className="relative p-3 bg-white/5 border border-white/10 rounded-2xl text-gold-500 hover:bg-white/10 transition-all group"
              >
                <Users className="w-5 h-5" />
                {onlineUsers.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-masonic-dark text-[10px] flex items-center justify-center rounded-full font-black border-2 border-masonic-dark animate-pulse">{onlineUsers.length}</span>}
                <AnimatePresence>
                  {showOnlineUsers && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-full mt-4 w-64 bg-masonic-blue/95 backdrop-blur-xl border border-gold-500/30 rounded-2xl shadow-2xl z-50 p-4">
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                        <h4 className="text-[10px] uppercase font-black tracking-widest text-gold-500">Irmãos Online</h4>
                      </div>
                      <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                        {onlineUsers.map(user => (
                          <div key={user.id} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 text-[10px] font-bold border border-gold-500/20">{user.displayName?.[0] || 'I'}</div>
                            <div className="overflow-hidden">
                              <p className="text-white text-[11px] font-bold truncate leading-tight">{user.displayName || 'Irmão'}</p>
                              <span className="text-[8px] text-gold-500/50 uppercase font-black tracking-widest block">{user.currentRole || user.role}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
              {isSuperAdmin && (
                <button onClick={() => navigate('/admin')} className="hidden md:flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-gold-500 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-white/10">
                  Painel Admin
                </button>
              )}
              <button onClick={handleLogout} className="flex items-center gap-2 text-gold-500 hover:text-gold-400 transition-colors uppercase tracking-[0.2em] text-[10px] font-black ml-4">
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-4 scrollbar-hide">
             {[
               { id: 'welcome', label: 'Início', icon: LayoutDashboard },
               { id: 'library', label: 'Biblioteca', icon: BookMarked },
               { id: 'professional', label: 'Vamos nos Ajudar?', icon: Handshake },
               { id: 'social', label: 'Painel de Decisões', icon: Heart },
               { id: 'profile', label: 'Meus Dados', icon: UserCircle }
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-gold-500 text-masonic-dark shadow-lg scale-105' : 'bg-white/5 text-gold-500/50 hover:bg-white/10 hover:text-gold-500'}`}
               >
                 <tab.icon className="w-4 h-4" />
                 {tab.label}
               </button>
             ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'welcome' && (
              <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#fdf6e3] rounded-[2rem] shadow-2xl rotate-[-0.5deg]" />
                  <div className="relative p-10 md:p-16 bg-[#f4e4bc] rounded-[2rem] border-2 border-[#d4b068] overflow-hidden text-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                      <Shield className="w-[400px] h-[400px] text-[#8b5e34]" />
                    </div>
                    <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                       <h2 className="font-serif text-3xl md:text-5xl text-[#5d4037] font-bold italic tracking-tight">Saudações Fraternais, Ir. {userData?.displayName?.split(' ')[0]}</h2>
                       <div className="h-px w-32 bg-[#d4b068] mx-auto" />
                       <div className="font-serif text-[#5d4037]/90 text-lg md:text-xl leading-relaxed italic text-justify space-y-6">
                          <p>Seja bem-vindo à Coluna de Estudos e Apoio da A.R.L.S. Arca da Aliança nº 34. Este ambiente digital foi erguido para que a nossa fraternidade não se limite apenas às nossas sessões físicas.</p>
                          <p>Aqui, o polimento da Pedra Bruta continua. Use as ferramentas à sua disposição com sabedoria, retidão e, acima de tudo, o respeito mútuo que caracteriza um verdadeiro Obreiro da Arte Real.</p>
                       </div>
                       <div className="pt-6 flex justify-center gap-8">
                          {['A', 'N', '34'].map(tag => (
                            <div key={tag} className="w-10 h-10 rounded-full border-2 border-[#d4b068] flex items-center justify-center text-[#d4b068] font-serif font-bold text-sm">{tag}</div>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                   <div className="bg-masonic-blue/40 p-8 rounded-[2rem] border border-white/5 hover:border-gold-500/30 transition-all cursor-pointer group" onClick={() => setActiveTab('library')}>
                      <BookMarked className="w-10 h-10 text-gold-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="text-white font-serif text-xl font-bold mb-2">Instrução</h3>
                      <p className="text-white/40 text-xs">Examine nossa biblioteca de rituais e trabalhos de pesquisa.</p>
                   </div>
                   <div className="bg-masonic-blue/40 p-8 rounded-[2rem] border border-white/5 hover:border-gold-500/30 transition-all cursor-pointer group" onClick={() => setActiveTab('professional')}>
                      <Handshake className="w-10 h-10 text-gold-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="text-white font-serif text-xl font-bold mb-2">Solidariedade</h3>
                      <p className="text-white/40 text-xs">Apoie o negócio dos irmãos e fortaleça nossa rede comercial.</p>
                   </div>
                   <div className="bg-masonic-blue/40 p-8 rounded-[2rem] border border-white/5 hover:border-gold-500/30 transition-all cursor-pointer group" onClick={() => setActiveTab('social')}>
                      <Heart className="w-10 h-10 text-gold-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="text-white font-serif text-xl font-bold mb-2">Justiça Social</h3>
                      <p className="text-white/40 text-xs">Participe das decisões sobre nossas ações de filantropia.</p>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'library' && (
              <motion.div key="library" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex flex-col md:flex-row gap-6 mb-8 items-center">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500/30 group-focus-within:text-gold-500 transition-colors" />
                    <input type="text" placeholder="Buscar estudos, rituais..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white text-sm focus:border-gold-500/50" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-8 py-4 bg-gold-500 text-masonic-dark rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gold-400">
                    <Plus className="w-4 h-4" /> Adicionar Obra
                  </button>
                </div>

                {/* Bibliotecas Públicas */}
                <div className="mb-10 p-6 bg-gold-500/5 border border-gold-500/20 rounded-3xl">
                   <div className="flex items-center gap-3 mb-4">
                      <BookOpen className="text-gold-500 w-5 h-5" />
                      <h4 className="text-white font-serif text-lg font-bold uppercase tracking-widest">Bibliotecas Digitais Públicas</h4>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(content.publicLibraries || [
                        { name: "Biblioteca Nacional Digital", url: "https://bndigital.bn.gov.br/" },
                        { name: "Domínio Público", url: "http://www.dominiopublico.gov.br/" }
                      ]).map((lib: any, i: number) => (
                        <a key={i} href={lib.url} target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between group hover:border-gold-500/50 transition-all">
                           <span className="text-white/70 text-xs font-bold">{lib.name}</span>
                           <ExternalLink className="w-4 h-4 text-gold-500 opacity-30 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredItems.map((item, index) => (
                    <LibraryItemCard 
                      key={item.id} 
                      item={item} 
                      index={index} 
                      isHighlighted={highlightId === item.id}
                      isExpanded={expandedComments === item.id}
                      onToggleComments={() => setExpandedComments(expandedComments === item.id ? null : item.id)}
                      onShare={() => {
                        const message = `📚 *${item.title}*\n\nMeus irmãos, desejo compartilhar este estudo com vocês.\nLink: ${window.location.origin}/biblioteca-restrita?id=${item.id}`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                      onDelete={isSuperAdmin ? () => handleDeleteItem(item.id) : undefined}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'professional' && (
              <motion.div key="professional" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <ProfessionalBoard />
              </motion.div>
            )}

            {activeTab === 'social' && (
              <motion.div key="social" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8">
                 <div className="p-10 bg-masonic-blue/40 border border-white/5 rounded-[3.5rem] backdrop-blur-md">
                    <div className="flex flex-col md:flex-row gap-10 items-center mb-10">
                       <div className="w-24 h-24 rounded-3xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500 flex-shrink-0">
                          <Heart className="w-12 h-12" />
                       </div>
                       <div className="flex-1">
                          <h2 className="text-3xl font-serif text-white font-bold mb-2 uppercase tracking-widest">Painel de Decisões e <span className="gold-text">Ações Sociais</span></h2>
                          <p className="text-gold-100/40 text-sm italic font-serif leading-relaxed">"Onde a luz da sabedoria guia o braço da caridade." • Este espaço é destinado à deliberação sobre nossas obras de assistência, suporte a instituições e auxílio a necessitados.</p>
                       </div>
                       {hasElevatedAccess && (
                         <div className="flex gap-2">
                           <button onClick={() => { setSocialType('poll'); setShowSocialModal(true); }} className="px-6 py-3 bg-white/5 border border-white/10 text-gold-500 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all">Nova Enquete</button>
                           <button onClick={() => { setSocialType('philanthropy'); setShowSocialModal(true); }} className="px-6 py-3 bg-gold-500 text-masonic-dark rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-gold-400 transition-all">Nova Filantropia</button>
                         </div>
                       )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {socialItems.map((action) => (
                         <div key={action.id} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:border-gold-500/30 transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                               <div className="flex flex-col gap-1">
                                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] w-fit ${
                                    action.type === 'poll' ? 'bg-blue-500/20 text-blue-400' : 
                                    action.type === 'philanthropy' ? 'bg-green-500/20 text-green-400' : 
                                    'bg-gold-500/20 text-gold-500'
                                  }`}>
                                    {action.type === 'poll' ? 'Enquete' : action.type === 'philanthropy' ? 'Arrecadação' : 'Decisão'}
                                  </span>
                                  <p className="text-[8px] text-white/30 uppercase font-black tracking-widest mt-1">Por: {action.creatorName}</p>
                               </div>
                               {action.type === 'philanthropy' && (
                                 <p className="text-gold-500 font-bold text-xs">Meta: R$ {action.goal?.toLocaleString()}</p>
                               )}
                            </div>

                            <h3 className="text-white font-serif text-xl font-bold mb-3 group-hover:gold-text transition-colors">{action.title}</h3>
                            <p className="text-white/40 text-[11px] mb-6 italic leading-relaxed">{action.description}</p>

                            {action.type === 'poll' && (
                              <div className="space-y-3 mb-6">
                                {action.options?.map((opt: any, i: number) => {
                                  const totalVotes = action.options.reduce((acc: number, cur: any) => acc + (cur.count || 0), 0);
                                  const percentage = totalVotes > 0 ? Math.round((opt.count / totalVotes) * 100) : 0;
                                  const hasVoted = action.votes?.[auth.currentUser?.uid || ''] !== undefined;

                                  return (
                                    <button 
                                      key={i}
                                      onClick={() => handleVote(action.id, i)}
                                      disabled={hasVoted}
                                      className={`w-full group/btn relative overflow-hidden p-3 rounded-xl border transition-all text-left ${
                                        hasVoted && action.votes![auth.currentUser!.uid] === i 
                                          ? 'bg-gold-500/20 border-gold-500/50' 
                                          : 'bg-white/5 border-white/10 hover:border-gold-500/30'
                                      }`}
                                    >
                                      <div className="absolute inset-y-0 left-0 bg-gold-500/10 transition-transform origin-left duration-700" style={{ transform: `scaleX(${percentage / 100})`, width: '100%' }} />
                                      <div className="relative flex justify-between items-center text-[11px]">
                                        <span className="text-white font-bold">{opt.text}</span>
                                        <span className="text-gold-500 font-black">{percentage}%</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {action.type === 'philanthropy' && (
                              <div className="space-y-4 mb-6">
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                  <motion.div 
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400" 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (action.current / action.goal) * 100)}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                  <span className="text-green-500">Arrecadado: R$ {action.current?.toLocaleString()}</span>
                                  <span className="text-white/40">Faltam: R$ {Math.max(0, action.goal - (action.current || 0)).toLocaleString()}</span>
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2">
                               {hasElevatedAccess && (
                                 <button 
                                   onClick={() => {
                                     import('jspdf').then(({ jsPDF }) => {
                                       const doc = new jsPDF();
                                       doc.setFont('helvetica', 'bold');
                                       doc.text(`RESULTADOS: ${action.title}`, 20, 20);
                                       doc.setFont('helvetica', 'normal');
                                       doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
                                       doc.text(`Descrição: ${action.description}`, 20, 40);
                                       
                                       let y = 60;
                                       if (action.type === 'poll') {
                                         doc.text('VOTACAO:', 20, y);
                                         y += 10;
                                         action.options.forEach((opt: any) => {
                                           doc.text(`${opt.text}: ${opt.count} votos`, 20, y);
                                           y += 10;
                                         });
                                       } else if (action.type === 'philanthropy') {
                                         doc.text('FINANCEIRO:', 20, y);
                                         y += 10;
                                         doc.text(`Meta: R$ ${action.goal}`, 20, y);
                                         y += 10;
                                         doc.text(`Arrecadado: R$ ${action.current}`, 20, y);
                                       }
                                       
                                       doc.save(`resultado-${action.id}.pdf`);
                                     });
                                   }}
                                   className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-gold-500 font-black uppercase text-[9px] tracking-widest hover:bg-gold-500 hover:text-masonic-dark transition-all"
                                 >
                                    Imprimir Resultados
                                 </button>
                               )}
                               <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white/40 font-black uppercase text-[9px] tracking-widest hover:text-white transition-all">Detalhes</button>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-4xl mx-auto space-y-8">
                 <div className="bg-masonic-blue/40 border border-white/5 rounded-[3rem] p-10 backdrop-blur-md shadow-2xl">
                    <div className="flex flex-col md:flex-row gap-10 items-start">
                      <div className="flex flex-col items-center gap-6 w-full md:w-64">
                         <div className="relative">
                            <div className="w-40 h-56 rounded-[2rem] bg-gold-500/10 border-4 border-gold-500/20 overflow-hidden shadow-2xl relative">
                               {userData?.photoURL ? (
                                 <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-gold-500 text-6xl font-serif">
                                   {userData?.displayName?.[0] || 'I'}
                                 </div>
                               )}
                               <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-center">
                                 <p className="text-[7px] uppercase font-bold text-white/40">Aspecto 3x4</p>
                               </div>
                            </div>
                            <button onClick={handleUpdatePhoto} className="absolute -bottom-2 -right-2 p-3 bg-gold-500 text-masonic-dark rounded-2xl cursor-pointer shadow-xl hover:scale-110 transition-transform">
                               <Camera className="w-5 h-5" />
                            </button>
                         </div>
                         <div className="text-center">
                            <h3 className="font-serif text-2xl font-bold gold-text uppercase tracking-widest">{userData?.displayName || 'Ir. Obreiro'}</h3>
                            <p className="text-white font-black tracking-widest text-[10px] uppercase mt-1">{userData?.currentRole || userData?.role || 'Membro'}</p>
                            <p className="text-white/40 text-[8px] uppercase font-bold tracking-widest">Arca da Aliança nº 34</p>
                         </div>
                      </div>

                      <div className="flex-1 space-y-6 w-full">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest ml-2">Nome de Obreiro</label>
                               <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-gold-500 outline-none" value={userData?.displayName || ''} onChange={async e => await updateDoc(doc(db, 'users', auth.currentUser!.uid), { displayName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest ml-2">Cargo Atual (Oficial)</label>
                               <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white/50 text-sm italic flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-gold-500" />
                                  {userData?.currentRole || userData?.role || 'Membro'}
                               </div>
                               <p className="text-[8px] text-gold-500/40 italic ml-2 mt-1">Apenas o Administrador Master pode alterar este cargo oficial.</p>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest ml-2">Profissão</label>
                               <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-gold-500 outline-none" placeholder="Sua ocupação..." value={userData?.occupation || ''} onChange={async e => await updateDoc(doc(db, 'users', auth.currentUser!.uid), { occupation: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest ml-2">Link MVU (GLMDF)</label>
                               <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-gold-500 outline-none text-xs" placeholder="https://..." value={userData?.mvu_link || ''} onChange={async e => await updateDoc(doc(db, 'users', auth.currentUser!.uid), { mvu_link: e.target.value })} />
                            </div>
                         </div>

                         <div className="space-y-2">
                            <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest ml-2">Histórico na Ordem (Graus, Iniciação, Elevação)</label>
                            <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-gold-500 outline-none text-sm resize-none" rows={4} placeholder="Conte sua história..." value={userData?.masonic_history || userData?.roles_history || ''} onChange={async e => await updateDoc(doc(db, 'users', auth.currentUser!.uid), { masonic_history: e.target.value })} />
                         </div>

                         <div className="pt-6 flex justify-end">
                            <div className="flex items-center gap-2 text-[9px] text-gold-500 uppercase font-black">
                               <ShieldCheck className="w-4 h-4" /> Auto-salvamento ativo
                            </div>
                         </div>
                      </div>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-masonic-dark/95 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-masonic-blue border border-gold-500/30 rounded-[2.5rem] shadow-2xl overflow-hidden p-8">
               <h2 className="font-serif text-2xl font-bold text-white mb-8 border-b border-white/5 pb-4 uppercase tracking-widest">Adicionar <span className="gold-text">Nova Obra</span></h2>
               <form className="space-y-6" onSubmit={async e => {
                 e.preventDefault();
                 if (uploadProgress !== null) return;
                 
                 const data = new FormData(e.currentTarget);
                 const file = (e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement)?.files?.[0];
                 
                 try {
                   let finalUrl = data.get('url') as string;
                   
                   if (newItemType === 'PDF' && file) {
                     // Handle file upload
                     const storageRef = ref(storage, `library/${Date.now()}_${file.name}`);
                     const uploadTask = uploadBytesResumable(storageRef, file);
                     
                     finalUrl = await new Promise((resolve, reject) => {
                       uploadTask.on('state_changed', 
                         (snapshot) => {
                           const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                           setUploadProgress(progress);
                         },
                         reject,
                         async () => {
                           const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                           resolve(downloadURL);
                         }
                       );
                     });
                   }

                   await addDoc(collection(db, 'library_items'), {
                     title: data.get('title'),
                     category: data.get('category'),
                     author: data.get('author'),
                     description: data.get('description'),
                     url: finalUrl,
                     fileType: newItemType,
                     type: newItemType === 'PDF' ? 'pdf' : 'link',
                     addedBy: auth.currentUser!.uid,
                     addedByEmail: auth.currentUser!.email,
                     createdAt: serverTimestamp()
                   });
                   setShowAddModal(false);
                   setUploadProgress(null);
                 } catch (e) {
                   handleFirestoreError(e, OperationType.CREATE, 'library_items');
                   setUploadProgress(null);
                 }
               }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest ml-1">Título</label>
                      <input name="title" required placeholder="Título da Obra" className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500/50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest ml-1">Categoria</label>
                      <select name="category" className="w-full bg-masonic-dark border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500/50">
                         {content.librarySections?.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest ml-1">Autor</label>
                      <input name="author" placeholder="Autor" className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500/50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest ml-1">Tipo de Arquivo</label>
                      <select 
                        name="fileType" 
                        className="w-full bg-masonic-dark border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500/50"
                        value={newItemType}
                        onChange={(e) => setNewItemType(e.target.value as any)}
                      >
                        <option value="LINK">Link Externo</option>
                        <option value="PDF">Arquivo PDF</option>
                      </select>
                    </div>
                  </div>

                  {newItemType === 'LINK' ? (
                    <div className="space-y-1">
                      <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest ml-1">Endereço (URL)</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input name="url" placeholder="https://..." className="w-full bg-white/5 border border-white/10 p-3 pl-10 rounded-lg text-white outline-none focus:border-gold-500/50" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest ml-1">Documento PDF</label>
                      <div className="relative">
                        <input 
                          type="file" 
                          accept=".pdf" 
                          className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-gold-500/50 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-gold-500 file:text-masonic-dark hover:file:bg-gold-400" 
                        />
                        {uploadProgress !== null && (
                          <div className="absolute inset-0 bg-masonic-blue/80 flex items-center justify-center rounded-lg">
                            <span className="text-gold-500 font-black">{Math.round(uploadProgress)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest ml-1">Descrição</label>
                    <textarea name="description" rows={3} placeholder="Breve descrição ou objetivo da obra" className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white resize-none outline-none focus:border-gold-500/50" />
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={uploadProgress !== null}
                    className="w-full py-4 bg-gold-500 text-masonic-dark rounded-xl font-black uppercase tracking-widest hover:bg-gold-400 disabled:opacity-50 shadow-xl transition-all"
                  >
                    {uploadProgress !== null ? 'Enviando Arquivo...' : 'Consolidar Obra'}
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Social Modal */}
      <AnimatePresence>
        {showSocialModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSocialModal(false)} className="absolute inset-0 bg-masonic-dark/95 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-xl bg-masonic-blue border border-gold-500/30 rounded-[2.5rem] shadow-2xl overflow-hidden p-8">
               <h2 className="font-serif text-2xl font-bold text-white mb-8 border-b border-white/5 pb-4 uppercase tracking-widest">
                 Nova {socialType === 'poll' ? 'Enquete' : socialType === 'philanthropy' ? 'Arrecadação' : 'Pauta'}
               </h2>
               <form className="space-y-6" onSubmit={handleCreateSocialAction}>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest">Título da Ação</label>
                    <input name="title" required className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest">Descrição / Objetivo</label>
                    <textarea name="description" rows={3} required className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white resize-none" />
                  </div>
                  
                  {socialType === 'poll' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest ml-1">Opções da Votação</label>
                        <span className="text-[8px] text-white/30 uppercase font-bold tracking-widest">Pressione Enter para nova opção</span>
                      </div>
                      <div className="space-y-3">
                        {pollOptions.map((option, index) => (
                          <div key={index} className="flex gap-2 group/opt">
                            <div className="w-8 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-[10px] text-gold-500/30 font-black font-mono">
                              {index + 1}
                            </div>
                            <input 
                              required
                              placeholder={`Ex: Opção ${index + 1}`}
                              className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-gold-500/50 transition-all"
                              value={option}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  setPollOptions([...pollOptions, '']);
                                }
                              }}
                              onChange={e => {
                                const newOptions = [...pollOptions];
                                newOptions[index] = e.target.value;
                                setPollOptions(newOptions);
                              }}
                              autoFocus={index === pollOptions.length - 1 && index > 1}
                            />
                            <button 
                              type="button"
                              onClick={() => {
                                if (pollOptions.length > 2) {
                                  setPollOptions(pollOptions.filter((_, i) => i !== index));
                                } else {
                                  const newOptions = [...pollOptions];
                                  newOptions[index] = '';
                                  setPollOptions(newOptions);
                                }
                              }}
                              className={`p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all ${pollOptions.length <= 1 ? 'opacity-20 cursor-not-allowed' : ''}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button 
                          type="button"
                          onClick={() => setPollOptions([...pollOptions, ''])}
                          className="w-full py-3 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center gap-2 text-gold-500/40 hover:text-gold-500 hover:border-gold-500/20 hover:bg-gold-500/5 transition-all text-[10px] uppercase font-black tracking-widest"
                        >
                          <Plus className="w-4 h-4" /> Adicionar Outra Opção
                        </button>
                      </div>
                    </div>
                  )}

                  {socialType === 'philanthropy' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest">Meta Financeira (R$)</label>
                        <input name="goal" type="number" required className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest">Data Limite</label>
                        <input name="deadline" type="date" className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white" />
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={isSubmittingSocial} className="w-full py-4 bg-gold-500 text-masonic-dark rounded-xl font-black uppercase tracking-widest disabled:opacity-50">
                    {isSubmittingSocial ? 'Processando...' : 'Publicar no Painel'}
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LibraryItemCard({ item, index, isHighlighted, isExpanded, onToggleComments, onShare, onDelete }: any) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isExpanded) return;
    const q = query(collection(db, 'library_comments'), where('itemId', '==', item.id), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Comment[]);
    }, console.error);
    return () => unsubscribe();
  }, [isExpanded, item.id]);

  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`bg-masonic-blue p-8 rounded-[2rem] border ${isHighlighted ? 'border-gold-500' : 'border-white/5'} relative flex flex-col group transition-all hover:border-gold-500/30 shadow-2xl`}>
      {onDelete && (
        <button onClick={onDelete} className="absolute top-4 right-4 text-red-500/40 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
      )}
      <div className="flex items-start justify-between mb-6">
        <div className="p-3 bg-gold-500/10 rounded-xl text-gold-500 shadow-inner"><BookOpen className="w-6 h-6" /></div>
        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 border border-white/10 rounded-full text-gold-500">{item.fileType}</span>
      </div>
      <h3 className="font-serif text-xl font-bold text-white mb-2 leading-tight group-hover:gold-text transition-colors">{item.title}</h3>
      <p className="text-gold-500/80 text-[10px] uppercase tracking-widest font-black mb-4">{item.category}</p>
      <p className="text-white/40 text-xs italic leading-relaxed mb-8 flex-1">"{item.description || "Sem descrição disponível."}"</p>
      
      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
         <span className="text-[9px] text-white/30 uppercase font-black uppercase tracking-widest">Por: {item.author || "Anônimo"}</span>
         <div className="flex gap-2">
            <button onClick={onToggleComments} className="p-2 bg-white/5 border border-white/10 rounded-lg text-gold-500 hover:bg-gold-500 hover:text-masonic-dark transition-all relative">
               <MessageSquare className="w-4 h-4" />
               {comments.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold-500 text-masonic-dark text-[8px] flex items-center justify-center rounded-full font-black">{comments.length}</span>}
            </button>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 border border-white/10 rounded-lg text-gold-500 hover:bg-gold-500 hover:text-masonic-dark transition-all"><Eye className="w-4 h-4" /></a>
         </div>
      </div>
      <button onClick={onShare} className="mt-4 w-full flex items-center justify-center gap-2 py-4 bg-green-500/10 border border-green-500/30 text-green-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all"><MessageSquare className="w-4 h-4" /> Compartilhar Estudo</button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="mt-6 pt-6 border-t border-white/5 overflow-hidden">
             <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar mb-4">
                {comments.map(c => (
                  <div key={c.id} className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[9px] font-black text-gold-500 uppercase tracking-tighter mb-1">{c.userName}</p>
                    <p className="text-xs text-white/70">{c.text}</p>
                  </div>
                ))}
             </div>
             <form className="relative" onSubmit={async e => {
               e.preventDefault();
               if (!newComment.trim() || isSubmitting) return;
               setIsSubmitting(true);
               try {
                 await addDoc(collection(db, 'library_comments'), { itemId: item.id, userId: auth.currentUser!.uid, userName: auth.currentUser!.displayName || 'Irmão', text: newComment, createdAt: serverTimestamp() });
                 setNewComment('');
               } finally { setIsSubmitting(false); }
             }}>
                <input className="w-full bg-masonic-dark border border-white/10 p-3 rounded-xl text-xs text-white" placeholder="Sua contribuição..." value={newComment} onChange={e => setNewComment(e.target.value)} />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gold-500"><Send className="w-4 h-4" /></button>
             </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
