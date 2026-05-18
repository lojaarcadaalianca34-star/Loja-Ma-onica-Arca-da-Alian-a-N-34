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
  const isSuperAdmin = auth.currentUser?.email?.toLowerCase() === 'lojaarcadaalianca34@gmail.com' || 
    auth.currentUser?.email?.toLowerCase() === 'sophiabohn@gmail.com';

  const hasElevatedAccess = isSuperAdmin || 
    ['Venerável Mestre', 'Venerável', 'Tesoureiro', 'Secretário', 'Secretario', 'Hospitaleiro'].some(role => 
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

  // Fetch All Registered Users for Quadro de Obreiros
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

  const targetUid = searchParams.get('uid');
  const isEditingSomeoneElse = !!targetUid && isSuperAdmin && targetUid !== auth.currentUser?.uid;

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
      alert('Perfil updated com sucesso!');
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
          {/* Header Section - RESPONSIVO E COM CORES SÓLIDAS NO MOBILE */}
          <div className="relative mb-8 p-1 rounded-[2.5rem] bg-gradient-to-br from-[#c5a059]/20 via-transparent to-[#0b1d3a]/5 overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-8 bg-white md:bg-white/