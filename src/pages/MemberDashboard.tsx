import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ProfessionalBoard from '../components/restricted/ProfessionalBoard';
import LibraryItemCard from '../components/restricted/LibraryItemCard';
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

// ============================================================
// COMPONENTES EXTERNOS - fora do MemberDashboard para evitar
// re-criação a cada render (era a causa do bug de duplicação)
// ============================================================

function RecentProfessionalFeed({ items, onNavigate }: { items: any[], onNavigate: () => void }) {
  return (
    <div className="space-y-4">
      {items.length === 0 && <p className="text-[10px] text-[#0b1d3a]/30 uppercase italic">Nenhuma atividade recente</p>}
      {items.map(item => (
        <div key={item.id} className="p-4 bg-white/60 border border-[#0b1d3a]/5 rounded-2xl flex items-center gap-4 cursor-pointer" onClick={onNavigate}>
          <div className="w-10 h-10 rounded-xl bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059]">
            {item.type === 'SERVICE' ? <Building className="w-5 h-5" /> : item.type === 'JOB' ? <Briefcase className="w-5 h-5" /> : <UserCircle className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[#0b1d3a] truncate">{item.title}</h4>
            <p className="text-[8px] text-[#0b1d3a]/60 uppercase font-black tracking-widest">{item.company || item.authorName} • {item.type}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function LibraryDiscussionFeed({ items, onNavigate, onProfileClick }: { items: any[], onNavigate: () => void, onProfileClick: (uid: string) => void }) {
  return (
    <div className="space-y-4">
      {items.length === 0 && <p className="text-[10px] text-[#0b1d3a]/30 uppercase italic">Nenhum debate recente</p>}
      {items.map(item => (
        <div key={item.id} className="p-4 bg-white/60 border border-[#0b1d3a]/5 rounded-2xl flex items-center gap-4 cursor-pointer" onClick={onNavigate}>
          <div className="w-10 h-10 rounded-xl bg-[#0b1d3a]/5 flex items-center justify-center text-[#0b1d3a]">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[#0b1d3a] truncate">{item.title}</h4>
            <div className="flex items-center gap-1">
              <p className="text-[8px] text-[#c5a059] uppercase font-black tracking-widest">Debates abertos por:</p>
              <button
                onClick={(e) => { e.stopPropagation(); if (item.addedBy) onProfileClick(item.addedBy); }}
                className="text-[8px] text-[#0b1d3a] uppercase font-black tracking-widest hover:underline hover:text-[#c5a059]"
              >
                {item.author || 'Membro'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MemberDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetUid = searchParams.get('uid');
  const highlightId = searchParams.get('id');
  
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
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
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

  // RecentProfessionalFeed e LibraryDiscussionFeed foram movidos para FORA do componente
  // para evitar re-criação a cada render (causa do bug de duplicação)

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

  const isEditingSomeoneElse = !!targetUid && isSuperAdmin && targetUid !== auth.currentUser?.uid;

  return (
    <div className="min-h-screen bg-[#f4efe2] flex flex-col font-sans overflow-x-hidden w-full selection:bg-[#c5a059]/30 selection:text-[#0b1d3a]">
      <Navbar />

      <main className="flex-1 pt-24 md:pt-28 pb-20 px-4 md:px-6 w-full max-w-full">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="relative mb-6 p-0.5 rounded-[1.8rem] border border-[#c5a059]/20 w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 md:p-6 bg-white rounded-[1.6rem] border border-white/40 w-full text-center sm:text-left">
              <div className="flex flex-row items-center gap-4 min-w-0 w-full sm:w-auto">
                 <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#0b1d3a] border-2 border-[#c5a059]/20 flex items-center justify-center text-[#c5a059] shadow-lg relative overflow-hidden group shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#c5a059]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Shield className="w-5 h-5 md:w-8 md:h-8 relative z-10" />
                 </div>
                 <div className="text-left min-w-0 flex-1">
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-[#c5a059] mb-0.5 block truncate">Área Restrita</span>
                    <h1 className="font-serif text-base md:text-2xl font-bold text-[#0b1d3a] uppercase tracking-wider leading-none break-words max-w-full">
                      Arca da Aliança <span className="gold-text block sm:inline">nº 34</span>
                    </h1>
                 </div>
              </div>

              <div className="flex flex-row items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-t-0 border-[#0b1d3a]/5 pt-3 sm:pt-0">
                {/* WIDGET DO PERFIL - AGORA APENAS INFORMATIVO E SEM CLIQUE (CORREÇÃO DE REDUNDÂNCIA) */}
                <div 
                  className="group relative flex-1 sm:flex-initial flex items-center gap-2.5 p-1.5 pr-4 sm:pr-6 bg-[#0b1d3a]/5 sm:bg-white border border-[#c5a059]/10 sm:border-[#c5a059]/20 rounded-xl min-w-0"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#0b1d3a]/5 overflow-hidden border border-[#c5a059]/10 shrink-0">
                    {userData?.photoURL ? (
                      <img src={userData.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#c5a059] font-serif text-sm">{userData?.displayName?.[0] || 'I'}</div>
                    )}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#0b1d3a] leading-tight line-clamp-1">{userData?.displayName || 'Ir. Obreiro'}</p>
                    <p className="text-[7px] font-bold text-[#c5a059] uppercase tracking-widest truncate">{userData?.currentRole || userData?.role || 'Membro'}</p>
                  </div>
                  
                  {isSuperAdmin && (
                    <div className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-[#c5a059] rounded-full flex items-center justify-center border border-white shadow-sm" title="Modo Administrador Ativo">
                      <Shield className="w-2.5 h-2.5 text-[#0b1d3a]" />
                    </div>
                  )}
                </div>
                
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2.5 sm:p-3 bg-[#0b1d3a]/5 border border-[#0b1d3a]/10 rounded-xl text-[#0b1d3a] hover:text-red-500 transition-colors uppercase tracking-[0.2em] text-[8px] sm:text-[9px] font-black shrink-0">
                  <LogOut className="w-3.5 h-3.5" /> <span>Sair</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Grid - sem shadow, sem border-radius complexo no mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '32px' }} className="md:flex md:flex-wrap">
             {[
               { id: 'welcome', label: 'Atividades', icon: LayoutDashboard },
               { id: 'library', label: 'Biblioteca', icon: BookMarked },
               { id: 'professional', label: 'Forja B2B', icon: Handshake },
               { id: 'social', label: 'Decisões', icon: Heart },
               { id: 'members', label: 'Obreiros', icon: Users },
               { id: 'profile', label: 'Meu Perfil', icon: UserCircle }
             ].map((tab) => {
               const TabIcon = tab.icon;
               const isActive = activeTab === tab.id;
               return (
                 <button
                   key={tab.id}
                   onClick={() => {
                     if (tab.id === 'profile' && !targetUid) {
                       navigate('/area-restrita?tab=profile');
                     } else {
                       setActiveTab(tab.id as any);
                     }
                   }}
                   style={{
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     justifyContent: 'center',
                     gap: '4px',
                     padding: '12px 8px',
                     borderRadius: '12px',
                     fontSize: '8px',
                     fontWeight: 900,
                     textTransform: 'uppercase',
                     letterSpacing: '0.05em',
                     border: `1px solid ${isActive ? '#c5a059' : 'rgba(197,160,89,0.3)'}`,
                     backgroundColor: isActive ? '#c5a059' : '#0b1d3a',
                     color: isActive ? '#0b1d3a' : 'white',
                     cursor: 'pointer',
                   }}
                 >
                   <TabIcon style={{ width: '16px', height: '16px', color: isActive ? '#0b1d3a' : '#c5a059', flexShrink: 0 }} />
                   <span>{tab.label}</span>
                 </button>
               );
             })}
          </div>

          {/* RENDERIZAÇÃO ESTÁVEL DO CORPO */}
          <div className="w-full relative">
            {activeTab === 'welcome' && (
              <div key="welcome" className="space-y-12 w-full max-w-full">
                {/* Welcome Card */}
                <div className="p-5 md:p-10 bg-[#f4e4bc] rounded-[2rem] border-2 border-[#d4b068] text-center w-full shadow-none md:shadow-md">
                   <div className="max-w-3xl mx-auto space-y-6 w-full">
                      <h2 className="font-serif text-xl md:text-4xl text-[#5d4037] font-bold italic tracking-tight uppercase break-words max-w-full">
                        Saudações Fraternais, <br className="sm:hidden" /> Ir. {userData?.displayName?.split(' ')[0]}
                      </h2>
                      <div className="h-0.5 w-16 bg-[#d4b068] mx-auto" />
                      <p className="font-serif text-[#5d4037]/90 text-xs md:text-lg leading-relaxed italic text-justify px-2 md:px-4">Seja bem-vindo ao Círculo Fechado da A.R.L.S. Arca da Aliança nº 34. Este ambiente digital foi erguido para que a nossa fraternidade não se limite apenas às nossas sessões físicas.</p>
                      <div className="pt-4 flex items-center justify-center gap-8">
                        <div className="text-center">
                          <p className="text-xl md:text-2xl font-serif font-black text-[#8b5e34]">{registeredUsers.length}</p>
                          <p className="text-[8px] uppercase font-black tracking-widest text-[#8b5e34]/60">Irmãos no Quadro</p>
                        </div>
                        <div className="w-px h-8 bg-[#d4b068]/30" />
                        <div className="text-center">
                          <p className="text-xl md:text-2xl font-serif font-black text-green-700">{onlineUsers.length}</p>
                          <p className="text-[8px] uppercase font-black tracking-widest text-green-700/60">Em Loja Virtual</p>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full">
                  <div className="space-y-6 w-full">
                    <div className="flex items-center justify-between border-b border-[#0b1d3a]/10 pb-4">
                      <h3 className="font-serif text-base md:text-xl font-bold text-[#0b1d3a] uppercase tracking-widest flex items-center gap-2">
                        <Handshake className="w-5 h-5 text-[#c5a059]" /> O Forja Profissional
                      </h3>
                      <button onClick={() => setActiveTab('professional')} className="text-[10px] uppercase font-black tracking-widest text-[#c5a059] hover:underline">Ver Todos</button>
                    </div>
                    <RecentProfessionalFeed items={recentProfessional} onNavigate={() => setActiveTab('professional')} />
                  </div>

                  <div className="space-y-6 w-full">
                    <div className="flex items-center justify-between border-b border-[#0b1d3a]/10 pb-4">
                      <h3 className="font-serif text-base md:text-xl font-bold text-[#0b1d3a] uppercase tracking-widest flex items-center gap-2">
                        <BookMarked className="w-5 h-5 text-[#c5a059]" /> Debates em Obra
                      </h3>
                      <button onClick={() => setActiveTab('library')} className="text-[10px] uppercase font-black tracking-widest text-[#c5a059] hover:underline">Ir para Biblioteca</button>
                    </div>
                    <LibraryDiscussionFeed items={discussedLibrary} onNavigate={() => setActiveTab('library')} onProfileClick={(uid) => navigate(`/area-restrita?uid=${uid}&tab=profile`)} />
                  </div>
                </div>

                {/* Dashboard Integrated Activity Section */}
                <div className="space-y-10 w-full">
                  {/* Decisions Panel */}
                  <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-[#0b1d3a]/5 shadow-sm w-full">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <Heart className="w-8 h-8 text-[#c5a059]" />
                        <h3 className="font-cinzel text-xl md:text-2xl font-bold text-[#0b1d3a] uppercase tracking-widest">Painel de Decisões</h3>
                      </div>
                      <button onClick={() => setActiveTab('social')} className="text-[10px] font-black uppercase tracking-widest text-[#c5a059] hover:underline">Ver Completo</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                      {socialItems.slice(0, 2).map((action) => (
                        <div key={action.id} className="p-6 bg-[#0b1d3a]/5 border border-[#c5a059]/10 rounded-[2rem] hover:border-[#c5a059]/30 transition-all group text-left">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mb-4 inline-block ${action.type === 'poll' ? 'bg-[#0b1d3a]/10 text-[#0b1d3a]' : 'bg-[#c5a059]/10 text-[#c5a059]'}`}>
                            {action.type === 'poll' ? 'Enquete' : 'Arrecadação'}
                          </span>
                          <h4 className="font-serif font-bold text-[#0b1d3a] text-base md:text-lg mb-2">{action.title}</h4>
                          <p className="text-[11px] text-[#0b1d3a]/70 line-clamp-2 italic mb-6 leading-relaxed">"{action.description}"</p>
                          <button onClick={() => setActiveTab('social')} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] flex items-center gap-2 group-hover:gap-4 transition-all">Participar agora <span>→</span></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Members Gallery */}
                  <div className="space-y-6 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#0b1d3a]/10 pb-4 gap-3">
                      <div className="text-left">
                        <h3 className="font-serif text-xl md:text-2xl font-bold text-[#0b1d3a] uppercase tracking-widest">Soberano Quadro de Obreiros</h3>
                        <p className="text-[#0b1d3a]/40 text-[10px] italic font-serif">"Irmãos que vivem em união"</p>
                      </div>
                      <button onClick={() => setActiveTab('members')} className="w-fit px-6 py-2 border border-[#c5a059]/30 rounded-full text-[10px] font-black uppercase tracking-widest text-[#0b1d3a] hover:bg-[#c5a059] transition-all">Ver em Tela Cheia</button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 w-full">
                      {registeredUsers.filter(u => u.status !== 'PENDING').slice(0, 12).map((member) => (
                        <div 
                          key={member.id}
                          onClick={() => navigate(`/area-restrita?uid=${member.id}&tab=profile`)}
                          className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#0b1d3a]/5 hover:border-[#c5a059]/30 hover:-translate-y-1 transition-all cursor-pointer shadow-sm group text-center flex flex-col justify-between h-full min-w-0"
                        >
                          <div className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 flex-shrink-0">
                            <div className="w-full h-full rounded-full bg-[#c5a059]/10 border-2 border-[#c5a059]/20 overflow-hidden shadow-inner">
                              {member.photoURL ? (
                                <img src={member.photoURL} alt={member.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#c5a059] text-lg sm:text-xl font-serif">
                                  {member.displayName?.[0] || 'I'}
                                </div>
                              )}
                            </div>
                            {member.isOnline && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-md" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-serif text-[10px] sm:text-[11px] font-bold text-[#0b1d3a] group-hover:text-[#c5a059] transition-colors truncate">{member.displayName || 'Ir. Obreiro'}</h4>
                            <p className="text-[6px] sm:text-[7px] text-[#c5a059] font-black uppercase tracking-widest truncate">{member.currentRole || member.role || 'Membro'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'library' && (
              <div key="library" className="w-full">
                <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center w-full">
                  <div className="relative w-full flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b1d3a]/30 group-focus-within:text-[#0b1d3a] transition-colors" />
                    <input type="text" placeholder="Buscar estudos, rituais..." className="w-full bg-white border border-[#0b1d3a]/10 rounded-2xl p-4 pl-12 text-[#0b1d3a] text-xs outline-none focus:border-[#c5a059]/50 shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  <button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-[#0b1d3a] text-[#f4efe2] border border-[#c5a059]/30 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#c5a059] transition-all shadow-md">
                    <Plus className="w-4 h-4" /> Adicionar Obra
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                  {filteredItems.map((item, index) => (
                    <LibraryItemCard 
                      key={item.id} 
                      item={item} 
                      index={index} 
                      isHighlighted={highlightId === item.id}
                      isExpanded={expandedComments === item.id}
                      onToggleComments={() => setExpandedComments(expandedComments === item.id ? null : item.id)}
                      onShare={() => {
                        const message = `📚 *${item.title}*\n\nMeus irmãos, desejo compartilhar este estudo com vocês.\nLink: ${window.location.origin}/area-restrita?id=${item.id}&tab=library`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                      onDelete={hasElevatedAccess ? () => handleDeleteItem(item.id) : undefined}
                      onEdit={hasElevatedAccess ? () => {
                        alert('Funcionalidade de edição em desenvolvimento.');
                      } : undefined}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'professional' && (
              <div key="professional" className="w-full">
                <ProfessionalBoard />
              </div>
            )}

            {activeTab === 'social' && (
              <div key="social" className="space-y-8 w-full">
                 <div className="p-5 md:p-10 bg-white border border-[#0b1d3a]/10 rounded-[2rem] md:rounded-[3.5rem] shadow-sm w-full">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center mb-8 md:mb-10 text-center md:text-left w-full">
                       <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-[#0b1d3a]/10 border border-[#0b1d3a]/20 flex items-center justify-center text-[#0b1d3a] flex-shrink-0">
                          <Heart className="w-8 h-8 md:w-12 md:h-12" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <h2 className="text-xl md:text-3xl font-serif text-[#0b1d3a] font-bold mb-2 uppercase tracking-widest truncate">Painel de Decisões e <span className="text-[#c5a059]">Ações Sociais</span></h2>
                          <p className="text-[#0b1d3a]/60 text-xs md:text-sm italic font-serif leading-relaxed">Este espaço é destinado à deliberação sobre nossas obras de assistência e suporte social.</p>
                       </div>
                       {hasElevatedAccess && (
                         <div className="flex gap-2 w-full md:w-auto justify-center shrink-0">
                           <button onClick={() => { setSocialType('poll'); setShowSocialModal(true); }} className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-[#0b1d3a]/10 text-[#0b1d3a] rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-white/80 transition-all">Nova Enquete</button>
                           <button onClick={() => { setSocialType('philanthropy'); setShowSocialModal(true); }} className="flex-1 md:flex-none px-4 py-2.5 bg-[#0b1d3a] text-[#f4efe2] border border-[#c5a059]/30 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-xl hover:bg-[#c5a059]">Nova Filantropia</button>
                         </div>
                       )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                       {socialItems.map((action) => (
                         <div key={action.id} className="p-6 md:p-8 bg-white border border-[#0b1d3a]/10 rounded-[2rem] group relative text-left w-full">
                            <div className="flex justify-between items-start mb-6 gap-2 w-full">
                               <div className="flex flex-col gap-1 min-w-0 w-full">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider w-fit block ${
                                    action.type === 'poll' ? 'bg-blue-500/10 text-blue-600' : 
                                    action.type === 'philanthropy' ? 'bg-green-500/10 text-green-600' : 
                                    'bg-[#c5a059]/10 text-[#c5a059]'
                                  }`}>
                                    {action.type === 'poll' ? 'Enquete' : action.type === 'philanthropy' ? 'Arrecadação' : 'Decisão'}
                                  </span>
                                  <p className="text-[8px] text-[#0b1d3a]/30 uppercase font-black tracking-widest mt-1 truncate">Por: {action.creatorName}</p>
                               </div>
                               <div className="flex flex-col items-end gap-1 shrink-0">
                                 {action.type === 'philanthropy' && (
                                   <p className="text-[#c5a059] font-bold text-[11px]">Meta: R$ {action.goal?.toLocaleString()}</p>
                                 )}
                                 <div className="flex items-center gap-2">
                                   {new Date(action.openingDate) > new Date() && (
                                     <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-600 rounded text-[7px] font-black uppercase tracking-wider">Agendado</span>
                                   )}
                                   {new Date(action.closingDate) < new Date() && (
                                     <span className="px-1.5 py-0.5 bg-red-500/10 text-red-600 rounded text-[7px] font-black uppercase tracking-wider">Encerrado</span>
                                   )}
                                   {new Date(action.openingDate) <= new Date() && new Date(action.closingDate) >= new Date() && (
                                     <span className="px-1.5 py-0.5 bg-green-500/10 text-green-600 rounded text-[7px] font-black uppercase tracking-wider">Ativo</span>
                                   )}
                                 </div>
                               </div>
                            </div>

                            <h3 className="text-[#0b1d3a] font-serif text-base font-bold mb-2 group-hover:text-[#c5a059] transition-colors">{action.title}</h3>
                            <p className="text-[#0b1d3a]/60 text-[11px] mb-6 italic leading-relaxed line-clamp-3">"{action.description}"</p>

                            {action.type === 'poll' && (
                              <div className="space-y-2 mb-6 w-full">
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
                                      className={`w-full relative overflow-hidden p-2.5 rounded-xl border transition-all text-left ${
                                        hasVoted && action.votes![userId] === i 
                                          ? 'bg-[#c5a059]/20 border-[#c5a059]/50' 
                                          : 'bg-white border-[#0b1d3a]/10 hover:border-[#c5a059]/30'
                                      }`}
                                    >
                                      <div className="absolute inset-y-0 left-0 bg-[#c5a059]/10" style={{ width: `${percentage}%` }} />
                                      <div className="relative flex justify-between items-center text-[10px] w-full">
                                        <span className="text-[#0b1d3a] font-bold truncate pr-4">{opt.text}</span>
                                        <span className="text-[#c5a059] font-black shrink-0">{percentage}%</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {action.type === 'philanthropy' && (
                              <div className="space-y-2 mb-6 w-full">
                                <div className="h-1.5 bg-[#0b1d3a]/5 rounded-full overflow-hidden w-full">
                                  <div 
                                    className="h-full bg-gradient-to-r from-green-600 to-emerald-500 transition-all duration-1000" 
                                    style={{ width: `${Math.min(100, ((action.current || 0) / (action.goal || 1)) * 100)}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-[8px] font-black uppercase tracking-wider w-full">
                                  <span className="text-green-600">Total: R$ {action.current?.toLocaleString()}</span>
                                  <span className="text-[#0b1d3a]/40">Meta: R$ {action.goal?.toLocaleString()}</span>
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2 border-t border-[#0b1d3a]/5 pt-4 mt-auto w-full">
                               {hasElevatedAccess && (
                                 <button 
                                   onClick={() => {
                                     const newDate = window.prompt('Nova Data (YYYY-MM-DDTHH:MM):', action.closingDate);
                                     if (newDate) {
                                       updateDoc(doc(db, 'social_actions', action.id), { closingDate: newDate });
                                     }
                                   }}
                                   className="p-2 bg-white border border-[#0b1d3a]/10 rounded-lg text-[#0b1d3a] hover:bg-[#c5a059] transition-all shrink-0"
                                   title="Prazo"
                                 >
                                   <Calendar className="w-3.5 h-3.5" />
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

                                     doc.setFontSize(12);
                                     doc.text(`Ação: ${action.title}`, 20, 42);
                                     doc.setFontSize(10);
                                     doc.setFont('helvetica', 'normal');
                                     doc.text(`Tipo: ${action.type === 'poll' ? 'Escrutínio (Enquete)' : 'Projeto de Filantropia'}`, 20, 48);
                                     doc.text(`Status: ${action.status || 'Ativo'}`, 20, 54);
                                     doc.text(`Criador por: ${action.creatorName || 'Irmão'}`, 20, 60);

                                     if (action.type === 'poll' && action.options) {
                                       const total = action.options.reduce((acc: number, cur: any) => acc + (cur.count || 0), 0);
                                       const tableData = action.options.map((opt: any) => [
                                         opt.text, 
                                         opt.count || 0, 
                                         total > 0 ? `${Math.round((opt.count / total) * 100)}%` : '0%'
                                       ]);
                                       autoTable(doc, {
                                         startY: 68,
                                         head: [['Opção de Voto', 'Total de Votos', 'Percentual']],
                                         body: tableData,
                                         theme: 'striped',
                                         headStyles: { fillColor: [11, 29, 58] }
                                       });
                                     } else {
                                       const tableData = [
                                         ['Meta de Arrecadação', `R$ ${action.goal?.toLocaleString() || '0,00'}`],
                                         ['Total Arrecadado', `R$ ${action.current?.toLocaleString() || '0,00'}`],
                                         ['Progresso', `${Math.round(((action.current || 0) / (action.goal || 1)) * 100)}%`]
                                       ];
                                       autoTable(doc, {
                                         startY: 68,
                                         head: [['Métrica de Suporte', 'Valor']],
                                         body: tableData,
                                         theme: 'striped',
                                         headStyles: { fillColor: [11, 29, 58] }
                                       });
                                     }

                                     doc.save(`projeto_${action.id}.pdf`);
                                   }}
                                   className="p-2 bg-white border border-[#0b1d3a]/10 rounded-lg text-[#c5a059] hover:bg-green-600 hover:text-white transition-all shrink-0"
                                   title="Baixar Relatório PDF"
                                 >
                                    <Download className="w-3.5 h-3.5" />
                                 </button>
                               )}
                               {hasElevatedAccess && (
                                 <button 
                                   onClick={() => {
                                     if (window.confirm('Excluir esta ação permanentemente do painel social?')) {
                                       deleteDoc(doc(db, 'social_actions', action.id));
                                     }
                                   }}
                                   className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shrink-0 ml-auto"
                                   title="Excluir Ação"
                                 >
                                    <Trash2 className="w-3.5 h-3.5" />
                                 </button>
                               )}
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div key="members" className="space-y-8 w-full">
                <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                  <div className="relative w-full flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b1d3a]/30 group-focus-within:text-[#0b1d3a] transition-colors" />
                    <input type="text" placeholder="Buscar irmão por nome..." className="w-full bg-white border border-[#0b1d3a]/10 rounded-2xl p-4 pl-12 text-[#0b1d3a] text-xs outline-none focus:border-[#c5a059]/50 shadow-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 w-full">
                  {registeredUsers.filter(u => u.status !== 'PENDING' && (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase())).map((member) => (
                    <div 
                      key={member.id}
                      onClick={() => navigate(`/area-restrita?uid=${member.id}&tab=profile`)}
                      className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-[2rem] border border-[#0b1d3a]/5 hover:border-[#c5a059]/30 hover:-translate-y-1 transition-all cursor-pointer shadow-sm group text-center w-full flex flex-col justify-between h-full min-w-0"
                    >
                      <div className="relative w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 flex-shrink-0">
                        <div className="w-full h-full rounded-full bg-[#c5a059]/10 border-2 border-[#c5a059]/20 overflow-hidden shadow-inner">
                          {member.photoURL ? (
                            <img src={member.photoURL} alt={member.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#c5a059] text-2xl sm:text-3xl font-serif">
                              {member.displayName?.[0] || 'I'}
                            </div>
                          )}
                        </div>
                        {member.isOnline && (
                          <div className="absolute bottom-1 right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white shadow-md" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <h3 className="font-serif text-[11px] sm:text-base font-bold text-[#0b1d3a] group-hover:text-[#c5a059] transition-colors line-clamp-1">{member.displayName || 'Ir. Obreiro'}</h3>
                        <p className="text-[7px] sm:text-[9px] text-[#c5a059] font-black uppercase tracking-widest sm:tracking-[0.2em] mb-1 sm:mb-2 truncate">{member.currentRole || member.role || 'Membro'}</p>
                      </div>
                      <div className="mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-[#0b1d3a]/5 flex items-center justify-center gap-1 sm:gap-2 text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-[#0b1d3a]/30 group-hover:text-[#c5a059] transition-colors flex-shrink-0">
                        Ver Perfil Completo <span>→</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div key="profile" className="max-w-4xl mx-auto space-y-8 w-full">
                 {(isEditingSomeoneElse || (targetUid && targetUid !== auth.currentUser?.uid)) && (
                   <div className={`${isSuperAdmin ? 'bg-[#c5a059]' : 'bg-[#0b1d3a]'} p-4 rounded-xl flex items-center justify-between shadow-xl w-full`}>
                     <p className={`${isSuperAdmin ? 'text-[#0b1d3a]' : 'text-[#f4efe2]'} font-black uppercase tracking-wider text-[9px] truncate`}>
                       Visualizando Perfil: <span className="underline">{targetMemberData?.displayName || targetMemberData?.email}</span> {isReadOnly ? '(Somente Leitura)' : '(Modo Admin)'}
                     </p>
                     <button onClick={() => navigate('/area-restrita?tab=welcome')} className="text-inherit hover:scale-105 transition-transform shrink-0">
                       <X className="w-5 h-5" />
                     </button>
                   </div>
                 )}

                 <div className="bg-[#0b1d3a]/5 border border-[#0b1d3a]/10 rounded-[2rem] md:rounded-[3rem] p-5 md:p-10 shadow-sm w-full">
                    <h2 className="text-center font-serif text-2xl md:text-3xl font-bold text-[#0b1d3a] mb-8 uppercase tracking-widest">Dados Pessoais</h2>
                    <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start text-center md:text-left w-full">
                      <div className="flex flex-col items-center gap-4 w-full md:w-48 text-center shrink-0">
                         <div className="relative">
                            <div className="w-32 h-44 rounded-2xl bg-[#c5a059]/10 border-2 border-[#c5a059]/20 overflow-hidden relative shadow-md">
                               {editProfileData.photoURL ? (
                                 <img src={editProfileData.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-[#c5a059] text-5xl font-serif">
                                   {editProfileData.displayName?.[0] || 'I'}
                                 </div>
                               )}
                            </div>
                            {(!isReadOnly || isSuperAdmin) && (
                              <button 
                                type="button"
                                onClick={handleUpdatePhoto} 
                                className="absolute -bottom-2 -right-2 p-2.5 bg-[#c5a059] text-[#0b1d3a] rounded-xl shadow-xl hover:scale-110 active:scale-95 transition-all z-50 cursor-pointer"
                                title="Alterar Foto"
                              >
                                 <Camera className="w-4 h-4" />
                              </button>
                            )}
                         </div>
                         <div className="min-w-0 w-full">
                            <h3 className="font-serif text-lg font-bold text-[#c5a059] uppercase tracking-wider truncate">{editProfileData.displayName || 'Ir. Obreiro'}</h3>
                            <p className="text-[#0b1d3a]/80 font-black tracking-widest text-[8px] uppercase mt-0.5">{targetMemberData?.currentRole || targetMemberData?.role || 'Membro'}</p>
                         </div>
                      </div>

                      <div className="flex-1 space-y-4 w-full">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            <div className="space-y-1 w-full">
                               <label className="text-[9px] text-[#0b1d3a]/60 uppercase font-black tracking-wider ml-1 text-left block">Nome de Obreiro</label>
                               <input 
                                className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-3.5 text-xs text-[#0b1d3a] font-bold outline-none focus:border-[#c5a059]" 
                                value={editProfileData.displayName} 
                                onChange={e => setEditProfileData(prev => ({ ...prev, displayName: e.target.value }))} 
                                disabled={isReadOnly}
                               />
                            </div>
                            <div className="space-y-1 w-full">
                               <label className="text-[9px] text-[#0b1d3a]/60 uppercase font-black tracking-wider ml-1 text-left block">Cargo Atual (Oficial)</label>
                               <div className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-3.5 text-[#0b1d3a]/50 text-xs italic flex items-center gap-2">
                                  <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059]" />
                                  {targetMemberData?.currentRole || targetMemberData?.role || 'Membro'}
                               </div>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            <div className="space-y-1 w-full">
                               <label className="text-[9px] text-[#0b1d3a]/60 uppercase font-black tracking-wider ml-1 text-left block">Profissão</label>
                               <input 
                                className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-3.5 text-xs text-[#0b1d3a] font-bold outline-none focus:border-[#c5a059]" 
                                placeholder="Sua ocupação..." 
                                value={editProfileData.occupation} 
                                onChange={e => setEditProfileData(prev => ({ ...prev, occupation: e.target.value }))} 
                                disabled={isReadOnly}
                               />
                            </div>
                            <div className="space-y-1 w-full">
                               <label className="text-[9px] text-[#0b1d3a]/60 uppercase font-black tracking-wider ml-1 text-left block">Link MVU</label>
                               <input 
                                className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-3.5 text-xs text-[#0b1d3a] font-bold outline-none focus:border-[#c5a059]" 
                                placeholder="https://..." 
                                value={editProfileData.mvu_link} 
                                onChange={e => setEditProfileData(prev => ({ ...prev, mvu_link: e.target.value }))} 
                                disabled={isReadOnly}
                               />
                            </div>
                         </div>

                         <div className="space-y-1 w-full">
                            <label className="text-[9px] text-[#0b1d3a]/60 uppercase font-black tracking-wider ml-1 text-left block">Apresentação & História Maçônica</label>
                            <textarea 
                              className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-3.5 text-xs text-[#0b1d3a] leading-relaxed outline-none focus:border-[#c5a059] resize-none" 
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
                             className="w-full py-3.5 bg-[#0b1d3a] text-[#f4efe2] border border-[#c5a059]/30 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-xl hover:bg-[#c5a059] transition-all flex items-center justify-center gap-2"
                           >
                             {isSavingProfile ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                             SALVAR DADOS PESSOAIS
                           </button>
                         )}
                      </div>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-[#0b1d3a]/95 text-white" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xl bg-[#f4efe2] rounded-[2.5rem] border border-[#c5a059]/30 shadow-2xl p-6 md:p-10">
               <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#0b1d3a] mb-6 uppercase tracking-widest text-center">Adicionar à <span className="text-[#c5a059]">Biblioteca</span></h2>
               <form className="space-y-4" onSubmit={(e) => {
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
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] text-[#0b1d3a]/60 uppercase font-black tracking-wider ml-1">Título da Obra</label>
                    <input name="title" required className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-3 text-xs text-[#0b1d3a] font-bold outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="space-y-1">
                      <label className="text-[9px] text-[#0b1d3a]/60 uppercase font-black tracking-wider ml-1">Categoria</label>
                      <select name="category" className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-3 text-xs text-[#0b1d3a] font-bold outline-none">
                        <option>Ritualística</option>
                        <option>Filosofia</option>
                        <option>Instrução</option>
                        <option>Legislação</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-[#0b1d3a]/60 uppercase font-black tracking-wider ml-1">Tipo</label>
                      <select className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-3 text-xs text-[#0b1d3a] font-bold outline-none" value={newItemType} onChange={(e) => setNewItemType(e.target.value as any)}>
                        <option value="LINK">Link / Vídeo</option>
                        <option value="PDF">Documento PDF</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] text-[#0b1d3a]/60 uppercase font-black tracking-wider ml-1">Link Direto</label>
                    <input name="url" required className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-3 text-xs text-[#0b1d3a] font-bold outline-none" />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] text-[#0b1d3a]/60 uppercase font-black tracking-wider ml-1">Descrição</label>
                    <textarea name="description" rows={3} className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-3 text-xs text-[#0b1d3a] outline-none resize-none" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 border border-[#0b1d3a]/10 rounded-xl text-[#0b1d3a] font-black uppercase text-[9px] tracking-wider">Cancelar</button>
                    <button type="submit" className="flex-1 py-3 bg-[#0b1d3a] text-[#f4efe2] rounded-xl font-black uppercase text-[9px] tracking-wider hover:bg-[#c5a059] transition-all">Publicar</button>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSocialModal(false)} className="fixed inset-0 bg-[#0b1d3a]/95 text-white" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xl bg-[#f4efe2] rounded-[2.5rem] border border-[#c5a059]/30 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
               <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#0b1d3a] mb-6 uppercase tracking-widest text-center">Nova Ação <span className="text-[#c5a059]">{socialType === 'poll' ? 'de Escrutínio' : 'Filantrópica'}</span></h2>
               
               <form onSubmit={handleCreateSocialAction} className="space-y-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] text-[#0b1d3a]/60 uppercase font-black tracking-wider ml-1">Título da Ação</label>
                    <input name="title" required className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-3.5 text-xs text-[#0b1d3a] font-bold outline-none" placeholder="Título" />
                  </div>
                  
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] text-[#0b1d3a]/60 uppercase font-black tracking-wider ml-1">Descrição Detalhada</label>
                    <textarea name="description" required rows={3} className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-3.5 text-xs text-[#0b1d3a] outline-none resize-none" placeholder="Objetivos..." />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                     <div className="space-y-1">
                        <label className="text-[9px] text-[#0b1d3a]/60 uppercase font-black tracking-wider ml-1">Abertura</label>
                        <input name="openingDate" type="datetime-local" required className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-3.5 text-xs text-[#0b1d3a] font-bold outline-none" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[9px] text-[#0b1d3a]/60 uppercase font-black tracking-wider ml-1">Encerramento</label>
                        <input name="closingDate" type="datetime-local" required className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-3.5 text-xs text-[#0b1d3a] font-bold outline-none" />
                     </div>
                  </div>

                  {socialType === 'poll' && (
                    <div className="space-y-3 text-left">
                       <label className="text-[9px] text-[#0b1d3a]/60 uppercase font-black tracking-wider ml-1">Opções de Voto</label>
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
                              className="flex-1 bg-white border border-[#0b1d3a]/10 rounded-xl p-3 text-xs text-[#0b1d3a] font-bold outline-none" 
                              placeholder={`Opção ${i + 1}`} 
                            />
                            {i > 1 && (
                              <button type="button" onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))} className="p-3 bg-red-50 text-red-500 rounded-xl"><Trash2 className="w-3.5 h-3.5" /></button>
                            )}
                         </div>
                       ))}
                       <button type="button" onClick={() => setPollOptions([...pollOptions, ''])} className="text-[9px] font-black uppercase tracking-widest text-[#c5a059] flex items-center gap-1 hover:underline"><Plus className="w-3.5 h-3.5" /> Adicionar Opção</button>
                    </div>
                  )}

                  {socialType === 'philanthropy' && (
                    <div className="space-y-1 text-left">
                       <label className="text-[9px] text-[#0b1d3a]/60 uppercase font-black tracking-wider ml-1">Meta Financeira (R$)</label>
                       <input name="goal" type="number" step="0.01" required className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-3.5 text-xs text-[#0b1d3a] font-bold outline-none" placeholder="0.00" />
                    </div>
                  )}

                  <div className="pt-2 flex gap-3">
                    <button type="button" onClick={() => setShowSocialModal(false)} className="flex-1 py-3.5 border border-[#0b1d3a]/10 rounded-xl text-[#0b1d3a] font-black uppercase text-[9px] tracking-wider">Cancelar</button>
                    <button type="submit" disabled={isSubmittingSocial} className="flex-1 py-3.5 bg-[#0b1d3a] text-[#f4efe2] border border-[#c5a059]/30 rounded-xl font-black uppercase text-[9px] tracking-wider shadow-md hover:bg-[#c5a059]">
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
