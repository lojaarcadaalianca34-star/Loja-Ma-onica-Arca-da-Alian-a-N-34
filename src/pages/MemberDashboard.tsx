import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ProfessionalBoard from '../components/restricted/ProfessionalBoard';
import { 
  BookMarked, Lock, FileText, Download, Shield, Eye, LogOut, 
  Search, Filter, Plus, MessageSquare, Send, Share2, Clipboard, 
  X, Link as LinkIcon, Globe, File as FileIcon,
  Briefcase, Handshake, Users, Circle, UserCircle, Save, Camera,
  Calendar, Award, BookOpen, Star, ExternalLink, ShieldCheck,
  LayoutDashboard, Heart, Settings, AlertCircle, RefreshCw, Trash2,
  Building, ChevronDown, Edit
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

export default function MemberDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetUid = searchParams.get('uid');
  
  const [activeTab, setActiveTab] = useState<'welcome' | 'library' | 'professional' | 'profile' | 'social' | 'members'>('welcome');
  const [searchTerm, setSearchTerm] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [targetMemberData, setTargetMemberData] = useState<any>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    displayName: '',
    occupation: '',
    mvu_link: '',
    masonic_history: '',
    photoURL: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const { content } = useContent();

  const [recentProfessional, setRecentProfessional] = useState<any[]>([]);
  const [discussedLibrary, setDiscussedLibrary] = useState<any[]>([]);

  const isSuperAdmin = auth.currentUser?.email?.toLowerCase() === 'lojaarcadaalianca34@gmail.com' || 
    auth.currentUser?.email?.toLowerCase() === 'sophiabohn@gmail.com';

  const hasElevatedAccess = isSuperAdmin || 
    ['Venerável Mestre', 'Venerável', 'Tesoureiro', 'Secretário', 'Secretario', 'Hospitaleiro'].some(role => 
      (userData?.currentRole || userData?.role || '').toLowerCase().includes(role.toLowerCase())
    );

  // Fetch Recent Professional Board
  useEffect(() => {
    const q = query(collection(db, 'professional_board'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecentProfessional(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Fetch Discussed Library Items
  useEffect(() => {
    const q = query(collection(db, 'library_items'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDiscussedLibrary(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const RecentProfessionalFeed = () => (
    <div className="space-y-4">
      {recentProfessional.length === 0 && <p className="text-[10px] text-[#0b1d3a]/30 uppercase italic">Nenhuma atividade recente</p>}
      {recentProfessional.map(item => (
        <div key={item.id} className="p-4 bg-white/60 border border-[#0b1d3a]/5 rounded-2xl flex items-center gap-4 group cursor-pointer hover:border-[#c5a059]/30 transition-all" onClick={() => setActiveTab('professional')}>
          <div className="w-10 h-10 rounded-xl bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059]">
            {item.type === 'SERVICE' ? <Building className="w-5 h-5" /> : item.type === 'JOB' ? <Briefcase className="w-5 h-5" /> : <UserCircle className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[#0b1d3a] truncate">{item.title}</h4>
            <p className="text-[8px] text-[#0b1d3a]/60 uppercase font-black tracking-widest">{item.company || item.authorName} • {item.type}</p>
          </div>
          <div className="text-[#c5a059]">
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      ))}
    </div>
  );

  const LibraryDiscussionFeed = () => (
    <div className="space-y-4">
      {discussedLibrary.length === 0 && <p className="text-[10px] text-[#0b1d3a]/30 uppercase italic">Nenhum debate recente</p>}
      {discussedLibrary.map(item => (
        <div key={item.id} className="p-4 bg-white/60 border border-[#0b1d3a]/5 rounded-2xl flex items-center gap-4 group cursor-pointer hover:border-[#c5a059]/30 transition-all" onClick={() => setActiveTab('library')}>
          <div className="w-10 h-10 rounded-xl bg-[#0b1d3a]/5 flex items-center justify-center text-[#0b1d3a]">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[#0b1d3a] truncate">{item.title}</h4>
            <div className="flex items-center gap-1">
              <p className="text-[8px] text-[#c5a059] uppercase font-black tracking-widest">Debates abertos por:</p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.addedBy) {
                    navigate(`/area-restrita?uid=${item.addedBy}&tab=profile`);
                  }
                }}
                className="text-[8px] text-[#0b1d3a] uppercase font-black tracking-widest hover:underline hover:text-[#c5a059] transition-all"
              >
                {item.author || 'Membro'}
              </button>
            </div>
          </div>
          <div className="text-[#c5a059]">
            <ChevronDown className="w-4 h-4 -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      ))}
    </div>
  );

  useEffect(() => {
    if (!auth.currentUser) return;
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    
    updateDoc(userDocRef, { 
      isOnline: true, 
      lastSeen: serverTimestamp() 
    }).catch(console.error);

    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserData(data);
        if (data.status === 'PENDING') {
          updateDoc(userDocRef, { status: 'MEMBER' }).catch(console.error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('isOnline', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOnlineUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching online users:", error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('displayName', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRegisteredUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Error fetching registered users:", error);
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
        openingDate: formData.get('openingDate'),
        closingDate: formData.get('closingDate'),
        createdBy: auth.currentUser?.uid,
        creatorName: userData?.displayName || 'Irmão',
        createdAt: serverTimestamp(),
        status: 'ACTIVE'
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
          current: 0
        });
      }

      setShowSocialModal(false);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'social_actions');
    } finally {
      setIsSubmittingSocial(false);
    }
  };

  useEffect(() => {
    const initialTab = searchParams.get('tab');
    if (initialTab) {
      setActiveTab(initialTab as any);
    }
  }, [searchParams]);

  const fetchTargetUser = async () => {
    const uidToFetch = targetUid || auth.currentUser?.uid;
    if (!uidToFetch) return;

    const isOwner = uidToFetch === auth.currentUser?.uid;
    setIsReadOnly(!isOwner && !isSuperAdmin);

    try {
      const docSnap = await getDoc(doc(db, 'users', uidToFetch));
      if (docSnap.exists()) {
        const data = docSnap.data();
        const memberData = { id: docSnap.id, ...data };
        setTargetMemberData(memberData);
        setEditProfileData({
          displayName: data.displayName || '',
          occupation: data.occupation || '',
          mvu_link: data.mvu_link || '',
          masonic_history: data.masonic_history || data.roles_history || '',
          photoURL: data.photoURL || ''
        });
      }
    } catch (err) {
      console.error("Error fetching target user:", err);
    }
  };

  useEffect(() => {
    fetchTargetUser();
  }, [targetUid, isSuperAdmin, userData]);

  const handleUpdatePhoto = () => {
    const url = window.prompt('Cole aqui o link direto da foto (Ex: ImgBB):', editProfileData.photoURL || '');
    if (url !== null) {
      setEditProfileData(prev => ({ ...prev, photoURL: url }));
    }
  };

  const handleSaveProfile = async () => {
    const uid = (targetUid && isSuperAdmin) ? targetUid : auth.currentUser?.uid;
    if (!uid) return;

    setIsSavingProfile(true);
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...editProfileData,
        updatedAt: serverTimestamp()
      });
      alert('Perfil atualizado com sucesso!');
      if (targetUid) {
        await fetchTargetUser();
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    } finally {
      setIsSavingProfile(false);
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

  const handleLogout = async () => {
    await logout();
    navigate('/login-membro');
  };

  return (
    <div className="min-h-screen bg-aged-beige flex flex-col font-sans selection:bg-[#c5a059]/30 selection:text-[#0b1d3a]">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="relative mb-8 p-1 rounded-[2.5rem] bg-gradient-to-br from-[#c5a059]/20 via-transparent to-[#0b1d3a]/5 overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-8 bg-white/40 backdrop-blur-md rounded-[2.3rem] border border-white/40">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#0b1d3a] border-4 border-[#c5a059]/20 flex items-center justify-center text-[#c5a059] shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#c5a059]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Shield className="w-8 h-8 md:w-10 h-10 relative z-10" />
                 </div>
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] mb-1 block">Área Restrita</span>
                    <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#0b1d3a] uppercase tracking-wider leading-none">Arca da Aliança <span className="gold-text">nº 34</span></h1>
                 </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className="group relative flex items-center gap-3 p-1.5 pr-6 bg-white border border-[#c5a059]/30 rounded-xl hover:border-[#c5a059] transition-all shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#0b1d3a]/5 overflow-hidden border border-[#c5a059]/10">
                    {userData?.photoURL ? (
                      <img src={userData.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#c5a059] font-serif text-lg">{userData?.displayName?.[0] || 'I'}</div>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0b1d3a] leading-tight line-clamp-1">{userData?.displayName || 'Ir. Obreiro'}</p>
                    <p className="text-[8px] font-bold text-[#c5a059] uppercase tracking-widest">{userData?.currentRole || userData?.role || 'Membro'}</p>
                  </div>
                  
                  <AnimatePresence>
                    {isSuperAdmin && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 w-5 h-5 bg-[#c5a059] rounded-full flex items-center justify-center border-2 border-white shadow-lg" title="Modo Administrador Ativo">
                        <Shield className="w-3 h-3 text-[#0b1d3a]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
                <button onClick={handleLogout} className="flex items-center gap-2 p-3.5 bg-[#0b1d3a]/5 border border-[#0b1d3a]/10 rounded-xl text-[#0b1d3a] hover:text-red-500 transition-colors uppercase tracking-[0.2em] text-[9px] font-black">
                  <LogOut className="w-4 h-4" /> <span>Sair</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-8">
             {[
               { id: 'welcome', label: 'Escrutínio de Atividades', icon: LayoutDashboard },
               { id: 'library', label: 'Biblioteca Ritualística', icon: BookMarked },
               { id: 'professional', label: 'O Forja Profissional (B2B)', icon: Handshake },
               { id: 'social', label: 'Painel de Decisões Sociais', icon: Heart },
               { id: 'members', label: 'Quadro de Obreiros', icon: Users },
               { id: 'profile', label: 'Dados Pessoais', icon: UserCircle }
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => {
                   if (tab.id === 'profile' && !targetUid) {
                     navigate('/area-restrita?tab=profile');
                   } else {
                     setActiveTab(tab.id as any);
                   }
                 }}
                 className={`flex items-center gap-4 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all w-full shadow-sm border ${
                   activeTab === tab.id 
                     ? 'bg-[#c5a059] text-[#0b1d3a] border-[#c5a059]' 
                     : 'bg-[#0b1d3a] text-white border-[#c5a059]/30 hover:bg-[#c5a059]/10 hover:text-[#c5a059]'
                 }`}
               >
                 <tab.icon className="w-4 h-4 flex-shrink-0" />
                 {tab.label}
               </button>
             ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'welcome' && (
              <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                {/* Welcome Card */}
                <div className="relative">
                  <div className="absolute inset-0 bg-[#fdf6e3] rounded-[2rem] shadow-2xl rotate-[-0.5deg]" />
                  <div className="relative p-6 md:p-10 bg-[#f4e4bc] rounded-[2rem] border-2 border-[#d4b068] overflow-hidden text-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                      <Shield className="w-[400px] h-[400px] text-[#8b5e34]" />
                    </div>
                    <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                       <h2 className="font-serif text-2xl md:text-4xl text-[#5d4037] font-bold italic tracking-tight uppercase">Saudações Fraternais, Ir. {userData?.displayName?.split(' ')[0]}</h2>
                       <div className="h-0.5 w-16 bg-[#d4b068] mx-auto" />
                       <p className="font-serif text-[#5d4037]/90 text-base md:text-lg leading-relaxed italic text-justify px-4">Seja bem-vindo ao Círculo Fechado da A.R.L.S. Arca da Aliança nº 34. Este ambiente digital foi erguido para que a nossa fraternidade não se limite apenas às nossas sessões físicas.</p>
                       <div className="pt-4 flex items-center justify-center gap-8">
                         <div className="text-center">
                           <p className="text-2xl font-serif font-black text-[#8b5e34]">{registeredUsers.length}</p>
                           <p className="text-[8px] uppercase font-black tracking-widest text-[#8b5e34]/60">Irmãos no Quadro</p>
                         </div>
                         <div className="w-px h-8 bg-[#d4b068]/30" />
                         <div className="text-center">
                           <p className="text-2xl font-serif font-black text-green-700">{onlineUsers.length}</p>
                           <p className="text-[8px] uppercase font-black tracking-widest text-green-700/60">Em Loja Virtual</p>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-[#0b1d3a]/10 pb-4">
                      <h3 className="font-serif text-xl font-bold text-[#0b1d3a] uppercase tracking-widest flex items-center gap-2">
                        <Handshake className="w-5 h-5 text-[#c5a059]" /> O Forja Profissional
                      </h3>
                      <button onClick={() => setActiveTab('professional')} className="text-[10px] uppercase font-black tracking-widest text-[#c5a059] hover:underline">Ver Todos</button>
                    </div>
                    <RecentProfessionalFeed />
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-[#0b1d3a]/10 pb-4">
                      <h3 className="font-serif text-xl font-bold text-[#0b1d3a] uppercase tracking-widest flex items-center gap-2">
                        <BookMarked className="w-5 h-5 text-[#c5a059]" /> Debates em Obra
                      </h3>
                      <button onClick={() => setActiveTab('library')} className="text-[10px] uppercase font-black tracking-widest text-[#c5a059] hover:underline">Ir para Biblioteca</button>
                    </div>
                    <LibraryDiscussionFeed />
                  </div>
                </div>

                {/* Dashboard Integrated Activity Section */}
                <div className="space-y-10">
                  {/* Decisions Panel */}
                  <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-[#0b1d3a]/5 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <Heart className="w-8 h-8 text-[#c5a059]" />
                        <h3 className="font-cinzel text-2xl font-bold text-[#0b1d3a] uppercase tracking-widest">Painel de Decisões</h3>
                      </div>
                      <button onClick={() => setActiveTab('social')} className="text-[10px] font-black uppercase tracking-widest text-[#c5a059] hover:underline">Ver Completo</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {socialItems.slice(0, 2).map((action) => (
                        <div key={action.id} className="p-6 bg-[#0b1d3a]/5 border border-[#c5a059]/10 rounded-[2rem] hover:border-[#c5a059]/30 transition-all group">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mb-4 inline-block ${action.type === 'poll' ? 'bg-[#0b1d3a]/10 text-[#0b1d3a]' : 'bg-[#c5a059]/10 text-[#c5a059]'}`}>
                            {action.type === 'poll' ? 'Enquete' : 'Arrecadação'}
                          </span>
                          <h4 className="font-serif font-bold text-[#0b1d3a] text-lg mb-2">{action.title}</h4>
                          <p className="text-[11px] text-[#0b1d3a]/70 line-clamp-2 italic mb-6 leading-relaxed">"{action.description}"</p>
                          <button onClick={() => setActiveTab('social')} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] flex items-center gap-2 group-hover:gap-4 transition-all">Participar agora <span>→</span></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Members Gallery (Quadro de Obreiros Integrado) */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-[#0b1d3a]/10 pb-4">
                      <div>
                        <h3 className="font-serif text-2xl font-bold text-[#0b1d3a] uppercase tracking-widest">Soberano Quadro de Obreiros</h3>
                        <p className="text-[#0b1d3a]/40 text-[10px] italic font-serif">"Irmãos que vivem em união"</p>
                      </div>
                      <button onClick={() => setActiveTab('members')} className="px-6 py-2 border border-[#c5a059]/30 rounded-full text-[10px] font-black uppercase tracking-widest text-[#0b1d3a] hover:bg-[#c5a059] hover:text-[#0b1d3a] transition-all">Ver em Tela Cheia</button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {registeredUsers.filter(u => u.status !== 'PENDING').slice(0, 12).map((member) => (
                        <motion.div 
                          key={member.id}
                          whileHover={{ y: -5 }}
                          onClick={() => navigate(`/area-restrita?uid=${member.id}&tab=profile`)}
                          className="bg-white p-4 rounded-2xl border border-[#0b1d3a]/5 hover:border-[#c5a059]/30 transition-all cursor-pointer shadow-sm group text-center"
                        >
                          <div className="relative w-16 h-16 mx-auto mb-3">
                            <div className="w-full h-full rounded-full bg-[#c5a059]/10 border-2 border-[#c5a059]/20 overflow-hidden shadow-inner">
                              {member.photoURL ? (
                                <img src={member.photoURL} alt={member.displayName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#c5a059] text-xl font-serif">
                                  {member.displayName?.[0] || 'I'}
                                </div>
                              )}
                            </div>
                            {member.isOnline && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                            )}
                          </div>
                          <h4 className="font-serif text-[11px] font-bold text-[#0b1d3a] group-hover:text-[#c5a059] transition-colors truncate">{member.displayName || 'Ir. Obreiro'}</h4>
                          <p className="text-[7px] text-[#c5a059] font-black uppercase tracking-widest truncate">{member.currentRole || member.role || 'Membro'}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'library' && (
              <motion.div key="library" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex flex-col md:flex-row gap-6 mb-8 items-center">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b1d3a]/30 group-focus-within:text-[#0b1d3a] transition-colors" />
                    <input type="text" placeholder="Buscar estudos, rituais..." className="w-full bg-white border border-[#0b1d3a]/10 rounded-2xl p-4 pl-12 text-[#0b1d3a] text-sm focus:border-[#c5a059]/50 shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-8 py-4 bg-[#0b1d3a] text-[#f4efe2] border border-[#c5a059]/30 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#c5a059] transition-all shadow-md">
                    <Plus className="w-4 h-4" /> Adicionar Obra
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-3xl border border-[#0b1d3a]/5 p-6 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-[#0b1d3a]/5 flex items-center justify-center text-[#c5a059]">
                          {item.fileType === 'PDF' ? <FileIcon className="w-6 h-6" /> : <LinkIcon className="w-6 h-6" />}
                        </div>
                        <div className="flex gap-2">
                          {hasElevatedAccess && (
                            <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-[#0b1d3a]/20 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-2 text-[#0b1d3a]/20 hover:text-[#c5a059] transition-colors">
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                      <span className="text-[9px] uppercase font-black tracking-widest text-[#c5a059] mb-2 block">{item.category}</span>
                      <h3 className="font-serif text-xl font-bold text-[#0b1d3a] mb-4 group-hover:text-[#c5a059] transition-colors">{item.title}</h3>
                      <p className="text-[11px] text-[#0b1d3a]/60 italic line-clamp-3 mb-6">"{item.description}"</p>
                      <div className="pt-6 border-t border-[#0b1d3a]/5 flex items-center justify-between">
                        <p className="text-[8px] font-black uppercase tracking-widest text-[#0b1d3a]/30">Por {item.author}</p>
                        <button className="text-[9px] font-black uppercase tracking-widest text-[#c5a059] hover:underline flex items-center gap-1">Ver Obra <ChevronDown className="w-3 h-3 -rotate-90" /></button>
                      </div>
                    </div>
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
                 <div className="p-6 md:p-10 bg-white/40 border border-[#0b1d3a]/10 rounded-[2rem] md:rounded-[3.5rem] backdrop-blur-md shadow-sm">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center mb-8 md:mb-10 text-center md:text-left">
                       <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-[#0b1d3a]/10 border border-[#0b1d3a]/20 flex items-center justify-center text-[#0b1d3a] flex-shrink-0">
                          <Heart className="w-10 h-10 md:w-12 md:h-12" />
                       </div>
                       <div className="flex-1">
                          <h2 className="text-2xl md:text-3xl font-serif text-[#0b1d3a] font-bold mb-2 uppercase tracking-widest">Painel de Decisões e <span className="text-[#c5a059]">Ações Sociais</span></h2>
                          <p className="text-[#0b1d3a]/60 text-xs md:text-sm italic font-serif leading-relaxed">Este espaço é destinado à deliberação sobre nossas obras de assistência e suporte social.</p>
                       </div>
                       {hasElevatedAccess && (
                         <div className="flex gap-2 w-full md:w-auto">
                           <button onClick={() => { setSocialType('poll'); setShowSocialModal(true); }} className="flex-1 md:flex-none px-6 py-3 bg-white/60 border border-[#0b1d3a]/10 text-[#0b1d3a] rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/80 transition-all">Nova Enquete</button>
                           <button onClick={() => { setSocialType('philanthropy'); setShowSocialModal(true); }} className="flex-1 md:flex-none px-6 py-3 bg-[#0b1d3a] text-[#f4efe2] border border-[#c5a059]/30 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-[#c5a059] transition-all">Nova Filantropia</button>
                         </div>
                       )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {socialItems.map((action) => (
                         <div key={action.id} className="p-8 bg-white/40 border border-[#0b1d3a]/10 rounded-[2.5rem] hover:border-[#c5a059]/30 transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                               <div className="flex flex-col gap-1">
                                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] w-fit ${
                                    action.type === 'poll' ? 'bg-blue-500/10 text-blue-600' : 
                                    action.type === 'philanthropy' ? 'bg-green-500/10 text-green-600' : 
                                    'bg-[#c5a059]/10 text-[#c5a059]'
                                  }`}>
                                    {action.type === 'poll' ? 'Enquete' : action.type === 'philanthropy' ? 'Arrecadação' : 'Decisão'}
                                  </span>
                                  <p className="text-[8px] text-[#0b1d3a]/30 uppercase font-black tracking-widest mt-1">Por: {action.creatorName}</p>
                               </div>
                               <div className="flex flex-col items-end gap-1">
                                 {action.type === 'philanthropy' && (
                                   <p className="text-[#c5a059] font-bold text-xs">Meta: R$ {action.goal?.toLocaleString()}</p>
                                 )}
                                 <div className="flex items-center gap-2">
                                   {new Date(action.openingDate) > new Date() && (
                                     <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-600 rounded text-[7px] font-black uppercase tracking-widest border border-yellow-500/20">Agendado</span>
                                   )}
                                   {new Date(action.closingDate) < new Date() && (
                                     <span className="px-2 py-0.5 bg-red-500/10 text-red-600 rounded text-[7px] font-black uppercase tracking-widest border border-red-500/20">Encerrado</span>
                                   )}
                                   {new Date(action.openingDate) <= new Date() && new Date(action.closingDate) >= new Date() && (
                                     <span className="px-2 py-0.5 bg-green-500/10 text-green-600 rounded text-[7px] font-black uppercase tracking-widest border border-green-500/20">Em Andamento</span>
                                   )}
                                 </div>
                               </div>
                            </div>

                            <h3 className="text-[#0b1d3a] font-serif text-xl font-bold mb-3 group-hover:text-[#c5a059] transition-colors">{action.title}</h3>
                            <p className="text-[#0b1d3a]/60 text-[11px] mb-6 italic leading-relaxed">"{action.description}"</p>

                            {action.type === 'poll' && (
                              <div className="space-y-3 mb-6">
                                {action.options?.map((opt: any, i: number) => {
                                  const totalVotes = action.options.reduce((acc: number, cur: any) => acc + (cur.count || 0), 0);
                                  const percentage = totalVotes > 0 ? Math.round((opt.count / totalVotes) * 100) : 0;
                                  const userId = auth.currentUser?.uid || '';
                                  const hasVoted = action.votes?.[userId] !== undefined;

                                  return (
                                    <button 
                                      key={i}
                                      onClick={() => handleVote(action.id, i)}
                                      disabled={hasVoted}
                                      className={`w-full relative overflow-hidden p-3 rounded-xl border transition-all text-left ${
                                        hasVoted && action.votes![userId] === i 
                                          ? 'bg-[#c5a059]/20 border-[#c5a059]/50' 
                                          : 'bg-white/40 border-[#0b1d3a]/10 hover:border-[#c5a059]/30'
                                      }`}
                                    >
                                      <div className="absolute inset-y-0 left-0 bg-[#c5a059]/10" style={{ width: `${percentage}%` }} />
                                      <div className="relative flex justify-between items-center text-[11px]">
                                        <span className="text-[#0b1d3a] font-bold">{opt.text}</span>
                                        <span className="text-[#c5a059] font-black">{percentage}%</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {action.type === 'philanthropy' && (
                              <div className="space-y-4 mb-6">
                                <div className="h-2 bg-[#0b1d3a]/5 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-green-600 to-emerald-500 transition-all duration-1000" 
                                    style={{ width: `${Math.min(100, ((action.current || 0) / (action.goal || 1)) * 100)}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                  <span className="text-green-600">Arrecadado: R$ {action.current?.toLocaleString()}</span>
                                  <span className="text-[#0b1d3a]/40">Meta: R$ {action.goal?.toLocaleString()}</span>
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2">
                               {hasElevatedAccess && (
                                 <button 
                                   onClick={() => {
                                     const newDate = window.prompt('Nova Data e Hora de Encerramento (YYYY-MM-DDTHH:MM):', action.closingDate);
                                     if (newDate) {
                                       updateDoc(doc(db, 'social_actions', action.id), { closingDate: newDate });
                                     }
                                   }}
                                   className="px-4 py-3 bg-white/40 border border-[#0b1d3a]/10 rounded-xl text-[#0b1d3a] font-black uppercase text-[9px] tracking-widest hover:bg-[#c5a059] transition-all"
                                   title="Editar Encerramento"
                                 >
                                   <Calendar className="w-4 h-4" />
                                 </button>
                               )}
                               {hasElevatedAccess && (
                                 <button 
                                   onClick={async () => {
                                     const { jsPDF } = await import('jspdf');
                                     const { default: autoTable } = await import('jspdf-autotable');
                                     const doc = new jsPDF();
                                     
                                     doc.setFont('helvetica', 'bold');
                                     doc.setFontSize(16);
                                     doc.text('ARLS ARCA DA ALIANÇA Nº 34', 105, 20, { align: 'center' });
                                     doc.setFontSize(10);
                                     doc.text('Relatório Oficial de Atividades', 105, 28, { align: 'center' });
                                     doc.line(20, 32, 190, 32);

                                     if (action.type === 'poll') {
                                       const winner = action.options.reduce((prev: any, current: any) => (prev.count > current.count) ? prev : current);
                                       const ritualText = `ARLS Arca da Aliança Nº 34 — Relatório de Deliberação Digital. Certifico que, em consulta ao Soberano Quadro de Obreiros acerca do tema "${action.title}", que tinha por escopo "${action.description}", restou deliberado e aprovado que: "${winner.text}". Este documento registra a vontade soberana da Oficina.`;
                                       const splitText = doc.splitTextToSize(ritualText, 170);
                                       doc.text(splitText, 20, 45, { align: 'justify' });

                                       const tableRows = Object.entries(action.votes || {}).map(([uid, optIdx]: [string, any]) => [
                                          registeredUsers.find(u => u.id === uid)?.displayName || 'Ir. Obreiro',
                                          action.options[optIdx]?.text || 'N/A'
                                       ]);

                                       autoTable(doc, {
                                         startY: 100,
                                         head: [['Irmão', 'Manifestação (Voto)']],
                                         body: tableRows,
                                         headStyles: { fillColor: [11, 29, 58], textColor: [197, 160, 89] },
                                       });
                                     } else if (action.type === 'philanthropy') {
                                       doc.setFont('helvetica', 'bold');
                                       doc.text(`AÇÃO BENEFICENTE: ${action.title}`, 20, 45);
                                       autoTable(doc, {
                                         startY: 60,
                                         head: [['Métrica', 'Valor (R$)']],
                                         body: [
                                           ['Meta Financeira', action.goal?.toLocaleString()],
                                           ['Total Alcançado', action.current?.toLocaleString()]
                                         ],
                                         headStyles: { fillColor: [11, 29, 58], textColor: [197, 160, 89] },
                                       });
                                     }
                                     doc.save(`relatorio-${action.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
                                   }}
                                   className="flex-1 py-3 bg-white/40 border border-[#0b1d3a]/10 rounded-xl text-[#0b1d3a] font-black uppercase text-[9px] tracking-widest hover:bg-[#c5a059] hover:text-[#0b1d3a] transition-all"
                                 >
                                     PDF Oficial
                                 </button>
                               )}
                               <button className="flex-1 py-3 bg-white/40 border border-[#0b1d3a]/10 rounded-xl text-[#0b1d3a]/40 font-black uppercase text-[9px] tracking-widest hover:text-[#0b1d3a] transition-all">Detalhes</button>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
               </motion.div>
            )}

            {activeTab === 'members' && (
              <motion.div key="members" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <div className="flex items-center justify-between border-b border-[#0b1d3a]/10 pb-6">
                  <div>
                    <h2 className="font-serif text-3xl font-bold text-[#0b1d3a] uppercase tracking-widest">Soberano Quadro de Obreiros</h2>
                    <p className="text-[#0b1d3a]/60 text-xs italic font-serif">"Eis quão bom e quão suave é que os irmãos vivam em união."</p>
                  </div>
                  <div className="text-[10px] uppercase font-black tracking-widest text-[#c5a059] bg-[#c5a059]/10 px-4 py-2 rounded-full border border-[#c5a059]/20">
                    {registeredUsers.length} Irmãos Cadastrados
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {registeredUsers.filter(u => u.status !== 'PENDING').map((member) => (
                    <motion.div 
                      key={member.id}
                      whileHover={{ y: -5 }}
                      onClick={() => navigate(`/area-restrita?uid=${member.id}&tab=profile`)}
                      className="bg-white p-6 rounded-[2rem] border border-[#0b1d3a]/5 hover:border-[#c5a059]/30 transition-all cursor-pointer shadow-sm group text-center"
                    >
                      <div className="relative w-24 h-24 mx-auto mb-4">
                        <div className="w-full h-full rounded-full bg-[#c5a059]/10 border-2 border-[#c5a059]/20 overflow-hidden shadow-inner">
                          {member.photoURL ? (
                            <img src={member.photoURL} alt={member.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#c5a059] text-3xl font-serif">
                              {member.displayName?.[0] || 'I'}
                            </div>
                          )}
                        </div>
                        {member.isOnline && (
                          <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        )}
                      </div>
                      <h3 className="font-serif text-lg font-bold text-[#0b1d3a] group-hover:text-[#c5a059] transition-colors line-clamp-1">{member.displayName || 'Ir. Obreiro'}</h3>
                      <p className="text-[9px] text-[#c5a059] font-black uppercase tracking-[0.2em] mb-2">{member.currentRole || member.role || 'Membro'}</p>
                      <div className="mt-4 pt-4 border-t border-[#0b1d3a]/5 flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-widest text-[#0b1d3a]/30 group-hover:text-[#c5a059] transition-colors">
                        Ver Perfil Completo <span>→</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-4xl mx-auto space-y-8">
                 {(isEditingSomeoneElse || (targetUid && targetUid !== auth.currentUser?.uid)) && (
                   <div className={`${isSuperAdmin ? 'bg-[#c5a059]' : 'bg-[#0b1d3a]'} p-4 rounded-2xl flex items-center justify-between shadow-xl`}>
                     <p className={`${isSuperAdmin ? 'text-[#0b1d3a]' : 'text-[#f4efe2]'} font-black uppercase tracking-widest text-[10px]`}>
                       Visualizando Perfil: <span className="underline">{targetMemberData?.displayName || targetMemberData?.email}</span> {isReadOnly ? '(Somente Leitura)' : '(Modo Admin)'}
                     </p>
                     <button onClick={() => navigate('/area-restrita?tab=welcome')} className={`${isSuperAdmin ? 'text-[#0b1d3a]' : 'text-[#f4efe2]'} hover:scale-105 transition-transform`}>
                       <X className="w-5 h-5" />
                     </button>
                   </div>
                 )}

                 <div className="bg-[#0b1d3a]/5 border border-[#0b1d3a]/10 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-sm">
                    <h2 className="text-center font-serif text-3xl font-bold text-[#0b1d3a] mb-8 uppercase tracking-widest">Dados Pessoais</h2>
                    <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center md:items-start text-center md:text-left">
                      <div className="flex flex-col items-center gap-6 w-full md:w-64">
                         <div className="relative">
                            <div className="w-40 h-56 rounded-[2rem] bg-[#c5a059]/10 border-4 border-[#c5a059]/20 overflow-hidden relative shadow-lg">
                               {editProfileData.photoURL ? (
                                 <img src={editProfileData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-[#c5a059] text-6xl font-serif">
                                   {editProfileData.displayName?.[0] || 'I'}
                                 </div>
                               )}
                            </div>
                            {(!isReadOnly || isSuperAdmin) && (
                              <button 
                                type="button"
                                onClick={handleUpdatePhoto} 
                                className="absolute -bottom-2 -right-2 p-3 bg-[#c5a059] text-[#0b1d3a] rounded-2xl cursor-pointer shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 pointer-events-auto"
                                title="Alterar Foto"
                              >
                                 <Camera className="w-5 h-5" />
                              </button>
                            )}
                         </div>
                         <div>
                            <h3 className="font-serif text-2xl font-bold text-[#c5a059] uppercase tracking-widest">{editProfileData.displayName || 'Ir. Obreiro'}</h3>
                            <p className="text-[#0b1d3a]/80 font-black tracking-widest text-[10px] uppercase mt-1">{targetMemberData?.currentRole || targetMemberData?.role || 'Membro'}</p>
                         </div>
                      </div>

                      <div className="flex-1 space-y-6 w-full">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[10px] text-[#0b1d3a]/60 uppercase font-black tracking-widest ml-1 text-left">Nome de Obreiro</label>
                               <input 
                                className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-4 text-[#0b1d3a] focus:border-[#c5a059] outline-none disabled:bg-[#0b1d3a]/5" 
                                value={editProfileData.displayName} 
                                onChange={e => setEditProfileData(prev => ({ ...prev, displayName: e.target.value }))} 
                                disabled={isReadOnly}
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] text-[#0b1d3a]/60 uppercase font-black tracking-widest ml-1 text-left">Cargo Atual (Oficial)</label>
                               <div className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-4 text-[#0b1d3a]/50 text-sm italic flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
                                  {targetMemberData?.currentRole || targetMemberData?.role || 'Membro'}
                               </div>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[10px] text-[#0b1d3a]/60 uppercase font-black tracking-widest ml-1 text-left">Profissão</label>
                               <input 
                                className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-4 text-[#0b1d3a] focus:border-[#c5a059] outline-none disabled:bg-[#0b1d3a]/5" 
                                placeholder="Sua ocupação..." 
                                value={editProfileData.occupation} 
                                onChange={e => setEditProfileData(prev => ({ ...prev, occupation: e.target.value }))} 
                                disabled={isReadOnly}
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] text-[#0b1d3a]/60 uppercase font-black tracking-widest ml-1 text-left">Link MVU</label>
                               <input 
                                className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-4 text-[#0b1d3a] focus:border-[#c5a059] outline-none text-xs disabled:bg-[#0b1d3a]/5" 
                                placeholder="https://..." 
                                value={editProfileData.mvu_link} 
                                onChange={e => setEditProfileData(prev => ({ ...prev, mvu_link: e.target.value }))} 
                                disabled={isReadOnly}
                               />
                            </div>
                         </div>

                         <div className="space-y-2">
                            <label className="text-[10px] text-[#0b1d3a]/60 uppercase font-black tracking-widest ml-1 text-left">Apresentação & História Maçônica</label>
                            <textarea 
                              className="w-full bg-white border border-[#0b1d3a]/10 rounded-2xl p-4 text-[#0b1d3a] focus:border-[#c5a059] outline-none text-sm resize-none disabled:bg-[#0b1d3a]/5" 
                              rows={4} 
                              placeholder="Conte sua história..." 
                              value={editProfileData.masonic_history} 
                              onChange={e => setEditProfileData(prev => ({ ...prev, masonic_history: e.target.value }))} 
                              disabled={isReadOnly}
                            />
                         </div>

                         {!isReadOnly && (
                           <button 
                             onClick={handleSaveProfile}
                             disabled={isSavingProfile}
                             className="w-full py-4 bg-[#0b1d3a] text-[#f4efe2] border border-[#c5a059]/30 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-[#c5a059] transition-all flex items-center justify-center gap-2"
                           >
                             {isSavingProfile ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                             SALVAR DADOS PESSOAIS
                           </button>
                        )}
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
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-[#0b1d3a]/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xl bg-[#f4efe2] rounded-[2.5rem] border border-[#c5a059]/30 shadow-2xl p-10">
               <h2 className="font-serif text-3xl font-bold text-[#0b1d3a] mb-8 uppercase tracking-widest text-center">Adicionar à <span className="text-[#c5a059]">Biblioteca</span></h2>
               <form className="space-y-6" onSubmit={(e) => {
                 e.preventDefault();
                 const formData = new FormData(e.currentTarget);
                 addDoc(collection(db, 'library_items'), {
                   title: formData.get('title'),
                   category: formData.get('category'),
                   description: formData.get('description'),
                   url: formData.get('url'),
                   author: userData?.displayName || 'Ir. Obreiro',
                   addedBy: auth.currentUser?.uid,
                   fileType: newItemType,
                   createdAt: serverTimestamp()
                 }).then(() => setShowAddModal(false)).catch(console.error);
               }}>
                 <div className="space-y-2">
                   <label className="text-[10px] text-[#0b1d3a]/60 uppercase font-black tracking-widest ml-1">Título da Obra / Estudo</label>
                   <input name="title" required className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-4 text-[#0b1d3a] outline-none" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <label className="text-[10px] text-[#0b1d3a]/60 uppercase font-black tracking-widest ml-1">Categoria</label>
                     <select name="category" className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-4 text-[#0b1d3a] outline-none">
                       <option>Ritualística</option>
                       <option>Filosofia</option>
                       <option>Instrução</option>
                       <option>Legislação</option>
                     </select>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] text-[#0b1d3a]/60 uppercase font-black tracking-widest ml-1">Tipo</label>
                     <select className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-4 text-[#0b1d3a] outline-none" value={newItemType} onChange={(e) => setNewItemType(e.target.value as any)}>
                       <option value="LINK">Link / Vídeo</option>
                       <option value="PDF">Documento PDF</option>
                     </select>
                   </div>
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] text-[#0b1d3a]/60 uppercase font-black tracking-widest ml-1">Link Direto (ImgBB, Google Drive, YouTube)</label>
                   <input name="url" required className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-4 text-[#0b1d3a] outline-none text-xs" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] text-[#0b1d3a]/60 uppercase font-black tracking-widest ml-1">Breve Descrição do Conteúdo</label>
                   <textarea name="description" rows={3} className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-4 text-[#0b1d3a] outline-none resize-none" />
                 </div>
                 <div className="flex gap-4">
                   <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 border border-[#0b1d3a]/10 rounded-xl text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest">Cancelar</button>
                   <button type="submit" className="flex-1 py-4 bg-[#0b1d3a] text-[#f4efe2] rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#c5a059] transition-all shadow-xl">Publicar</button>
                 </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Social Modal */}
      <AnimatePresence>
        {showSocialModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSocialModal(false)} className="absolute inset-0 bg-[#0b1d3a]/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-[#f4efe2] rounded-[2.5rem] border border-[#c5a059]/30 shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
               <h2 className="font-serif text-3xl font-bold text-[#0b1d3a] mb-8 uppercase tracking-widest text-center">Nova Ação <span className="text-[#c5a059]">{socialType === 'poll' ? 'de Escrutínio' : 'Filantrópica'}</span></h2>
               
               <form onSubmit={handleCreateSocialAction} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-[#0b1d3a]/60 uppercase font-black tracking-widest ml-1">Título da Ação</label>
                    <input name="title" required className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-4 text-[#0b1d3a] outline-none focus:border-[#c5a059]" placeholder="Ex: Reforma do Templo ou Campanha Agasalho" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] text-[#0b1d3a]/60 uppercase font-black tracking-widest ml-1">Descrição Detalhada / Escopo</label>
                    <textarea name="description" required rows={3} className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-4 text-[#0b1d3a] outline-none focus:border-[#c5a059] resize-none" placeholder="Explique os objetivos desta ação..." />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] text-[#0b1d3a]/60 uppercase font-black tracking-widest ml-1">Abertura (Data e Hora)</label>
                        <input name="openingDate" type="datetime-local" required className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-4 text-[#0b1d3a] outline-none focus:border-[#c5a059]" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] text-[#0b1d3a]/60 uppercase font-black tracking-widest ml-1">Encerramento (Data e Hora)</label>
                        <input name="closingDate" type="datetime-local" required className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-4 text-[#0b1d3a] outline-none focus:border-[#c5a059]" />
                     </div>
                  </div>

                  {socialType === 'poll' && (
                    <div className="space-y-4">
                       <label className="text-[10px] text-[#0b1d3a]/60 uppercase font-black tracking-widest ml-1">Opções de Voto</label>
                       {pollOptions.map((opt, i) => (
                         <div key={i} className="flex gap-2">
                            <input 
                              value={opt} 
                              onChange={(e) => {
                                const newOpts = [...pollOptions];
                                newOpts[i] = e.target.value;
                                setPollOptions(newOpts);
                              }}
                              required={i < 2}
                              className="flex-1 bg-white border border-[#0b1d3a]/10 rounded-xl p-4 text-[#0b1d3a] outline-none focus:border-[#c5a059]" 
                              placeholder={`Opção ${i + 1}`} 
                            />
                            {i > 1 && (
                              <button type="button" onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))} className="p-4 bg-red-50 text-red-500 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                            )}
                         </div>
                       ))}
                       <button type="button" onClick={() => setPollOptions([...pollOptions, ''])} className="text-[10px] font-black uppercase tracking-widest text-[#c5a059] flex items-center gap-2 hover:underline"><Plus className="w-4 h-4" /> Adicionar Opção</button>
                    </div>
                  )}

                  {socialType === 'philanthropy' && (
                    <div className="space-y-2">
                       <label className="text-[10px] text-[#0b1d3a]/60 uppercase font-black tracking-widest ml-1">Meta Financeira (R$)</label>
                       <input name="goal" type="number" step="0.01" required className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-4 text-[#0b1d3a] outline-none focus:border-[#c5a059]" placeholder="0.00" />
                    </div>
                  )}

                  <div className="pt-4 flex gap-4">
                    <button type="button" onClick={() => setShowSocialModal(false)} className="flex-1 py-4 border border-[#0b1d3a]/10 rounded-xl text-[#0b1d3a] font-black uppercase text-[10px] tracking-widest hover:bg-[#0b1d3a]/5">Cancelar</button>
                    <button type="submit" disabled={isSubmittingSocial} className="flex-1 py-4 bg-[#0b1d3a] text-[#f4efe2] border border-[#c5a059]/30 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-[#c5a059] transition-all">
                       {isSubmittingSocial ? 'Publicando...' : 'Publicar Ação'}
                    </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
