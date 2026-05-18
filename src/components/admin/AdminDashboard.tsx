import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db, auth, logout, handleFirestoreError, OperationType, storage } from '@/src/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, setDoc, deleteDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useContent } from '@/src/context/ContentContext';
import { LogOut, Users, FileText, Save, Check, RefreshCw, X, Brain, Printer, ChevronDown, ChevronUp, Book, Video, Globe, Star, Play, Download, LayoutDashboard, ExternalLink, ArrowLeft, ShieldCheck, Clock, Eye, EyeOff, Plus, Upload, Link as LinkIcon, Trash2, MessageSquare, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeCandidate } from '@/src/services/masonicAnalysisService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const LibraryItemEditor = ({ 
  item, 
  handleLibraryFileUpload, 
  uploadingItems 
}: any) => {
  const [localItem, setLocalItem] = useState(item);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalItem(item);
    setHasChanges(false);
  }, [item]);

  const handleChange = (field: string, value: any) => {
    setLocalItem((prev: any) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const saveChanges = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'library_items', item.id), {
        title: localItem.title || '',
        author: localItem.author || '',
        url: localItem.url || '',
        youtubeUrl: localItem.youtubeUrl || '',
        description: localItem.description || '',
        updatedAt: serverTimestamp()
      });
      setHasChanges(false);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `library_items/${item.id}`);
    } finally {
      setIsSaving(false);
    }
  };

  const itemType = (item.type || 'link').toLowerCase();

  return (
    <div className="bg-white/40 p-8 rounded-3xl border border-[#0b1d3a]/5 space-y-6 relative group shadow-sm">
      {hasChanges && (
        <div className="absolute top-4 right-16 animate-pulse">
           <span className="text-[8px] bg-[#0b1d3a] text-[#f4efe2] px-2 py-1 rounded font-black uppercase">Alterações Pendentes</span>
        </div>
      )}
      
      <div className="flex justify-between items-start">
         <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] text-[#0b1d3a] uppercase font-black mb-1 font-bold">Título</label>
                <input 
                  className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] text-sm outline-none focus:border-[#c5a059]/50 shadow-sm"
                  value={localItem.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  onBlur={saveChanges}
                />
              </div>
              <div>
                <label className="block text-[9px] text-[#0b1d3a] uppercase font-black mb-1 font-bold">Autor</label>
                <input 
                  className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] text-sm outline-none focus:border-[#c5a059]/50 shadow-sm"
                  value={localItem.author || ''}
                  onChange={(e) => handleChange('author', e.target.value)}
                  onBlur={saveChanges}
                />
              </div>
              <div>
                  <label className="block text-[9px] text-[#0b1d3a] uppercase font-black mb-1 font-bold">Tipo de Conteúdo</label>
                  <select 
                    className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] text-sm outline-none focus:border-[#c5a059]/50 cursor-pointer shadow-sm"
                    value={itemType}
                    onChange={async (e) => {
                      try {
                        await updateDoc(doc(db, 'library_items', item.id), { type: e.target.value.toLowerCase() });
                      } catch (err) {
                        handleFirestoreError(err, OperationType.UPDATE, `library_items/${item.id}`);
                      }
                    }}
                  >
                    <option value="link">Link Externo</option>
                    <option value="pdf">Documento PDF</option>
                    <option value="video">Vídeo / Youtube</option>
                  </select>
              </div>
            </div>

            <div className="space-y-4">
              {itemType === 'video' ? (
                <div>
                    <label className="block text-[9px] text-[#0b1d3a] uppercase font-black mb-1 font-bold">Link Youtube</label>
                    <input 
                      className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] text-sm outline-none focus:border-[#c5a059]/50 shadow-sm"
                      value={localItem.youtubeUrl || ''}
                      placeholder="https://youtube.com/..."
                      onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                      onBlur={saveChanges}
                    />
                </div>
              ) : itemType === 'pdf' ? (
                <div>
                  <label className="block text-[9px] text-[#0b1d3a] uppercase font-black mb-1 font-bold">Anexo PDF</label>
                  <div className="flex flex-col gap-2">
                    {localItem.url ? (
                      <div className="flex items-center gap-2 p-3 bg-white/40 border border-[#0b1d3a]/10 rounded-lg mb-2 shadow-inner">
                        <FileText className="w-4 h-4 text-[#0b1d3a]" />
                        <span className="text-[10px] text-[#0b1d3a]/60 truncate flex-1">{localItem.url.split('/').pop()?.split('?')[0] || 'Documento PDF'}</span>
                        <a href={localItem.url} target="_blank" rel="noreferrer" className="text-[#c5a059] hover:text-[#0b1d3a]">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : null}
                    <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-[#0b1d3a]/10 rounded-xl hover:border-[#c5a059]/30 hover:bg-[#c5a059]/5 transition-all cursor-pointer group shadow-sm bg-white/20">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleLibraryFileUpload(item.id, file);
                        }}
                      />
                      {uploadingItems[item.id] ? (
                        <RefreshCw className="w-5 h-5 text-[#c5a059] animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5 text-[#0b1d3a]/40 group-hover:text-[#0b1d3a]" />
                      )}
                      <span className="text-[10px] uppercase font-bold text-[#0b1d3a]/40 group-hover:text-[#0b1d3a]">
                        {uploadingItems[item.id] ? 'Enviando...' : localItem.url ? 'Substituir Documento' : 'Enviar PDF do Computador'}
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[9px] text-[#0b1d3a] uppercase font-black mb-1 font-bold">Link de Acesso</label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0b1d3a]/20" />
                      <input 
                        className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 pl-10 text-[#0b1d3a] text-sm outline-none focus:border-[#c5a059]/50 shadow-sm"
                        value={localItem.url || ''}
                        placeholder="https://..."
                        onChange={(e) => handleChange('url', e.target.value)}
                        onBlur={saveChanges}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-2">
                 <label className="flex items-center gap-2 cursor-pointer group">
                   <input 
                     type="checkbox"
                     checked={item.isPublic}
                     onChange={async (e) => {
                       try {
                         await updateDoc(doc(db, 'library_items', item.id), { isPublic: e.target.checked });
                       } catch (err) { handleFirestoreError(err, OperationType.UPDATE, 'library_items'); }
                     }}
                     className="w-4 h-4 rounded border-[#0b1d3a]/20 bg-white/5 text-[#c5a059]"
                   />
                   <span className="text-[10px] uppercase font-bold text-[#0b1d3a]/40 group-hover:text-[#0b1d3a] transition-colors">Público</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer group">
                   <input 
                     type="checkbox"
                     checked={item.isHighlightedInCircle}
                     onChange={async (e) => {
                       try {
                         await updateDoc(doc(db, 'library_items', item.id), { isHighlightedInCircle: e.target.checked });
                       } catch (err) { handleFirestoreError(err, OperationType.UPDATE, 'library_items'); }
                     }}
                     className="w-4 h-4 rounded border-[#0b1d3a]/20 bg-white/5 text-[#c5a059]"
                   />
                   <span className="text-[10px] uppercase font-bold text-[#0b1d3a]/40 group-hover:text-[#0b1d3a] transition-colors">Destaque</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer group">
                   <input 
                     type="checkbox"
                     checked={item.isFixedInCircle}
                     onChange={async (e) => {
                       try {
                         await updateDoc(doc(db, 'library_items', item.id), { isFixedInCircle: e.target.checked });
                       } catch (err) { handleFirestoreError(err, OperationType.UPDATE, 'library_items'); }
                     }}
                     className="w-4 h-4 rounded border-[#0b1d3a]/20 bg-white/5 text-[#c5a059]"
                   />
                   <span className="text-[10px] uppercase font-bold text-[#0b1d3a]/40 group-hover:text-[#0b1d3a] transition-colors">Fixo</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer group text-[#c5a059]">
                    <input 
                      type="checkbox"
                      checked={item.isCuriosity}
                      onChange={async (e) => {
                        try {
                          await updateDoc(doc(db, 'library_items', item.id), { isCuriosity: e.target.checked });
                        } catch (err) { handleFirestoreError(err, OperationType.UPDATE, 'library_items'); }
                      }}
                      className="w-4 h-4 rounded border-[#c5a059]/20 bg-white/5 text-[#c5a059]"
                    />
                    <Star className="w-3 h-3" />
                    <span className="text-[10px] uppercase font-black">Curiosidade</span>
                  </label>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <textarea 
                className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] text-xs outline-none flex-1 mb-4 shadow-sm"
                placeholder="Resumo ou descrição..."
                rows={3}
                value={localItem.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                onBlur={saveChanges}
              />
              <div className="flex justify-between items-center">
                <div className="text-[8px] text-[#0b1d3a]/20 uppercase font-bold tracking-widest">
                  Criado em: {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'Recentemente'}
                </div>
                {hasChanges && (
                  <button 
                    onClick={saveChanges}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-3 py-1 bg-[#0b1d3a] text-[#f4efe2] text-[9px] rounded font-black uppercase hover:bg-[#c5a059] transition-all shadow-lg"
                  >
                    {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Salvar Alterações
                  </button>
                )}
              </div>
            </div>
         </div>

         <button 
            onClick={async () => {
              if (window.confirm('Tem certeza que deseja excluir esta obra?')) {
                try {
                  await deleteDoc(doc(db, 'library_items', item.id));
                } catch (e) { handleFirestoreError(e, OperationType.DELETE, `library_items/${item.id}`); }
              }
            }}
            className="p-2 text-white/20 hover:text-red-500 transition-all ml-4"
            title="Excluir obra"
         >
            <Trash2 className="w-5 h-5" />
         </button>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { content, updateContent } = useContent();
  const [activeTab, setActiveTab] = useState<'leads' | 'content' | 'events' | 'library' | 'members'>('leads');
  const [contentSubTab, setContentSubTab] = useState<'site' | 'management' | 'family' | 'masters' | 'social' | 'contact' | null>(null);
  const [newLibrarySection, setNewLibrarySection] = useState('');
  const [leads, setLeads] = useState<any[]>([]);
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([
    'Venerável Mestre', '1º Vigilante', '2º Vigilante', 'Orador', 
    'Secretário', 'Tesoureiro', 'Chanceler', 'Mestre de Cerimônias', 
    'Hospitaleiro', '1º Diácono', '2º Diácono', 'Porta Espada', 
    'Porta Estandarte', 'Mestre de Banquetes', 'Arquiteto', 
    'Bibliotecário', 'Mestre de Harmonia', 'Cobridor Interno', 
    'Cobridor Externo', '1º Experto', '2º Experto'
  ]);
  const [membershipRequests, setMembershipRequests] = useState<any[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [newInviteMessage, setNewInviteMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [editContent, setEditContent] = useState<any>(content);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [analyzingLeads, setAnalyzingLeads] = useState<Record<string, boolean>>({});
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [analysisReports, setAnalysisReports] = useState<Record<string, string>>({});
  const [uploadingItems, setUploadingItems] = useState<Record<string, boolean>>({});

  const handleLibraryFileUpload = async (itemId: string, file: File) => {
    if (!file) return;
    
    setUploadingItems(prev => ({ ...prev, [itemId]: true }));
    
    try {
      const storageRef = ref(storage, `library/${itemId}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
          null,
          (error) => {
            console.error("Upload error:", error);
            setUploadingItems(prev => ({ ...prev, [itemId]: false }));
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await updateDoc(doc(db, 'library_items', itemId), { 
              url: downloadURL,
              fileType: 'pdf'
            });
            setUploadingItems(prev => ({ ...prev, [itemId]: false }));
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error("Error setting up upload:", error);
      setUploadingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  useEffect(() => {
    setEditContent(content);
  }, [content]);

  useEffect(() => {
    if (showSaveSuccess) {
      const timer = setTimeout(() => setShowSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSaveSuccess]);

  useEffect(() => {
    const q = query(collection(db, 'invitations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setInvitations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Invitations fetch error:", error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRegisteredUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Users fetch error:", error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'membership_requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMembershipRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Membership requests fetch error:", error);
    });
    return () => unsubscribe();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInviteEmail) return;
    setIsInviting(true);
    try {
      // Using email as ID for easier lookup during registration
      const inviteId = newInviteEmail.toLowerCase().trim();
      await setDoc(doc(db, 'invitations', inviteId), {
        email: inviteId,
        invitedBy: auth.currentUser?.uid,
        invitedByEmail: auth.currentUser?.email,
        personalMessage: newInviteMessage,
        createdAt: serverTimestamp(),
        status: 'PENDING'
      });

      // Send Invitation Email via API
      try {
        await fetch('/api/send-invitation-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: inviteId,
            personalMessage: newInviteMessage,
            invitedByEmail: auth.currentUser?.email
          })
        });
      } catch (emailErr) {
        console.error("Failed to send invitation email:", emailErr);
      }

      setNewInviteEmail('');
      setNewInviteMessage('');
      alert('Convite registrado e e-mail enviado com sucesso!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'invitations');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveInvite = async (email: string) => {
    if (!confirm(`Remover convite para ${email}?`)) return;
    try {
      await deleteDoc(doc(db, 'invitations', email));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `invitations/${email}`);
    }
  };

  const handleUpdateStatusRequest = async (id: string, email: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      if (status === 'APPROVED') {
        const inviteId = email.toLowerCase().trim();
        await setDoc(doc(db, 'invitations', inviteId), {
          email: inviteId,
          invitedBy: auth.currentUser?.uid,
          invitedByEmail: auth.currentUser?.email,
          personalMessage: 'Solicitação aprovada. Bem-vindo!',
          createdAt: serverTimestamp(),
          status: 'PENDING'
        });
        await updateDoc(doc(db, 'membership_requests', id), { status: 'APPROVED' });
        alert('Solicitação aprovada e convite gerado!');
      } else {
        await updateDoc(doc(db, 'membership_requests', id), { status: 'REJECTED' });
      }
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, `membership_requests/${id}`);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Excluir esta solicitação?')) return;
    try {
      await deleteDoc(doc(db, 'membership_requests', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `membership_requests/${id}`);
    }
  };

  const [isDeletingItem, setIsDeletingItem] = useState<string | null>(null);

  const handleDeleteLibraryItem = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta obra?')) return;
    setIsDeletingItem(id);
    try {
      await deleteDoc(doc(db, 'library_items', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `library_items/${id}`);
    } finally {
      setIsDeletingItem(null);
    }
  };

  const handleAddLibrarySection = async () => {
    if (!newLibrarySection.trim()) return;
    const updatedSections = [...(content.librarySections || []), newLibrarySection.trim()];
    const newContent = { ...content, librarySections: updatedSections };
    try {
      await setDoc(doc(db, 'content', 'main'), newContent, { merge: true });
      updateContent(newContent);
      setNewLibrarySection('');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'content/main');
    }
  };

  const handleRemoveLibrarySection = async (section: string) => {
    if (!confirm(`Remover categoria "${section}"? Isso não apagará as obras, mas elas perderão a categoria.`)) return;
    const updatedSections = (content.librarySections || []).filter(s => s !== section);
    const newContent = { ...content, librarySections: updatedSections };
    try {
      await setDoc(doc(db, 'content', 'main'), newContent, { merge: true });
      updateContent(newContent);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'content/main');
    }
  };

  useEffect(() => {
    // If the database has fewer than 6 masters, but the default code has more, 
    // let's suggest the user sees the new ones.
    if (content.masters && content.masters.length < 6 && editContent.masters.length < 6) {
      setEditContent(content);
    } else {
      setEditContent(content);
    }
  }, [content]);

  useEffect(() => {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leads');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'library_items'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLibraryItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Library fetch error:", error);
    });
    return () => unsubscribe();
  }, []);

  const [contentExists, setContentExists] = useState(true);

  useEffect(() => {
    const checkContent = async () => {
      const docRef = doc(db, 'content', 'main');
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        setContentExists(false);
      }
    };
    checkContent();
  }, []);

  const handleSaveContent = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'content', 'main'), {
        ...editContent,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      updateContent(editContent);
      setContentExists(true);
      setShowSaveSuccess(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'content/main');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyze = async (lead: any) => {
    setAnalyzingLeads(prev => ({ ...prev, [lead.id]: true }));
    try {
      const report = await analyzeCandidate(lead);
      setAnalysisReports(prev => ({ ...prev, [lead.id]: report }));
      
      // Save report back to Firestore for persistence
      await updateDoc(doc(db, 'leads', lead.id), {
        analysisReport: report,
        analyzedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error analyzing lead:', error);
      alert('Erro ao analisar candidato. Verifique a chave da API Gemini.');
    } finally {
      setAnalyzingLeads(prev => ({ ...prev, [lead.id]: false }));
    }
  };

  const handlePrint = (reportId: string) => {
    const report = analysisReports[reportId] || leads.find(l => l.id === reportId)?.analysisReport;
    if (!report) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Parecer Técnico Confidencial</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; color: #333; }
            pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; text-transform: uppercase; letter-spacing: 2px; }
            .header p { margin: 5px 0; color: #666; font-size: 12px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>A.R.L.S. Arca da Aliança nº 34</h1>
            <p>Parecer Técnico Confidencial de Candidatura</p>
          </div>
          <pre>${report}</pre>
          <div class="no-print" style="margin-top: 50px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; cursor: pointer;">Imprimir/Salvar PDF</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadLeadPDF = (lead: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(10, 15, 44);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(230, 176, 0);
    doc.setFontSize(22);
    doc.setFont("times", "bold");
    doc.text("A.R.L.S. ARCA DA ALIANÇA Nº 34", pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont("times", "italic");
    doc.text("FICHA DE INTERESSE E SINDICÂNCIA PRELIMINAR", pageWidth / 2, 30, { align: 'center' });

    // AI Analysis Section (If exists)
    let currentY = 55;
    if (lead.analysis) {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("times", "bold");
      doc.text("PARECER TÉCNICO - INTELIGÊNCIA ARTIFICIAL", 14, currentY);
      
      currentY += 8;
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      const synthesis = doc.splitTextToSize(`SÍNTESE: ${lead.analysis.synthesis || "N/A"}`, pageWidth - 28);
      doc.text(synthesis, 14, currentY);
      currentY += (synthesis.length * 5) + 5;

      // Score Table
      const scoreData = [
        ["Perfil Identificado", lead.analysis.profile || "N/A"],
        ["Sindicância Recomendada", lead.analysis.isSindicanciaRecommended ? "SIM" : "NÃO"],
      ];
      
      autoTable(doc, {
        startY: currentY,
        head: [['Critério de Avaliação', 'Resultado']],
        body: scoreData,
        theme: 'grid',
        headStyles: { fillColor: [230, 176, 0], textColor: [10, 15, 44] },
        styles: { font: 'times', fontSize: 9 }
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 10;
      
      doc.setFont("times", "bold");
      doc.text("PONTOS PARA SINDICÂNCIA:", 14, currentY);
      currentY += 6;
      doc.setFont("times", "normal");
      const points = doc.splitTextToSize(lead.analysis.sindicanciaPoints || "N/A", pageWidth - 28);
      doc.text(points, 14, currentY);
      currentY += (points.length * 5) + 10;

      doc.setFont("times", "bold");
      doc.text("PARECER FINAL:", 14, currentY);
      currentY += 6;
      doc.setFont("times", "italic");
      const finalVerdict = doc.splitTextToSize(lead.analysis.finalParecer || "N/A", pageWidth - 28);
      doc.text(finalVerdict, 14, currentY);
      currentY += (finalVerdict.length * 5) + 15;
    }

    // Candidate Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("DADOS DO CANDIDATO", 14, currentY);
    
    const personalData = [
      ["Nome Completo", lead.fullName || lead.name || "-"],
      ["E-mail", lead.email || "-"],
      ["Telefone", lead.phone || "-"],
      ["Data de Nascimento", lead.birthDate || "-"],
      ["Profissão", lead.profession || "-"],
      ["Escolaridade", lead.education || "-"],
      ["Estado Civil", lead.civilStatus || "-"],
      ["Crença / Religião", lead.faith || "-"],
      ["Cidade", lead.city || "-"],
      ["Renda Mensal", lead.income || "-"],
    ];

    if (lead.civilStatus === 'Casado' || lead.civilStatus === 'União Estável') {
      personalData.push(["Nome da Esposa", lead.wifeName || "-"]);
      personalData.push(["Tempo de união", lead.marriageTime || "-"]);
    }

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Campo', 'Informação']],
      body: personalData,
      theme: 'striped',
      headStyles: { fillColor: [139, 94, 52] },
      styles: { font: 'times' }
    });

    // Responses
    const lastY = (doc as any).lastAutoTable.finalY + 15;
    if (lastY > 250) doc.addPage();
    const responsesY = lastY > 250 ? 20 : lastY;

    doc.setFont("times", "bold");
    doc.text("RESPOSTAS DO QUESTIONÁRIO", 14, responsesY);

    const responses = [
      ["Motivação", lead.motivation || "-"]
    ];

    for (let i = 1; i <= 12; i++) {
      if (lead[`q${i}`]) {
        responses.push([`Questão ${i}`, lead[`q${i}`]]);
      }
    }

    autoTable(doc, {
      startY: responsesY + 5,
      head: [['Pergunta', 'Resposta']],
      body: responses,
      theme: 'grid',
      headStyles: { fillColor: [139, 94, 52] },
      styles: { font: 'times', cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 'auto' }
      }
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setFont("times", "italic");
    doc.text(`Documento gerado em: ${new Date().toLocaleString()}`, 14, finalY);
    doc.text("Este documento é CONFIDENCIAL e de uso restrito da A.R.L.S. Arca da Aliança nº 34.", 14, finalY + 5);

    doc.save(`Ficha_Candidato_${lead.fullName?.replace(/\s+/g, '_') || 'Desconhecido'}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#f4efe2] text-[#0b1d3a] p-6 pt-24">
      <AnimatePresence>
        {isSaving && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#0b1d3a]/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <div className="bg-[#0b1d3a]/95 border border-[#c5a059]/30 p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 text-center max-w-sm w-full backdrop-blur-xl">
              <div className="w-20 h-20 rounded-full border-4 border-[#c5a059] border-t-transparent animate-spin flex items-center justify-center">
                <RefreshCw className="w-10 h-10 text-[#c5a059]" />
              </div>
              <div>
                <h3 className="text-[#c5a059] font-serif text-2xl font-bold uppercase tracking-widest mb-2">Gravando...</h3>
                <p className="text-[#c5a059]/40 text-[10px] uppercase font-black tracking-[0.2em]">Salvando no Oriente Digital</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSaveSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200]"
          >
            <div className="bg-green-500 text-[#f4efe2] px-10 py-5 rounded-2xl shadow-3xl flex items-center gap-4 font-black uppercase tracking-[0.2em] text-[11px] border-4 border-white/20">
              <ShieldCheck className="w-6 h-6" />
              Obra Concluída com Sucesso!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-white/40 p-8 rounded-3xl border border-[#0b1d3a]/10 shadow-sm">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#0b1d3a] uppercase tracking-widest">Painel Administrativo</h1>
            <p className="text-[#0b1d3a]/60 text-sm">Bem-vindo, {auth.currentUser?.email}</p>
            <div className="flex gap-4 mt-4">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-[10px] uppercase font-black text-[#c5a059] hover:text-[#0b1d3a] transition-colors"
              >
                <Globe className="w-3 h-3" /> Ver Site
              </button>
              <button 
                onClick={() => navigate('/biblioteca-restrita')}
                className="flex items-center gap-2 text-[10px] uppercase font-black text-[#c5a059] hover:text-[#0b1d3a] transition-colors"
              >
                <ShieldCheck className="w-3 h-3" /> Área Restrita
              </button>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-md font-black uppercase text-[10px] tracking-widest"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </header>

        <div className="lg:grid lg:grid-cols-[280px_1fr] gap-10 items-start">
          <aside className="lg:sticky lg:top-24 flex flex-col gap-2">
            <button 
              onClick={() => { setActiveTab('leads'); setContentSubTab(null); }}
              className={`flex items-center gap-3 w-full px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'leads' ? 'bg-[#0b1d3a] text-[#f4efe2] shadow-xl' : 'bg-white/40 text-[#0b1d3a]/50 hover:bg-white/60 hover:text-[#0b1d3a] border border-[#0b1d3a]/5'}`}
            >
              <Users className="w-5 h-5" /> Candidatos ({leads.length})
            </button>
            <button 
              onClick={() => { setActiveTab('content'); setContentSubTab(null); }}
              className={`flex items-center gap-3 w-full px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'content' ? 'bg-[#0b1d3a] text-[#f4efe2] shadow-xl' : 'bg-white/40 text-[#0b1d3a]/50 hover:bg-white/60 hover:text-[#0b1d3a] border border-[#0b1d3a]/5'}`}
            >
              <FileText className="w-5 h-5" /> Editar Site
            </button>
            <button 
              onClick={() => { setActiveTab('events'); setContentSubTab(null); }}
              className={`flex items-center gap-3 w-full px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'events' ? 'bg-[#0b1d3a] text-[#f4efe2] shadow-xl' : 'bg-white/40 text-[#0b1d3a]/50 hover:bg-white/60 hover:text-[#0b1d3a] border border-[#0b1d3a]/5'}`}
            >
              <RefreshCw className="w-5 h-5" /> Eventos ({editContent.events?.length || 0})
            </button>
            <button 
              onClick={() => { setActiveTab('library'); setContentSubTab(null); }}
              className={`flex items-center gap-3 w-full px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'library' ? 'bg-[#0b1d3a] text-[#f4efe2] shadow-xl' : 'bg-white/40 text-[#0b1d3a]/50 hover:bg-white/60 hover:text-[#0b1d3a] border border-[#0b1d3a]/5'}`}
            >
              <Book className="w-5 h-5" /> Biblioteca ({libraryItems.length})
            </button>
            <button 
              onClick={() => { setActiveTab('members'); setContentSubTab(null); }}
              className={`flex items-center gap-3 w-full px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'members' ? 'bg-[#0b1d3a] text-[#f4efe2] shadow-xl' : 'bg-white/40 text-[#0b1d3a]/50 hover:bg-white/60 hover:text-[#0b1d3a] border border-[#0b1d3a]/5'}`}
            >
              <ShieldCheck className="w-5 h-5" /> Membros e Convites ({membershipRequests.filter(r => r.status === 'PENDING').length > 0 ? `+${membershipRequests.filter(r => r.status === 'PENDING').length}` : ''})
            </button>

            <div className="mt-8 p-8 bg-[#c5a059]/10 border border-[#c5a059]/20 rounded-[2.5rem] text-center backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059] mx-auto mb-4 border border-[#c5a059]/30 shadow-sm">
                <Brain className="w-6 h-6" />
              </div>
              <p className="text-[9px] uppercase font-black text-[#0b1d3a]/40 tracking-[0.2em] mb-1">Status de IA</p>
              <p className="text-[10px] text-green-700 font-bold uppercase tracking-widest">Sindicância Ativa</p>
            </div>
          </aside>

          <main className="min-w-0 space-y-8">
            {activeTab === 'content' && !contentExists && (
              <div className="p-8 bg-white/40 border border-[#0b1d3a]/10 rounded-3xl flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="text-[#0b1d3a] font-bold uppercase tracking-widest text-xs">Atenção</h4>
                  <p className="text-[#0b1d3a]/60 text-sm">O conteúdo inicial ainda não foi criado no banco de dados.</p>
                </div>
                <button 
                  onClick={handleSaveContent}
                  className="px-8 py-3 bg-[#0b1d3a] text-[#f4efe2] font-black text-[10px] uppercase rounded-xl tracking-widest shadow-xl hover:bg-[#c5a059] transition-all"
                >
                  Criar Documento Inicial
                </button>
              </div>
            )}

            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/60 rounded-[3rem] border border-[#0b1d3a]/5 p-10 backdrop-blur-lg shadow-sm"
            >
          {activeTab === 'events' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-2xl text-[#0b1d3a] uppercase tracking-widest underline decoration-[#c5a059]/30 underline-offset-8 font-bold">Calendário de Eventos</h3>
                <button 
                  onClick={() => {
                    const newEvent = {
                      title: "Novo Evento",
                      date: "Data...",
                      time: "00:00",
                      location: "Templo...",
                      type: "Sessão",
                      description: "Ementa do evento..."
                    };
                    setEditContent({...editContent, events: [...(editContent.events || []), newEvent]});
                  }}
                  className="px-6 py-3 bg-[#0b1d3a] text-[#f4efe2] font-black rounded-xl text-xs uppercase tracking-widest hover:bg-[#c5a059] transition-all shadow-xl"
                >
                  + Inserir Nova Pauta
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                {(editContent.events || []).map((event, index) => (
                  <div key={index} className="bg-white/40 p-6 rounded-2xl border border-[#0b1d3a]/5 relative shadow-sm">
                    <button 
                      onClick={() => {
                        const newEvents = editContent.events.filter((_, i) => i !== index);
                        setEditContent({...editContent, events: newEvents});
                      }}
                      className="absolute top-4 right-4 text-red-500/50 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] text-[#0b1d3a] uppercase font-black mb-1 font-bold">Título do Evento</label>
                          <input 
                            className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none shadow-sm"
                            value={event.title}
                            onChange={e => {
                              const newEvents = [...editContent.events];
                              newEvents[index].title = e.target.value;
                              setEditContent({...editContent, events: newEvents});
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-[#0b1d3a] uppercase font-black mb-1 font-bold">Categoria (Ex: Magna, Social)</label>
                          <input 
                            className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none shadow-sm"
                            value={event.type}
                            onChange={e => {
                              const newEvents = [...editContent.events];
                              newEvents[index].type = e.target.value;
                              setEditContent({...editContent, events: newEvents});
                            }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <label className="block text-[9px] text-[#0b1d3a] uppercase font-black mb-1 font-bold">Data Completa</label>
                          <input 
                            className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none shadow-sm"
                            value={event.date}
                            onChange={e => {
                              const newEvents = [...editContent.events];
                              newEvents[index].date = e.target.value;
                              setEditContent({...editContent, events: newEvents});
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-[#0b1d3a] uppercase font-black mb-1 font-bold">Horário</label>
                          <input 
                            className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none shadow-sm"
                            value={event.time}
                            onChange={e => {
                              const newEvents = [...editContent.events];
                              newEvents[index].time = e.target.value;
                              setEditContent({...editContent, events: newEvents});
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] text-[#0b1d3a] uppercase font-black mb-1 font-bold">Localização</label>
                        <input 
                          className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none shadow-sm"
                          value={event.location}
                          onChange={e => {
                            const newEvents = [...editContent.events];
                            newEvents[index].location = e.target.value;
                            setEditContent({...editContent, events: newEvents});
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-[#0b1d3a] uppercase font-black mb-1 font-bold">Breve Descrição do Evento</label>
                        <textarea 
                          className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none resize-none shadow-sm"
                          rows={2}
                          value={event.description}
                          onChange={e => {
                            const newEvents = [...editContent.events];
                            newEvents[index].description = e.target.value;
                            setEditContent({...editContent, events: newEvents});
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-8 border-t border-[#0b1d3a]/10 flex justify-end">
                <button 
                  onClick={handleSaveContent}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-[#0b1d3a] text-[#f4efe2] px-10 py-4 rounded-xl font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-[#c5a059] transition-all font-sans shadow-xl"
                >
                  {isSaving ? <RefreshCw className="animate-spin" /> : <Save />} Salvar Agenda
                </button>
              </div>
            </div>
          )}

          
          {activeTab === 'leads' && (
            <div className="space-y-6">
              {leads.length === 0 ? (
                <p className="text-center text-[#0b1d3a]/30 py-12 italic bg-white/20 rounded-2xl">Nenhum interessado encontrado no momento.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {leads.map(lead => (
                      <div key={lead.id} className="bg-white/40 p-6 rounded-2xl border border-[#0b1d3a]/5 hover:border-[#c5a059]/30 transition-all shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                              className="p-1 hover:bg-[#0b1d3a]/5 rounded-lg text-[#0b1d3a]/30 hover:text-[#0b1d3a]"
                            >
                              {expandedLead === lead.id ? <ChevronUp /> : <ChevronDown />}
                            </button>
                            <div>
                              <h3 className="text-xl font-bold text-[#0b1d3a]">{lead.fullName || lead.name}</h3>
                              <p className="text-[#c5a059] font-bold text-sm">{lead.email} | {lead.phone}</p>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <span className="text-[10px] text-[#0b1d3a]/30 uppercase font-mono">
                              {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleString() : 'Recent'}
                            </span>
                            <div className="flex gap-2">
                              {lead.type === 'masonic_quest' && (
                                <span className="bg-[#c5a059]/20 text-[#c5a059] text-[8px] px-2 py-1 rounded-full border border-[#c5a059]/30 uppercase font-bold tracking-widest">
                                  Busca da Luz
                                </span>
                              )}
                              {(lead.analysisReport || analysisReports[lead.id]) && (
                                <span className="bg-green-500/20 text-green-500 text-[8px] px-2 py-1 rounded-full border border-green-500/30 uppercase font-bold tracking-widest">
                                  Analisado
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedLead === lead.id && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              {lead.type === 'masonic_quest' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 pt-6 border-t border-[#0b1d3a]/5">
                                  <div className="space-y-6">
                                    <h4 className="text-[#0b1d3a] text-[10px] uppercase font-bold tracking-[0.2em] border-b border-[#0b1d3a]/10 pb-1 flex items-center gap-2 font-bold">
                                      <Brain className="w-3 h-3 text-[#c5a059]" /> Parecer do Consultor AI
                                    </h4>
                                    
                                    {(lead.analysisReport || analysisReports[lead.id]) ? (
                                      <div className="space-y-4">
                                        <div className="bg-white/80 p-6 rounded-2xl border border-[#0b1d3a]/10 text-sm font-serif leading-relaxed h-[400px] overflow-y-auto custom-scrollbar shadow-inner">
                                          <pre className="whitespace-pre-wrap text-[#0b1d3a]/90 font-sans">{analysisReports[lead.id] || lead.analysisReport}</pre>
                                        </div>
                                      <div className="flex flex-col md:flex-row gap-2">
                                        <button 
                                          onClick={() => handlePrint(lead.id)}
                                          className="flex-1 flex items-center justify-center gap-2 bg-white/80 border border-[#0b1d3a]/10 text-[#0b1d3a] py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white transition-all shadow-sm"
                                        >
                                          <Printer className="w-4 h-4" /> Imprimir Parecer
                                        </button>
                                        <button 
                                          onClick={() => handleDownloadLeadPDF(lead)}
                                          className="flex-1 flex items-center justify-center gap-2 bg-[#0b1d3a] text-[#f4efe2] py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-[#c5a059] transition-all shadow-lg"
                                        >
                                          <Download className="w-4 h-4" /> Baixar Ficha (PDF)
                                        </button>
                                      </div>
                                      </div>
                                    ) : (
                                      <div className="bg-[#c5a059]/5 border border-[#c5a059]/10 p-8 rounded-2xl text-center shadow-inner">
                                        <Brain className="w-12 h-12 text-[#c5a059]/30 mx-auto mb-4" />
                                        <p className="text-[#0b1d3a]/40 text-xs mb-6 px-4 font-bold">
                                          O perfil deste candidato ainda não foi processado pela inteligência de sindicância.
                                        </p>
                                        <button 
                                          onClick={() => handleAnalyze(lead)}
                                          disabled={analyzingLeads[lead.id]}
                                          className="px-8 py-3 bg-[#0b1d3a] text-[#f4efe2] rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#c5a059] transition-all disabled:opacity-50 flex items-center gap-2 mx-auto shadow-lg"
                                        >
                                          {analyzingLeads[lead.id] ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                                          Gerar Parecer Técnico
                                        </button>
                                      </div>
                                    )}

                                    <h4 className="text-[#0b1d3a] text-[10px] uppercase font-bold tracking-[0.2em] border-b border-[#0b1d3a]/10 pb-1 mt-8 font-bold">Dados Pessoais</h4>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                      <div>
                                        <p className="text-[#0b1d3a]/40 uppercase font-bold text-[9px]">Nascimento:</p>
                                        <p className="text-[#0b1d3a] font-bold">{lead.birthDate}</p>
                                      </div>
                                      <div>
                                        <p className="text-[#0b1d3a]/40 uppercase font-bold text-[9px]">Escolaridade:</p>
                                        <p className="text-[#0b1d3a] font-bold">{lead.education}</p>
                                      </div>
                                      <div>
                                        <p className="text-[#0b1d3a]/40 uppercase font-bold text-[9px]">Crença:</p>
                                        <p className="text-[#0b1d3a] font-bold">{lead.faith}</p>
                                      </div>
                                      <div>
                                        <p className="text-[#0b1d3a]/40 uppercase font-bold text-[9px]">Cidade:</p>
                                        <p className="text-[#0b1d3a] font-bold">{lead.city}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-6">
                                    <h4 className="text-[#0b1d3a] text-[10px] uppercase font-bold tracking-[0.2em] border-b border-[#0b1d3a]/10 pb-1 font-bold">Perfil e Respostas</h4>
                                    <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                                      <div>
                                        <p className="text-[#0b1d3a]/40 uppercase font-bold text-[9px]">Estado Civil:</p>
                                        <p className="text-[#0b1d3a] font-bold">{lead.civilStatus}</p>
                                      </div>
                                      <div>
                                        <p className="text-[#0b1d3a]/40 uppercase font-bold text-[9px]">Filhos:</p>
                                        <p className="text-[#0b1d3a] font-bold">{lead.childrenCount || "Nenhum"}</p>
                                      </div>
                                      <div>
                                        <p className="text-[#0b1d3a]/40 uppercase font-bold text-[9px]">Profissão:</p>
                                        <p className="text-[#0b1d3a] font-bold">{lead.profession}</p>
                                      </div>
                                      <div>
                                        <p className="text-[#0b1d3a]/40 uppercase font-bold text-[9px]">Renda:</p>
                                        <p className="text-[#0b1d3a] font-bold">{lead.income}</p>
                                      </div>
                                    </div>

                                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                      <div className="bg-white/80 p-4 rounded-xl shadow-sm border border-[#0b1d3a]/5">
                                        <p className="text-[10px] text-[#0b1d3a] uppercase font-black mb-2 font-bold">Motivação</p>
                                        <p className="text-xs text-[#0b1d3a]/80 italic">"{lead.motivation}"</p>
                                      </div>
                                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => lead[`q${num}`] ? (
                                        <div key={num} className="bg-white/80 p-4 rounded-xl shadow-sm border border-[#0b1d3a]/5">
                                          <p className="text-[10px] text-[#0b1d3a] uppercase font-black mb-2 font-bold">Questão {num}</p>
                                          <p className="text-xs text-[#0b1d3a]/80">{lead[`q${num}`]}</p>
                                        </div>
                                      ) : null)}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-4 pt-4 border-t border-[#0b1d3a]/5">
                                  <p className="text-[#0b1d3a]/60 text-sm bg-white/80 p-4 rounded-xl italic shadow-inner">"{lead.message}"</p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-8">
              {!contentSubTab ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <button 
                    onClick={() => setContentSubTab('site')}
                    className="group bg-white/40 border border-[#0b1d3a]/5 p-8 rounded-[2.5rem] text-left hover:border-[#c5a059]/40 transition-all hover:bg-white/80 shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#0b1d3a]/5 flex items-center justify-center text-[#0b1d3a] mb-6 group-hover:scale-110 transition-transform">
                      <LayoutDashboard className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#0b1d3a] mb-2 uppercase tracking-wider">Editar Conteúdo <span className="text-[#c5a059]">do Site</span></h3>
                    <p className="text-[#0b1d3a]/40 text-[10px] uppercase tracking-widest font-black">Hero, História, Filantropia e Missão</p>
                  </button>

                  <button 
                    onClick={() => setContentSubTab('management')}
                    className="group bg-white/40 border border-[#0b1d3a]/5 p-8 rounded-[2.5rem] text-left hover:border-[#c5a059]/40 transition-all hover:bg-white/80 shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#0b1d3a]/5 flex items-center justify-center text-[#0b1d3a] mb-6 group-hover:scale-110 transition-transform">
                      <Users className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#0b1d3a] mb-2 uppercase tracking-wider">Atual <span className="text-[#c5a059]">Gestão</span></h3>
                    <p className="text-[#0b1d3a]/40 text-[10px] uppercase tracking-widest font-black">Fotos e nomes do Quadro de Obreiros</p>
                  </button>

                  <button 
                    onClick={() => setContentSubTab('masters')}
                    className="group bg-white/40 border border-[#0b1d3a]/5 p-8 rounded-[2.5rem] text-left hover:border-[#c5a059]/40 transition-all hover:bg-white/80 shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#0b1d3a]/5 flex items-center justify-center text-[#0b1d3a] mb-6 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#0b1d3a] mb-2 uppercase tracking-wider">Galeria de <span className="text-[#c5a059]">Honra</span></h3>
                    <p className="text-[#0b1d3a]/40 text-[10px] uppercase tracking-widest font-black">Editais de Past Veneráveis Mestres</p>
                  </button>

                  <button 
                    onClick={() => setContentSubTab('family')}
                    className="group bg-white/40 border border-[#0b1d3a]/5 p-8 rounded-[2.5rem] text-left hover:border-[#c5a059]/40 transition-all hover:bg-white/80 shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 mb-6 group-hover:scale-110 transition-transform">
                      <Star className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#0b1d3a] mb-2 uppercase tracking-wider">Cunhadas e <span className="text-pink-500">Jovens</span></h3>
                    <p className="text-[#0b1d3a]/40 text-[10px] uppercase tracking-widest font-black">Fraternidade Feminina e Ordem DeMolay/Garotas do Arco Iris</p>
                  </button>

                  <button 
                    onClick={() => setContentSubTab('social')}
                    className="group bg-white/40 border border-[#0b1d3a]/5 p-8 rounded-[2.5rem] text-left hover:border-[#c5a059]/40 transition-all hover:bg-white/80 shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059] mb-6 group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#0b1d3a] mb-2 uppercase tracking-wider">Álbum <span className="text-[#c5a059]">Social</span></h3>
                    <p className="text-[#0b1d3a]/40 text-[10px] uppercase tracking-widest font-black">Vídeos e fotos da Galeria do Site</p>
                  </button>

                  <button 
                    onClick={() => setContentSubTab('contact')}
                    className="group bg-white/40 border border-[#0b1d3a]/5 p-8 rounded-[2.5rem] text-left hover:border-[#c5a059]/40 transition-all hover:bg-white/80 shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059] mb-6 group-hover:scale-110 transition-transform">
                      <Globe className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#0b1d3a] mb-2 uppercase tracking-wider">Dados de <span className="text-[#c5a059]">Contato</span></h3>
                    <p className="text-[#0b1d3a]/40 text-[10px] uppercase tracking-widest font-black">Endereço, Emails e Mapa</p>
                  </button>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <button 
                    onClick={() => setContentSubTab(null)}
                    className="flex items-center gap-2 text-[#0b1d3a]/60 hover:text-[#0b1d3a] transition-colors uppercase tracking-widest text-[10px] font-black pb-4 border-b border-[#0b1d3a]/5 w-full text-left"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar para Menu de Edição
                  </button>

                  <div className="pt-4">
                    {/* Render the specific content editor based on contentSubTab */}
                    {contentSubTab === 'site' && (
                      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <h3 className="font-serif text-xl border-l-4 border-[#c5a059] pl-4 uppercase tracking-widest font-bold text-[#0b1d3a]">Banner de Boas-Vindas (Home)</h3>
                            <div>
                               <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">URL da Imagem de Fundo (Looping)</label>
                               <input 
                                 className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none text-xs"
                                 value={editContent.welcomeBanner?.backgroundImage || ''}
                                 placeholder="Link direto (.jpg, .png)"
                                 onChange={e => setEditContent({...editContent, welcomeBanner: {...(editContent.welcomeBanner || {}), backgroundImage: e.target.value}})}
                               />
                               {editContent.welcomeBanner?.backgroundImage && (
                                 <div className="mt-2 w-full h-24 rounded-lg overflow-hidden border border-[#0b1d3a]/10 bg-black/5">
                                   <img src={editContent.welcomeBanner.backgroundImage} alt="Preview" className="w-full h-full object-cover" />
                                 </div>
                               )}
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Título do Banner</label>
                              <textarea 
                                className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none text-sm"
                                rows={2}
                                value={editContent.welcomeBanner?.title || ''}
                                onChange={e => setEditContent({...editContent, welcomeBanner: {...(editContent.welcomeBanner || {}), title: e.target.value}})}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Frase (Justificada no Site)</label>
                              <textarea 
                                className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none text-sm"
                                rows={2}
                                value={editContent.welcomeBanner?.subTitle || ''}
                                onChange={e => setEditContent({...editContent, welcomeBanner: {...(editContent.welcomeBanner || {}), subTitle: e.target.value}})}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="font-serif text-xl border-l-4 border-[#c5a059] pl-4 uppercase tracking-widest font-bold text-[#0b1d3a]">Seção de Entrada (Hero)</h3>
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Título Principal</label>
                              <input 
                                className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
                                value={editContent.hero.title}
                                onChange={e => setEditContent({...editContent, hero: {...editContent.hero, title: e.target.value}})}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Linha de Topo (Sub-título)</label>
                              <input 
                                className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
                                value={editContent.hero.subTitle}
                                onChange={e => setEditContent({...editContent, hero: {...editContent.hero, subTitle: e.target.value}})}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Tagline de Impacto</label>
                              <textarea 
                                className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none text-sm"
                                rows={3}
                                value={editContent.hero.tagline}
                                onChange={e => setEditContent({...editContent, hero: {...editContent.hero, tagline: e.target.value}})}
                              />
                            </div>
                            <div>
                               <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">URL da Imagem de Fundo (Hero)</label>
                               <input 
                                 className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none text-xs"
                                 value={editContent.hero.backgroundImage || ''}
                                 placeholder="Link direto (.jpg, .png)"
                                 onChange={e => setEditContent({...editContent, hero: {...editContent.hero, backgroundImage: e.target.value}})}
                               />
                               {editContent.hero.backgroundImage && (
                                 <div className="mt-2 w-full h-16 rounded-lg overflow-hidden border border-[#0b1d3a]/10 bg-black/5">
                                   <img src={editContent.hero.backgroundImage} alt="Preview" className="w-full h-full object-cover opacity-80" />
                                 </div>
                               )}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="font-serif text-xl border-l-4 border-[#c5a059] pl-4 uppercase tracking-widest font-bold text-[#0b1d3a]">Nossa História</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Título Pequeno</label>
                                <input 
                                  className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
                                  value={editContent.history.smallTitle}
                                  onChange={e => setEditContent({...editContent, history: {...editContent.history, smallTitle: e.target.value}})}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Título Principal</label>
                                <input 
                                  className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
                                  value={editContent.history.title}
                                  onChange={e => setEditContent({...editContent, history: {...editContent.history, title: e.target.value}})}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Sub-título</label>
                              <input 
                                className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
                                value={editContent.history.subTitle}
                                onChange={e => setEditContent({...editContent, history: {...editContent.history, subTitle: e.target.value}})}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Memorial Descritivo</label>
                              <textarea 
                                className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none text-sm"
                                rows={4}
                                value={editContent.history.text}
                                onChange={e => setEditContent({...editContent, history: {...editContent.history, text: e.target.value}})}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Missão</label>
                            <textarea 
                              className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none text-sm"
                              rows={3}
                              value={editContent.history.mission}
                              onChange={e => setEditContent({...editContent, history: {...editContent.history, mission: e.target.value}})}
                            />
                          </div>
                          <div className="space-y-4">
                            <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Visão</label>
                            <textarea 
                              className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none text-sm"
                              rows={3}
                              value={editContent.history.vision}
                              onChange={e => setEditContent({...editContent, history: {...editContent.history, vision: e.target.value}})}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] font-bold">Valores Institucionais</label>
                            <button 
                              onClick={() => {
                                const newValues = [...(editContent.history.values || []), 'Novo Valor'];
                                setEditContent({...editContent, history: {...editContent.history, values: newValues}});
                              }}
                              className="text-[10px] uppercase font-bold text-[#c5a059] hover:text-[#0b1d3a]"
                            >
                              + Adicionar Valor
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {editContent.history.values?.map((v: string, i: number) => (
                              <div key={i} className="flex items-center gap-2 bg-white/40 border border-[#0b1d3a]/10 px-3 py-2 rounded-lg group">
                                <input 
                                  className="bg-transparent border-none text-xs text-[#0b1d3a]/70 focus:text-[#0b1d3a] outline-none w-24"
                                  value={v}
                                  onChange={e => {
                                    const newValues = [...editContent.history.values];
                                    newValues[i] = e.target.value;
                                    setEditContent({...editContent, history: {...editContent.history, values: newValues}});
                                  }}
                                />
                                <button 
                                  onClick={() => {
                                    const newValues = editContent.history.values.filter((_: any, idx: number) => idx !== i);
                                    setEditContent({...editContent, history: {...editContent.history, values: newValues}});
                                  }}
                                  className="text-[#0b1d3a]/20 hover:text-red-500 p-1"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-serif text-xl border-l-4 border-[#c5a059] pl-4 uppercase tracking-widest font-bold text-[#0b1d3a]">Filantropia e Missão Social</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Título Pequeno</label>
                              <input 
                                className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
                                value={editContent.philanthropy.smallTitle}
                                onChange={e => setEditContent({...editContent, philanthropy: {...editContent.philanthropy, smallTitle: e.target.value}})}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Título Principal</label>
                              <input 
                                className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
                                value={editContent.philanthropy.title}
                                onChange={e => setEditContent({...editContent, philanthropy: {...editContent.philanthropy, title: e.target.value}})}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Sub-título</label>
                            <input 
                              className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
                              value={editContent.philanthropy.subTitle}
                              onChange={e => setEditContent({...editContent, philanthropy: {...editContent.philanthropy, subTitle: e.target.value}})}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Descrição das Obras Sociais</label>
                            <textarea 
                              className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none text-sm"
                              rows={4}
                              value={editContent.philanthropy.description}
                              onChange={e => setEditContent({...editContent, philanthropy: {...editContent.philanthropy, description: e.target.value}})}
                            />
                          </div>
                          
                            <div className="space-y-4 mt-6">
                              <h4 className="text-[10px] uppercase font-black tracking-widest text-[#0b1d3a]/60 font-bold">Estatísticas de Impacto</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {editContent.philanthropy.stats?.map((stat: any, idx: number) => (
                                  <div key={idx} className="bg-white/40 p-4 rounded-xl space-y-2 border border-[#0b1d3a]/5 shadow-sm">
                                    <input 
                                      className="w-full bg-transparent border-b border-[#0b1d3a]/10 text-xl text-[#0b1d3a] font-serif font-black focus:border-[#c5a059] outline-none"
                                      value={stat.value}
                                      onChange={e => {
                                        const newStats = [...editContent.philanthropy.stats];
                                        newStats[idx].value = e.target.value;
                                        setEditContent({...editContent, philanthropy: {...editContent.philanthropy, stats: newStats}});
                                      }}
                                    />
                                    <input 
                                      className="w-full bg-transparent border-none text-[10px] text-[#0b1d3a]/50 uppercase font-bold outline-none"
                                      value={stat.label}
                                      onChange={e => {
                                        const newStats = [...editContent.philanthropy.stats];
                                        newStats[idx].label = e.target.value;
                                        setEditContent({...editContent, philanthropy: {...editContent.philanthropy, stats: newStats}});
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <h4 className="text-[10px] uppercase font-black tracking-widest text-[#0b1d3a]/60 font-bold">Iniciativas e Impacto</h4>
                              <button 
                                onClick={() => {
                                  const newIn = { title: 'Nova Obra', description: '...', impact: '' };
                                  setEditContent({...editContent, philanthropy: {...editContent.philanthropy, initiatives: [...(editContent.philanthropy.initiatives || []), newIn]}});
                                }}
                                className="text-xs font-bold text-[#c5a059] hover:text-[#0b1d3a]"
                              >
                                + Adicionar Iniciativa
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {editContent.philanthropy.initiatives?.map((item, idx) => (
                                <div key={idx} className="bg-white/40 p-4 rounded-xl space-y-3 relative group border border-[#0b1d3a]/5 shadow-sm">
                                  <button 
                                    onClick={() => {
                                      const newIn = editContent.philanthropy.initiatives.filter((_, i) => i !== idx);
                                      setEditContent({...editContent, philanthropy: {...editContent.philanthropy, initiatives: newIn}});
                                    }}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500 p-1"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                  <div className="space-y-2">
                                    <input 
                                      className="w-full bg-transparent border-b border-[#0b1d3a]/10 text-xs text-[#0b1d3a] font-bold focus:border-[#c5a059] outline-none"
                                      value={item.title}
                                      placeholder="Título da Obra"
                                      onChange={e => {
                                        const newIn = [...editContent.philanthropy.initiatives];
                                        newIn[idx].title = e.target.value;
                                        setEditContent({...editContent, philanthropy: {...editContent.philanthropy, initiatives: newIn}});
                                      }}
                                    />
                                    <input 
                                      className="w-full bg-transparent border-b border-[#0b1d3a]/10 text-[10px] text-[#0b1d3a]/60 placeholder:text-[#0b1d3a]/30 outline-none"
                                      value={item.impact}
                                      placeholder="Impacto (ex: 200 crianças)"
                                      onChange={e => {
                                        const newIn = [...editContent.philanthropy.initiatives];
                                        newIn[idx].impact = e.target.value;
                                        setEditContent({...editContent, philanthropy: {...editContent.philanthropy, initiatives: newIn}});
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                        <div className="space-y-6 mt-12 bg-white/40 p-8 rounded-2xl border border-[#0b1d3a]/10 shadow-sm">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="font-serif text-xl text-[#0b1d3a] uppercase tracking-widest font-bold">Marcos Históricos (Timeline)</h3>
                            <button 
                              onClick={() => {
                                const newMilestone = { year: '20XX', title: 'Novo Marco', description: 'Descrição...' };
                                setEditContent({...editContent, history: {...editContent.history, milestones: [...(editContent.history.milestones || []), newMilestone]}});
                              }}
                              className="px-4 py-2 bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#0b1d3a] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#c5a059] hover:text-[#f4efe2] transition-all shadow-sm"
                            >
                              + Adicionar Marco
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {editContent.history.milestones?.map((milestone, index) => (
                              <div key={index} className="p-6 bg-white/60 rounded-xl border border-[#0b1d3a]/5 space-y-4 relative shadow-sm">
                                <button 
                                  onClick={() => {
                                    const newMilestones = editContent.history.milestones.filter((_, i) => i !== index);
                                    setEditContent({...editContent, history: {...editContent.history, milestones: newMilestones}});
                                  }}
                                  className="absolute top-2 right-2 text-red-500/40 hover:text-red-500 p-2"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <div className="flex gap-4">
                                  <div className="w-1/4">
                                    <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a]/40 mb-1 font-bold">Ano</label>
                                    <input 
                                      className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded p-2 text-[#c5a059] font-bold focus:border-[#c5a059] outline-none text-xs"
                                      value={milestone.year}
                                      onChange={e => {
                                        const newMs = [...editContent.history.milestones];
                                        newMs[index].year = e.target.value;
                                        setEditContent({...editContent, history: {...editContent.history, milestones: newMs}});
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a]/40 mb-1 font-bold">Título</label>
                                    <input 
                                      className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded p-2 text-[#0b1d3a] focus:border-[#c5a059] outline-none text-sm"
                                      value={milestone.title}
                                      onChange={e => {
                                        const newMs = [...editContent.history.milestones];
                                        newMs[index].title = e.target.value;
                                        setEditContent({...editContent, history: {...editContent.history, milestones: newMs}});
                                      }}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a]/40 mb-1 font-bold">Descrição</label>
                                  <textarea 
                                    className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded p-2 text-[#0b1d3a]/60 focus:border-[#c5a059] outline-none text-xs resize-none"
                                    rows={2}
                                    value={milestone.description}
                                    onChange={e => {
                                      const newMs = [...editContent.history.milestones];
                                      newMs[index].description = e.target.value;
                                      setEditContent({...editContent, history: {...editContent.history, milestones: newMs}});
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-8 border-t border-white/10 flex justify-end">
                          <button 
                            onClick={handleSaveContent}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-[#0b1d3a] text-[#f4efe2] px-10 py-4 rounded-xl font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-[#c5a059] transition-all font-sans shadow-2xl"
                          >
                            {isSaving ? <RefreshCw className="animate-spin" /> : <Save />} Salvar Alterações do Site
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {contentSubTab === 'management' && (
                      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        <div className="space-y-4 bg-white/40 p-6 rounded-2xl border border-[#0b1d3a]/10 mb-8 shadow-sm">
                          <h3 className="font-serif text-xl border-l-4 border-[#c5a059] pl-4 uppercase tracking-widest font-bold mb-4 text-[#0b1d3a]">Cabeçalho da Liderança</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Título Pequeno</label>
                              <input 
                                className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
                                value={editContent.managementSection?.smallTitle || ''}
                                onChange={e => setEditContent({...editContent, managementSection: {...(editContent.managementSection || {}), smallTitle: e.target.value}})}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Título Principal</label>
                              <input 
                                className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
                                value={editContent.managementSection?.title || ''}
                                onChange={e => setEditContent({...editContent, managementSection: {...(editContent.managementSection || {}), title: e.target.value}})}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Sub-título</label>
                            <input 
                              className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
                              value={editContent.managementSection?.subTitle || ''}
                              onChange={e => setEditContent({...editContent, managementSection: {...(editContent.managementSection || {}), subTitle: e.target.value}})}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center mb-6">
                          <h3 className="font-serif text-xl text-[#0b1d3a] uppercase tracking-widest underline decoration-[#c5a059]/30 underline-offset-8 font-bold">Atual Gestão (Quadro de Obreiros)</h3>
                          <button 
                            onClick={() => {
                              const newMember = { name: 'Novo Irmão', role: 'Cargo...' };
                              const newManagement = [...(editContent.management || []), newMember];
                              setEditContent({...editContent, management: newManagement});
                            }}
                            className="px-6 py-3 bg-[#0b1d3a] text-[#f4efe2] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#c5a059] transition-all shadow-xl"
                          >
                            + Adicionar Irmão ao Quadro
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {(editContent.management || []).map((member, index) => (
                            <div key={index} className="p-6 bg-white/40 rounded-xl border border-[#0b1d3a]/5 space-y-4 relative group shadow-sm">
                              <button 
                               onClick={() => {
                                 const newManagement = editContent.management.filter((_, i) => i !== index);
                                 setEditContent({...editContent, management: newManagement});
                               }}
                               className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500 p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a]/40 mb-1 font-bold font-sans">Cargo/Função</label>
                                  <input 
                                    className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded p-2 text-[#c5a059] font-bold focus:border-[#c5a059] outline-none uppercase text-xs"
                                    value={member.role}
                                    onChange={e => {
                                      const newManagement = editContent.management.map((m, i) => i === index ? { ...m, role: e.target.value } : m);
                                      setEditContent({...editContent, management: newManagement});
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a]/40 mb-1 font-bold font-sans">Nome do Irmão</label>
                                  <input 
                                    className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded p-2 text-[#0b1d3a] font-sans focus:border-[#c5a059] outline-none"
                                    value={member.name}
                                    onChange={e => {
                                      const newManagement = editContent.management.map((m, i) => i === index ? { ...m, name: e.target.value } : m);
                                      setEditContent({...editContent, management: newManagement});
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a]/40 mb-1 font-bold font-sans">URL da Foto (opcional)</label>
                                  <input 
                                    className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded p-2 text-[#0b1d3a]/50 text-[10px] focus:border-[#c5a059] outline-none"
                                    placeholder="Link direto (.jpg, .png)"
                                    value={(member as any).photo || ''}
                                    onChange={e => {
                                      const newManagement = editContent.management.map((m, i) => i === index ? { ...m, photo: e.target.value } : m);
                                      setEditContent({...editContent, management: newManagement});
                                    }}
                                  />
                                  {(member as any).photo && (
                                    <div className="mt-2 w-24 h-32 rounded-xl overflow-hidden border border-[#c5a059]/20 mx-auto bg-black/5 relative shadow-lg">
                                      <img 
                                        src={(member as any).photo} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover" 
                                        referrerPolicy="no-referrer" 
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=3x4';
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                                <div className="pt-2 flex justify-end">
                                  <button 
                                    onClick={handleSaveContent}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-[#0b1d3a] text-[#f4efe2] rounded-lg text-[9px] uppercase font-black tracking-widest hover:bg-[#c5a059] transition-all flex items-center gap-2 shadow-sm"
                                  >
                                    {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Salvar Este Irmão
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="pt-8 border-t border-white/10 flex justify-end">
                          <button 
                            onClick={handleSaveContent}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-[#0b1d3a] text-[#f4efe2] px-10 py-4 rounded-xl font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-[#c5a059] transition-all font-sans"
                          >
                            {isSaving ? <RefreshCw className="animate-spin" /> : <Save />} Salvar Gestão
                          </button>
                        </div>
                      </div>
                    )}

                    {contentSubTab === 'masters' && (
                      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        <div className="space-y-4 bg-white/40 p-6 rounded-2xl border border-[#0b1d3a]/10 mb-8 shadow-sm">
                          <h3 className="font-serif text-xl border-l-4 border-[#c5a059] pl-4 uppercase tracking-widest font-bold mb-4 text-[#0b1d3a]">Cabeçalho da Galeria de Honra</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Título Pequeno</label>
                              <input 
                                className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
                                value={editContent.mastersSection?.smallTitle || ''}
                                onChange={e => setEditContent({...editContent, mastersSection: {...(editContent.mastersSection || {}), smallTitle: e.target.value}})}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Título Principal</label>
                              <input 
                                className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
                                value={editContent.mastersSection?.title || ''}
                                onChange={e => setEditContent({...editContent, mastersSection: {...(editContent.mastersSection || {}), title: e.target.value}})}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Sub-título</label>
                            <input 
                              className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
                              value={editContent.mastersSection?.subTitle || ''}
                              onChange={e => setEditContent({...editContent, mastersSection: {...(editContent.mastersSection || {}), subTitle: e.target.value}})}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center mb-6">
                          <h3 className="font-serif text-xl text-[#0b1d3a] uppercase tracking-widest underline decoration-[#c5a059]/30 underline-offset-8 font-bold">Galeria de Honoráveis Mestres</h3>
                          <div className="flex gap-4">
                            <Link 
                              to="/galeria-honra"
                              target="_blank"
                              className="px-4 py-2 bg-[#0b1d3a]/10 border border-[#0b1d3a]/30 text-[#0b1d3a] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#0b1d3a] hover:text-[#f4efe2] transition-all shadow-sm flex items-center gap-2"
                            >
                              <Globe className="w-4 h-4" /> Visualizar Galeria no Site
                            </Link>
                            <button 
                              onClick={() => {
                                const newMaster = {
                                  id: Date.now().toString(),
                                  name: "Novo Mestre",
                                  period: "20XX - 20XX",
                                  role: "Past Venerável Mestre",
                                  biography: "",
                                  ritualLegacy: "O trabalho contínuo no desbaste da pedra bruta é a nossa maior missão. Durante esta gestão, buscamos polir não apenas o templo físico, mas o templo em cada um de nossos corações.",
                                  agendaHighlights: "Mais de 48 sessões rituais conduzidas com excelência e rigor litúrgico.",
                                  columnGrowth: "Integração de novos obreiros e fortalecimento da egrégora do oriente.",
                                  firstLady: { name: "", biography: "" }
                                };
                                setEditContent({...editContent, masters: [...(editContent.masters || []), newMaster]});
                              }}
                              className="px-4 py-2 bg-[#0b1d3a] text-[#f4efe2] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#c5a059] transition-all shadow-sm"
                            >
                              + Adicionar Mestre
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-8">
                          {editContent.masters?.map((master, index) => (
                            <div key={master.id} className="p-8 bg-white/40 rounded-2xl border border-[#0b1d3a]/10 space-y-6 relative overflow-hidden shadow-sm">
                              <button 
                                onClick={() => {
                                  const newMasters = editContent.masters.filter((_, i) => i !== index);
                                  setEditContent({...editContent, masters: newMasters});
                                }}
                                className="absolute top-4 right-4 text-red-500 hover:text-red-400 p-2"
                              >
                                <X className="w-5 h-5" />
                              </button>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                  <h4 className="text-[10px] uppercase font-black text-[#0b1d3a]/60 tracking-[0.2em] border-b border-[#0b1d3a]/10 pb-2">Dados Básicos</h4>
                                  <div>
                                    <label className="block text-[10px] text-[#0b1d3a]/60 mb-1 font-bold">Nome do Irmão</label>
                                    <input 
                                      className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-2 text-[#0b1d3a] text-sm focus:border-[#c5a059]"
                                      value={master.name}
                                      onChange={e => {
                                        const newMasters = editContent.masters.map((m, i) => i === index ? { ...m, name: e.target.value } : m);
                                        setEditContent({...editContent, masters: newMasters});
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-[#0b1d3a]/60 mb-1 font-bold">Período (Ex: 2023 - 2025)</label>
                                    <input 
                                      className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-2 text-[#0b1d3a] text-sm focus:border-[#c5a059]"
                                      value={master.period}
                                      onChange={e => {
                                        const newMasters = editContent.masters.map((m, i) => i === index ? { ...m, period: e.target.value } : m);
                                        setEditContent({...editContent, masters: newMasters});
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-[#0b1d3a]/60 mb-1 font-bold">Cargo/Título</label>
                                    <input 
                                      className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-2 text-[#0b1d3a] text-sm focus:border-[#c5a059]"
                                      value={master.role}
                                      onChange={e => {
                                        const newMasters = editContent.masters.map((m, i) => i === index ? { ...m, role: e.target.value } : m);
                                        setEditContent({...editContent, masters: newMasters});
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-[#0b1d3a]/60 mb-1 font-bold">URL da Foto do Mestre</label>
                                    <div className="space-y-2">
                                      <input 
                                        className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-2 text-[#0b1d3a] text-[10px] focus:border-[#c5a059] outline-none"
                                        placeholder="Use link direto (ex: i.ibb.co/.../image.jpg)"
                                        value={master.photo || ''}
                                        onChange={e => {
                                          const newMasters = editContent.masters.map((m, i) => i === index ? { ...m, photo: e.target.value } : m);
                                          setEditContent({...editContent, masters: newMasters});
                                        }}
                                      />
                                    </div>
                                    {master.photo && (
                                      <div className="mt-2 w-24 h-32 overflow-hidden rounded-xl border border-[#0b1d3a]/10 bg-black/5 flex flex-col items-center justify-center relative mx-auto shadow-sm">
                                        <img 
                                          src={master.photo} 
                                          alt="Preview" 
                                          className="w-full h-full object-cover" 
                                          referrerPolicy="no-referrer"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=3x4';
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-4 md:col-span-2">
                                  <h4 className="text-[10px] uppercase font-black text-[#0b1d3a]/60 tracking-[0.2em] border-b border-[#0b1d3a]/10 pb-2">Biografia e Dados da Cunhada</h4>
                                  <div>
                                    <label className="block text-[10px] text-[#0b1d3a]/60 mb-1 font-bold">Biografia / Memorial</label>
                                    <textarea 
                                      className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-2 text-[#0b1d3a] text-sm focus:border-[#c5a059] outline-none"
                                      rows={4}
                                      value={master.biography}
                                      onChange={e => {
                                        const newMasters = editContent.masters.map((m, i) => i === index ? { ...m, biography: e.target.value } : m);
                                        setEditContent({...editContent, masters: newMasters});
                                      }}
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#0b1d3a]/5">
                                    <div>
                                      <label className="block text-[10px] text-[#0b1d3a]/60 mb-1 font-bold">Grau</label>
                                      <input 
                                        className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-2 text-[#0b1d3a] text-sm focus:border-[#c5a059]"
                                        placeholder="Ex: 33º"
                                        value={master.degree || ''}
                                        onChange={e => {
                                          const newMasters = editContent.masters.map((m, i) => i === index ? { ...m, degree: e.target.value } : m);
                                          setEditContent({...editContent, masters: newMasters});
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] text-[#0b1d3a]/60 mb-1 font-bold">Anos de Ordem</label>
                                      <input 
                                        className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-2 text-[#0b1d3a] text-sm focus:border-[#c5a059]"
                                        placeholder="Ex: 25+"
                                        value={master.orderTime || ''}
                                        onChange={e => {
                                          const newMasters = editContent.masters.map((m, i) => i === index ? { ...m, orderTime: e.target.value } : m);
                                          setEditContent({...editContent, masters: newMasters});
                                        }}
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-4 mt-4 pt-4 border-t border-[#0b1d3a]/5">
                                    <div>
                                      <label className="block text-[10px] text-[#0b1d3a]/60 mb-1 font-bold">Legado Ritualístico</label>
                                      <textarea 
                                        className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-2 text-[#0b1d3a] text-sm focus:border-[#c5a059]"
                                        rows={2}
                                        value={master.ritualLegacy !== undefined ? master.ritualLegacy : "O trabalho contínuo no desbaste da pedra bruta é a nossa maior missão. Durante esta gestão, buscamos polir não apenas o templo físico, mas o templo em cada um de nossos corações."}
                                        onChange={e => {
                                          const newMasters = editContent.masters.map((m, i) => i === index ? { ...m, ritualLegacy: e.target.value } : m);
                                          setEditContent({...editContent, masters: newMasters});
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] text-[#0b1d3a]/60 mb-1 font-bold">Pautas Atendidas</label>
                                      <textarea 
                                        className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-2 text-[#0b1d3a] text-sm focus:border-[#c5a059]"
                                        rows={2}
                                        value={master.agendaHighlights !== undefined ? master.agendaHighlights : "Mais de 48 sessões rituais conduzidas com excelência e rigor litúrgico."}
                                        onChange={e => {
                                          const newMasters = editContent.masters.map((m, i) => i === index ? { ...m, agendaHighlights: e.target.value } : m);
                                          setEditContent({...editContent, masters: newMasters});
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] text-[#0b1d3a]/60 mb-1 font-bold">Crescimento das Colunas</label>
                                      <textarea 
                                        className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-2 text-[#0b1d3a] text-sm focus:border-[#c5a059]"
                                        rows={2}
                                        value={master.columnGrowth !== undefined ? master.columnGrowth : "Integração de novos obreiros e fortalecimento da egrégora do oriente."}
                                        onChange={e => {
                                          const newMasters = editContent.masters.map((m, i) => i === index ? { ...m, columnGrowth: e.target.value } : m);
                                          setEditContent({...editContent, masters: newMasters});
                                        }}
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#0b1d3a]/5">
                                     <div>
                                      <label className="block text-[10px] text-[#0b1d3a]/60 mb-1 font-bold">Nome da Cunhada</label>
                                      <input 
                                        className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-2 text-[#0b1d3a] text-sm focus:border-[#c5a059]"
                                        value={master.firstLady?.name || ''}
                                        onChange={e => {
                                          const newMasters = editContent.masters.map((m, i) => i === index ? { ...m, firstLady: { ...(m.firstLady || { biography: '', photo: '' }), name: e.target.value } } : m);
                                          setEditContent({...editContent, masters: newMasters});
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] text-[#0b1d3a]/60 mb-1 font-bold">URL Foto Cunhada</label>
                                      <input 
                                        className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-2 text-[#0b1d3a] text-xs focus:border-[#c5a059] outline-none"
                                        placeholder="Link direto (.jpg, .png)"
                                        value={master.firstLady?.photo || ''}
                                        onChange={e => {
                                          const newMasters = editContent.masters.map((m, i) => i === index ? { ...m, firstLady: { ...(m.firstLady || { name: '', biography: '' }), photo: e.target.value } } : m);
                                          setEditContent({...editContent, masters: newMasters});
                                        }}
                                      />
                                      {master.firstLady?.photo && (
                                        <div className="mt-2 w-full h-24 overflow-hidden rounded-xl border border-[#0b1d3a]/10 bg-black/5 relative shadow-sm">
                                          <img 
                                            src={master.firstLady.photo} 
                                            alt="Preview Cunhada" 
                                            className="w-full h-full object-cover" 
                                            referrerPolicy="no-referrer"
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Link+Invalido';
                                            }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="pt-4 flex justify-end">
                                    <button 
                                      onClick={handleSaveContent}
                                      disabled={isSaving}
                                      className="flex items-center gap-2 bg-[#0b1d3a] text-[#f4efe2] px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all border border-[#0b1d3a]/30 shadow-sm hover:bg-[#c5a059]"
                                    >
                                      {isSaving ? <RefreshCw className="animate-spin w-3 h-3" /> : <Save className="w-3 h-3" />} Salvar Este Mestre
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="pt-8 border-t border-[#0b1d3a]/10 flex justify-end">
                          <button 
                            onClick={handleSaveContent}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-[#0b1d3a] text-[#f4efe2] px-10 py-4 rounded-xl font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-[#c5a059] transition-all font-sans shadow-xl"
                          >
                            {isSaving ? <RefreshCw className="animate-spin" /> : <Save />} Salvar Heróis da Arca
                          </button>
                        </div>
                      </div>
                    )}

                    {contentSubTab === 'family' && (
                      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="space-y-4 bg-white/40 p-6 rounded-2xl border border-[#0b1d3a]/10 mb-8 shadow-sm">
                          <h3 className="font-serif text-xl border-l-4 border-[#c5a059] pl-4 uppercase tracking-widest font-bold mb-4 text-[#0b1d3a]">Cabeçalho da Família</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Título Pequeno</label>
                              <input 
                                className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
                                value={editContent.familyGroups?.smallTitle || ''}
                                onChange={e => setEditContent({...editContent, familyGroups: {...(editContent.familyGroups || {}), smallTitle: e.target.value}})}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Título Principal</label>
                              <input 
                                className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
                                value={editContent.familyGroups?.title || ''}
                                onChange={e => setEditContent({...editContent, familyGroups: {...(editContent.familyGroups || {}), title: e.target.value}})}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Sub-título</label>
                            <input 
                              className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
                              value={editContent.familyGroups?.subTitle || ''}
                              onChange={e => setEditContent({...editContent, familyGroups: {...(editContent.familyGroups || {}), subTitle: e.target.value}})}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center bg-[#c5a059]/10 p-6 rounded-2xl border border-[#c5a059]/20 shadow-sm">
                          <div>
                            <h3 className="font-serif text-xl text-[#0b1d3a] uppercase tracking-widest font-bold">Família e Entidades Paramaçônicas</h3>
                            <p className="text-[#0b1d3a]/50 text-[10px] uppercase font-bold tracking-widest">Gerencie o conteúdo do grupo de Cunhadas e ordens juvenis.</p>
                          </div>
                        </div>

                        <div className="space-y-12">
                          {(['guardians', 'demolay', 'daughters'] as const).map((groupKey) => (
                            <div key={groupKey} className="bg-white/40 p-8 rounded-[2rem] border border-[#0b1d3a]/5 shadow-sm space-y-6">
                              <h4 className="text-[#0b1d3a] font-bold uppercase text-sm tracking-widest border-b border-[#0b1d3a]/10 pb-4">
                                {groupKey === 'guardians' ? 'As Guardiãs da Aliança (Cunhadas)' : 
                                 groupKey === 'demolay' ? 'Ordem DeMolay' : 'Garotas do Arco-Íris'}
                              </h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-[10px] text-[#0b1d3a]/60 uppercase mb-1 font-bold">Nome da Instituição</label>
                                    <input 
                                      className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] text-sm focus:border-[#c5a059] outline-none shadow-sm"
                                      value={editContent.familyGroups?.[groupKey].name || editContent.familyGroups?.[groupKey].title || ''}
                                      onChange={e => setEditContent({...editContent, familyGroups: {...editContent.familyGroups!, [groupKey]: {...editContent.familyGroups![groupKey], name: e.target.value}}})}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-[#0b1d3a]/60 uppercase mb-1 font-bold">Subtítulo / Categoria</label>
                                    <input 
                                      className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] text-sm focus:border-[#c5a059] outline-none shadow-sm"
                                      value={editContent.familyGroups?.[groupKey].subTitle || ''}
                                      onChange={e => setEditContent({...editContent, familyGroups: {...editContent.familyGroups!, [groupKey]: {...editContent.familyGroups![groupKey], subTitle: e.target.value}}})}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-[#0b1d3a]/60 uppercase mb-1 font-bold">URL da Imagem de Capa</label>
                                    <input 
                                      className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] text-xs focus:border-[#c5a059] outline-none shadow-sm"
                                      value={editContent.familyGroups?.[groupKey].image || editContent.familyGroups?.[groupKey].photo || editContent.familyGroups?.[groupKey].logo || ''}
                                      onChange={e => setEditContent({...editContent, familyGroups: {...editContent.familyGroups!, [groupKey]: {...editContent.familyGroups![groupKey], image: e.target.value}}})}
                                    />
                                    {(editContent.familyGroups?.[groupKey].image || editContent.familyGroups?.[groupKey].photo || editContent.familyGroups?.[groupKey].logo) && (
                                      <div className="mt-4 aspect-video rounded-xl overflow-hidden border border-[#0b1d3a]/10 bg-black/5 shadow-inner">
                                        <img src={editContent.familyGroups[groupKey].image || editContent.familyGroups[groupKey].photo || editContent.familyGroups[groupKey].logo} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-[10px] text-[#0b1d3a]/60 uppercase mb-1 font-bold">Descrição Principal</label>
                                    <textarea 
                                      className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] text-sm min-h-[100px] focus:border-[#c5a059] outline-none shadow-sm"
                                      value={editContent.familyGroups?.[groupKey].description || ''}
                                      onChange={e => setEditContent({...editContent, familyGroups: {...editContent.familyGroups!, [groupKey]: {...editContent.familyGroups![groupKey], description: e.target.value}}})}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-[#0b1d3a]/60 uppercase mb-1 font-bold">Missão</label>
                                    <textarea 
                                      className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] text-sm focus:border-[#c5a059] outline-none shadow-sm"
                                      value={editContent.familyGroups?.[groupKey].mission || ''}
                                      onChange={e => setEditContent({...editContent, familyGroups: {...editContent.familyGroups!, [groupKey]: {...editContent.familyGroups![groupKey], mission: e.target.value}}})}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-[#0b1d3a]/60 uppercase mb-1 font-bold">Visão</label>
                                    <textarea 
                                      className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] text-sm focus:border-[#c5a059] outline-none shadow-sm"
                                      value={editContent.familyGroups?.[groupKey].vision || ''}
                                      onChange={e => setEditContent({...editContent, familyGroups: {...editContent.familyGroups!, [groupKey]: {...editContent.familyGroups![groupKey], vision: e.target.value}}})}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <label className="block text-[10px] text-white/40 uppercase mb-1">Breve História</label>
                                <textarea 
                                  className="w-full bg-white/40 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] text-sm min-h-[120px] focus:border-[#c5a059] outline-none"
                                  value={editContent.familyGroups?.[groupKey].history || ''}
                                  onChange={e => setEditContent({...editContent, familyGroups: {...editContent.familyGroups!, [groupKey]: {...editContent.familyGroups![groupKey], history: e.target.value}}})}
                                />
                              </div>

                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <label className="block text-[10px] text-white/40 uppercase mb-1">Valores (Separados por vírgula)</label>
                                </div>
                                <input 
                                  className="w-full bg-white/40 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] text-sm focus:border-[#c5a059] outline-none"
                                  value={editContent.familyGroups?.[groupKey].values?.join(', ') || ''}
                                  placeholder="Amor, Caridade, Fraternidade..."
                                  onChange={e => {
                                    const vals = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
                                    setEditContent({...editContent, familyGroups: {...editContent.familyGroups!, [groupKey]: {...editContent.familyGroups![groupKey], values: vals}}});
                                  }}
                                />
                              </div>

                              <div className="pt-4 flex justify-end">
                                <button 
                                  onClick={handleSaveContent}
                                  disabled={isSaving}
                                  className="flex items-center gap-2 bg-[#0b1d3a]/5 border border-[#0b1d3a]/10 text-[#0b1d3a] px-6 py-2 rounded-lg text-[10px] uppercase font-black hover:bg-[#0b1d3a] hover:text-[#f4efe2] transition-all"
                                >
                                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar Alterações deste Grupo
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-8 border-t border-white/10 flex justify-end">
                          <button 
                            onClick={handleSaveContent}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-[#0b1d3a] text-[#f4efe2] px-10 py-4 rounded-xl font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-[#c5a059] transition-all font-sans"
                          >
                            {isSaving ? <RefreshCw className="animate-spin" /> : <Save />} Salvar Tudo (Família)
                          </button>
                        </div>
                      </div>
                    )}

                    {contentSubTab === 'social' && (
                      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="space-y-4 bg-white/40 p-6 rounded-2xl border border-[#0b1d3a]/10 mb-8 shadow-sm">
                          <h3 className="font-serif text-xl border-l-4 border-[#c5a059] pl-4 uppercase tracking-widest font-bold mb-4 text-[#0b1d3a]">Cabeçalho do Álbum Social</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Título Pequeno</label>
                              <input 
                                className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none shadow-sm"
                                value={editContent.gallerySection?.smallTitle || ''}
                                onChange={e => setEditContent({...editContent, gallerySection: {...(editContent.gallerySection || {}), smallTitle: e.target.value}})}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Título Principal</label>
                              <input 
                                className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none shadow-sm"
                                value={editContent.gallerySection?.title || ''}
                                onChange={e => setEditContent({...editContent, gallerySection: {...(editContent.gallerySection || {}), title: e.target.value}})}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Sub-título</label>
                            <input 
                              className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none shadow-sm"
                              value={editContent.gallerySection?.subTitle || ''}
                              onChange={e => setEditContent({...editContent, gallerySection: {...(editContent.gallerySection || {}), subTitle: e.target.value}})}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <h3 className="font-serif text-2xl text-[#0b1d3a] uppercase tracking-widest border-b border-[#c5a059]/20 pb-2 font-bold">Álbum Social & Galeria</h3>
                          <button 
                            onClick={() => {
                              const newPhoto = { url: "", title: "Nova Foto", category: "Social" };
                              setEditContent({...editContent, gallery: [...(editContent.gallery || []), newPhoto]});
                            }}
                            className="px-6 py-3 bg-[#0b1d3a] text-[#f4efe2] font-black rounded-xl text-xs uppercase tracking-widest hover:bg-[#c5a059] transition-all shadow-xl"
                          >
                            + Adicionar Imagem
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {(editContent.gallery || []).map((photo, index) => (
                            <div key={index} className="bg-white/40 p-6 rounded-2xl border border-[#0b1d3a]/5 relative group shadow-sm">
                              <button 
                                onClick={() => {
                                  const newGallery = editContent.gallery.filter((_, i) => i !== index);
                                  setEditContent({...editContent, gallery: newGallery});
                                }}
                                className="absolute top-2 right-2 z-10 text-red-500/50 hover:text-red-500 p-2"
                              >
                                <X className="w-5 h-5" />
                              </button>
                              <div className="space-y-3">
                                {photo.url && (
                                  <div className="w-full h-32 overflow-hidden rounded-xl border border-[#0b1d3a]/10 bg-black/5 shadow-inner">
                                    <img 
                                      src={photo.url} 
                                      alt={photo.title} 
                                      className="w-full h-full object-cover" 
                                      referrerPolicy="no-referrer" 
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Link+Invalido';
                                      }}
                                    />
                                  </div>
                                )}
                                <div>
                                  <label className="block text-[9px] text-[#0b1d3a] uppercase font-black mb-1">Legenda</label>
                                  <input 
                                    className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-2 text-[#0b1d3a] text-xs outline-none shadow-sm"
                                    value={photo.title}
                                    onChange={e => {
                                      const newGallery = editContent.gallery.map((p, i) => i === index ? { ...p, title: e.target.value } : p);
                                      setEditContent({...editContent, gallery: newGallery});
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] text-[#0b1d3a] uppercase font-black mb-1">URL da Imagem</label>
                                  <input 
                                    className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-2 text-[#0b1d3a] text-xs outline-none shadow-sm"
                                    placeholder="Link direto (.jpg, .png)"
                                    value={photo.url}
                                    onChange={e => {
                                      const newGallery = editContent.gallery.map((p, i) => i === index ? { ...p, url: e.target.value } : p);
                                      setEditContent({...editContent, gallery: newGallery});
                                    }}
                                  />
                                </div>
                                <div className="pt-2 flex justify-end">
                                  <button 
                                    onClick={handleSaveContent}
                                    disabled={isSaving}
                                    className="text-[8px] uppercase font-bold text-[#0b1d3a]/40 hover:text-[#c5a059] flex items-center gap-1 transition-colors"
                                  >
                                    {isSaving ? <RefreshCw className="w-2 h-2 animate-spin" /> : <Save className="w-2 h-2" />} Salvar Foto
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-8 border-t border-[#0b1d3a]/10 flex justify-end">
                          <button 
                            onClick={handleSaveContent}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-[#0b1d3a] text-[#f4efe2] px-10 py-4 rounded-xl font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-[#c5a059] transition-all font-sans shadow-xl"
                          >
                            {isSaving ? <RefreshCw className="animate-spin" /> : <Save />} Salvar Álbum
                          </button>
                        </div>
                      </div>
                    )}

                    {contentSubTab === 'contact' && (
                      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="space-y-4 bg-white/40 p-6 rounded-2xl border border-[#0b1d3a]/10 shadow-sm">
                          <h3 className="font-serif text-xl border-l-4 border-[#c5a059] pl-4 uppercase tracking-widest font-bold mb-4 text-[#0b1d3a]">Cabeçalho de Contato</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Título Pequeno</label>
                              <input 
                                className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
                                value={editContent.contact?.smallTitle || ''}
                                onChange={e => setEditContent({...editContent, contact: {...(editContent.contact || {}), smallTitle: e.target.value}})}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Título Principal</label>
                              <input 
                                className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
                                value={editContent.contact?.title || ''}
                                onChange={e => setEditContent({...editContent, contact: {...(editContent.contact || {}), title: e.target.value}})}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-[#0b1d3a] mb-2 font-bold">Sub-título</label>
                            <input 
                              className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
                              value={editContent.contact?.subTitle || ''}
                              onChange={e => setEditContent({...editContent, contact: {...(editContent.contact || {}), subTitle: e.target.value}})}
                            />
                          </div>
                        </div>

                        <div className="bg-[#c5a059]/10 p-6 rounded-2xl border border-[#c5a059]/20 shadow-sm">
                          <h3 className="font-serif text-xl border-l-4 border-[#c5a059] pl-4 uppercase tracking-widest font-bold text-[#0b1d3a]">Informações de Contato e Localização</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <div className="bg-white/40 p-6 rounded-3xl border border-[#0b1d3a]/5 space-y-4 shadow-sm">
                              <h4 className="text-[#c5a059] font-bold uppercase text-[11px] tracking-widest border-b border-[#0b1d3a]/10 pb-2">Endereço Principal</h4>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-[9px] text-[#0b1d3a]/40 uppercase mb-1 font-bold">Logradouro / Cidade</label>
                                  <input 
                                    className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] text-sm focus:border-[#c5a059]"
                                    value={editContent.contact?.address || ''}
                                    onChange={e => setEditContent({...editContent, contact: {...(editContent.contact || {}), address: e.target.value}})}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] text-[#0b1d3a]/40 uppercase mb-1 font-bold">Complemento / Região</label>
                                  <input 
                                    className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] text-sm focus:border-[#c5a059]"
                                    value={editContent.contact?.subAddress || ''}
                                    onChange={e => setEditContent({...editContent, contact: {...(editContent.contact || {}), subAddress: e.target.value}})}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="bg-white/40 p-6 rounded-3xl border border-[#0b1d3a]/5 space-y-4 shadow-sm">
                              <h4 className="text-[#c5a059] font-bold uppercase text-[11px] tracking-widest border-b border-[#0b1d3a]/10 pb-2">Horários de Reunião</h4>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-[9px] text-[#0b1d3a]/40 uppercase mb-1 font-bold">Dia e Hora</label>
                                  <input 
                                    className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] text-sm focus:border-[#c5a059]"
                                    value={editContent.contact?.meetings || ''}
                                    onChange={e => setEditContent({...editContent, contact: {...(editContent.contact || {}), meetings: e.target.value}})}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] text-[#0b1d3a]/40 uppercase mb-1 font-bold">Observação</label>
                                  <input 
                                    className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] text-sm focus:border-[#c5a059]"
                                    value={editContent.contact?.subMeetings || ''}
                                    onChange={e => setEditContent({...editContent, contact: {...(editContent.contact || {}), subMeetings: e.target.value}})}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="bg-white/40 p-6 rounded-3xl border border-[#0b1d3a]/5 space-y-4 shadow-sm">
                              <h4 className="text-[#c5a059] font-bold uppercase text-[11px] tracking-widest border-b border-[#0b1d3a]/10 pb-2">Canais de Comunicação</h4>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-[9px] text-[#0b1d3a]/40 uppercase mb-1 font-bold">Email Principal</label>
                                  <input 
                                    className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] text-sm focus:border-[#c5a059]"
                                    value={editContent.contact?.email || ''}
                                    onChange={e => setEditContent({...editContent, contact: {...(editContent.contact || {}), email: e.target.value}})}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] text-[#0b1d3a]/40 uppercase mb-1 font-bold">Departamento / Nota</label>
                                  <input 
                                    className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] text-sm focus:border-[#c5a059]"
                                    value={editContent.contact?.subEmail || ''}
                                    onChange={e => setEditContent({...editContent, contact: {...(editContent.contact || {}), subEmail: e.target.value}})}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="bg-white/40 p-6 rounded-3xl border border-[#0b1d3a]/5 space-y-4 shadow-sm">
                              <h4 className="text-[#c5a059] font-bold uppercase text-[11px] tracking-widest border-b border-[#0b1d3a]/10 pb-2">Geolocalização (Google Maps)</h4>
                              <div>
                                <label className="block text-[9px] text-[#0b1d3a]/40 uppercase mb-1 font-bold">URL de Incorporação (Embed URL)</label>
                                <textarea 
                                  className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] text-[10px] font-mono outline-none focus:border-[#c5a059]"
                                  rows={4}
                                  placeholder="Copie o link do 'src' da tag <iframe> do Google Maps"
                                  value={editContent.contact?.mapEmbedUrl || ''}
                                  onChange={e => setEditContent({...editContent, contact: {...(editContent.contact || {}), mapEmbedUrl: e.target.value}})}
                                />
                                <p className="text-[8px] text-[#0b1d3a]/40 mt-2 italic font-bold">Dica: No Google Maps, clique em Compartilhar &gt; Incorporar um mapa e copie apenas o valor dentro de 'src="..."'</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-8 border-t border-[#0b1d3a]/10 flex justify-end">
                          <button 
                            onClick={handleSaveContent}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-[#0b1d3a] text-[#f4efe2] px-10 py-4 rounded-xl font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-[#c5a059] transition-all font-sans shadow-xl"
                          >
                            {isSaving ? <RefreshCw className="animate-spin" /> : <Save />} Salvar Contato
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'library' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-2xl text-[#0b1d3a] uppercase tracking-widest underline decoration-[#c5a059]/30 underline-offset-8 font-bold">Acervo da Biblioteca</h3>
                <button 
                  onClick={async () => {
                    const newItem = {
                      title: "Novo Documento",
                      category: "Trabalho",
                      type: "link", // Default type
                      author: "Irmão...",
                      description: "",
                      url: "",
                      isPublic: false,
                      isHighlightedInCircle: false,
                      isFixedInCircle: false,
                      isCuriosity: false,
                      addedBy: auth.currentUser?.uid || '',
                      addedByEmail: auth.currentUser?.email || '',
                      createdAt: serverTimestamp()
                    };
                    await addDoc(collection(db, 'library_items'), newItem);
                  }}
                  className="px-6 py-3 bg-[#0b1d3a] text-[#f4efe2] font-black rounded-xl text-xs uppercase tracking-widest hover:bg-[#c5a059] transition-all shadow-xl"
                >
                  + Novo Item
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {libraryItems.map((item) => (
                  <LibraryItemEditor 
                    key={item.id} 
                    item={item} 
                    handleLibraryFileUpload={handleLibraryFileUpload}
                    uploadingItems={uploadingItems}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-12">
              {/* Copy Links Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/40 p-8 rounded-3xl border border-[#0b1d3a]/10 backdrop-blur-sm shadow-sm">
                <div className="space-y-2">
                  <h4 className="text-[#0b1d3a] font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                     <Globe className="w-4 h-4 text-[#c5a059]" /> Link do Site
                  </h4>
                  <div className="flex gap-2">
                    <input 
                      readOnly
                      className="flex-1 bg-white/80 border border-[#0b1d3a]/10 rounded-xl p-3 text-[#0b1d3a]/60 text-[10px] font-mono outline-none shadow-inner"
                      value={window.location.origin}
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin);
                        alert('Link do site copiado!');
                      }}
                      className="px-4 py-2 bg-[#0b1d3a] text-[#f4efe2] rounded-xl font-bold text-[10px] uppercase hover:bg-[#c5a059] transition-all shadow-md"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[#0b1d3a] font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                     <FileText className="w-4 h-4 text-[#c5a059]" /> Instruções
                  </h4>
                  <div className="flex gap-2">
                    <input 
                      readOnly
                      className="flex-1 bg-white/80 border border-[#0b1d3a]/10 rounded-xl p-3 text-[#0b1d3a]/60 text-[10px] font-mono outline-none shadow-inner"
                      value={`${window.location.origin}/instrucoes`}
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/instrucoes`);
                        alert('Link de instruções copiado!');
                      }}
                      className="px-4 py-2 bg-[#0b1d3a] text-[#f4efe2] rounded-xl font-bold text-[10px] uppercase hover:bg-[#c5a059] transition-all shadow-md"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              </div>

              {/* Invitations Section */}
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-serif text-2xl text-[#0b1d3a] uppercase tracking-widest underline decoration-[#c5a059]/30 underline-offset-8 text-left font-bold">Solicitações de Ingresso</h3>
                    <p className="text-[#0b1d3a]/40 text-[9px] uppercase font-black tracking-widest mt-2">Pessoas que pediram acesso pelo site</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {membershipRequests.length === 0 ? (
                    <p className="text-[10px] text-[#0b1d3a]/20 uppercase font-black tracking-[0.2em] italic py-8 text-center bg-white/20 border border-[#0b1d3a]/5 rounded-2xl">Nenhuma solicitação recebida</p>
                  ) : (
                    membershipRequests.map(req => (
                      <div key={req.id} className="bg-white/40 p-6 rounded-2xl border border-[#0b1d3a]/5 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-[#c5a059]/30 transition-all shadow-sm">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border ${req.status === 'APPROVED' ? 'bg-green-500/10 border-green-500/30 text-green-500' : req.status === 'REJECTED' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-[#c5a059]/10 border-[#c5a059]/30 text-[#c5a059]'}`}>
                            {req.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-[#0b1d3a] font-bold">{req.name}</h4>
                            <p className="text-[#c5a059] text-xs font-bold">{req.email}</p>
                            <p className="text-[8px] text-[#0b1d3a]/20 uppercase font-bold tracking-widest mt-1">
                              Solicitado em: {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleString('pt-BR') : 'Recent'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {req.status === 'PENDING' ? (
                            <>
                              <button 
                                onClick={() => handleUpdateStatusRequest(req.id, req.email, 'APPROVED')}
                                className="px-4 py-2 bg-green-500 text-white font-black uppercase text-[9px] tracking-widest rounded-lg hover:bg-green-600 transition-all shadow-sm"
                              >
                                Aprovar
                              </button>
                              <button 
                                onClick={() => handleUpdateStatusRequest(req.id, req.email, 'REJECTED')}
                                className="px-4 py-2 bg-white/40 text-red-500 font-black border border-red-500/30 uppercase text-[9px] tracking-widest rounded-lg hover:bg-red-500 hover:text-white transition-all"
                              >
                                Recusar
                              </button>
                            </>
                          ) : (
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${req.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                              {req.status === 'APPROVED' ? 'Aprovado' : 'Recusado'}
                            </span>
                          )}
                          <button 
                            onClick={() => handleDeleteRequest(req.id)}
                            className="p-2 text-[#0b1d3a]/10 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Invitations Section */}
              <div className="space-y-6 pt-12 border-t border-[#0b1d3a]/10">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-serif text-2xl text-[#0b1d3a] uppercase tracking-widest underline decoration-[#c5a059]/30 underline-offset-8 text-left font-bold">Convites Autorizados</h3>
                    <p className="text-[#0b1d3a]/40 text-[9px] uppercase font-black tracking-widest mt-2">Emails que podem se cadastrar na área restrita</p>
                  </div>
                </div>

                <form onSubmit={handleInvite} className="bg-white/40 p-8 rounded-3xl border border-[#0b1d3a]/10 mb-8 backdrop-blur-sm shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div className="space-y-2">
                      <label className="text-[10px] text-[#0b1d3a] uppercase font-black tracking-widest ml-1 font-bold">E-mail para Autorizar</label>
                      <input 
                        className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-xl p-4 text-[#0b1d3a] focus:outline-none focus:border-[#c5a059] transition-all font-sans shadow-inner"
                        placeholder="email@irmao.com"
                        value={newInviteEmail}
                        onChange={e => setNewInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-[#0b1d3a] uppercase font-black tracking-widest ml-1 font-bold">Mensagem Pessoal (Opcional)</label>
                      <input 
                        className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-xl p-4 text-[#0b1d3a] focus:outline-none focus:border-[#c5a059] transition-all font-sans shadow-inner"
                        placeholder="Bem-vindo à nossa Arca, Ir."
                        value={newInviteMessage}
                        onChange={e => setNewInviteMessage(e.target.value)}
                      />
                    </div>
                  </div>
                  <button 
                    disabled={isInviting}
                    className="w-full mt-6 py-4 bg-[#0b1d3a] text-[#f4efe2] font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-[#c5a059] disabled:opacity-50 transition-all shadow-xl"
                  >
                    {isInviting ? <RefreshCw className="animate-spin mx-auto" /> : 'Autorizar E-mail Individual'}
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {invitations.filter(inv => inv.status !== 'ACCEPTED').map(invite => (
                    <div key={invite.id} className="p-6 bg-white/40 rounded-2xl border border-[#0b1d3a]/5 relative group hover:border-[#c5a059]/20 transition-all shadow-sm">
                      <button 
                        onClick={() => handleRemoveInvite(invite.email)}
                        className="absolute top-4 right-4 text-red-500/30 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059] border border-[#c5a059]/10">
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[#0b1d3a] font-bold text-sm truncate">{invite.email}</p>
                          <p className="text-[8px] text-[#c5a059] uppercase font-black tracking-widest">
                            Autorizado em: {invite.createdAt?.toDate ? invite.createdAt.toDate().toLocaleString('pt-BR') : 'Recente'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-[#0b1d3a]/5">
                        <span className={`text-[8px] font-black tracking-widest uppercase px-2 py-1 rounded-full ${invite.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20'}`}>
                          {invite.status === 'ACCEPTED' ? 'Cadastrado' : 'Pendente'}
                        </span>
                        {invite.status === 'ACCEPTED' && (
                           <span className="text-[8px] text-[#0b1d3a]/30 truncate max-w-[100px]">UID: {invite.userId}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Registered Users Section */}
              <div className="space-y-6 pt-12 border-t border-[#0b1d3a]/10">
                <div>
                   <h3 className="font-serif text-2xl text-[#0b1d3a] uppercase tracking-widest underline decoration-[#c5a059]/30 underline-offset-8 text-left font-bold">Membros Cadastrados</h3>
                   <p className="text-[#0b1d3a]/40 text-[9px] uppercase font-black tracking-widest mt-2 text-left">Irmãos que já criaram suas contas e estão ativos</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {registeredUsers.map(user => (
                    <div key={user.id} className="p-6 bg-white/40 rounded-2xl border border-[#0b1d3a]/5 flex gap-4 items-center group hover:border-[#c5a059]/20 transition-all shadow-sm">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059] text-xl font-bold border border-[#c5a059]/20 overflow-hidden shadow-inner font-serif">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            user.displayName?.[0]?.toUpperCase() || 'I'
                          )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${user.isOnline ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-500'}`} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[#0b1d3a] font-bold text-sm truncate">{user.displayName || 'Irmão'}</h4>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => navigate(`/area-restrita?uid=${user.id}&tab=profile`)}
                              className="text-[#c5a059] hover:text-[#0b1d3a] transition-colors p-1"
                              title="Editar Perfil Completo"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={async () => {
                                if(confirm(`Desativar e excluir acesso do irmão ${user.displayName || user.email}?`)) {
                                  try {
                                    await deleteDoc(doc(db, 'users', user.id));
                                    alert('Irmão excluído da base de dados.');
                                  } catch(e) {
                                    handleFirestoreError(e, OperationType.DELETE, `users/${user.id}`);
                                  }
                                }
                              }}
                              className="text-red-500/30 hover:text-red-500 transition-colors p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[#0b1d3a]/40 text-xs truncate">{user.email}</p>
                        
                        <div className="mt-2 space-y-1">
                          <label className="text-[7px] text-[#c5a059] uppercase font-black tracking-widest block ml-1 font-bold">Cargo Atual</label>
                          <div className="flex gap-1">
                            <select 
                              className="flex-1 text-[8px] px-2 py-1 bg-white/80 border border-[#0b1d3a]/10 rounded text-[#c5a059] uppercase font-black tracking-widest outline-none cursor-pointer hover:bg-white transition-all shadow-sm"
                              value={user.currentRole || ''}
                              onChange={async (e) => {
                                try {
                                  await updateDoc(doc(db, 'users', user.id), { currentRole: e.target.value });
                                } catch(err) {
                                  handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
                                }
                              }}
                            >
                              <option value="">Sem Cargo</option>
                              {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            {(auth.currentUser?.email === 'lojaarcadaalianca34@gmail.com') && (
                              <button 
                                onClick={() => {
                                  const newRole = prompt('Digite o nome do novo cargo:');
                                  if (newRole) {
                                    setAvailableRoles(prev => [...prev, newRole]);
                                    updateDoc(doc(db, 'users', user.id), { currentRole: newRole });
                                  }
                                }}
                                className="p-1 bg-[#0b1d3a] text-[#f4efe2] border border-[#0b1d3a]/20 rounded hover:bg-[#c5a059] transition-all"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <select 
                            className="text-[8px] px-2 py-0.5 bg-white/40 border border-[#0b1d3a]/10 rounded text-[#0b1d3a]/60 uppercase font-black tracking-widest outline-none cursor-pointer hover:bg-white/60 shadow-sm"
                            value={user.role || 'member'}
                            onChange={async (e) => {
                              try {
                                await updateDoc(doc(db, 'users', user.id), { role: e.target.value });
                              } catch(err) {
                                handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
                              }
                            }}
                          >
                            <option value="member">Membro</option>
                            <option value="admin">Administrador</option>
                          </select>
                          <span className="text-[8px] text-white/20 uppercase font-black tracking-widest">
                            {user.isOnline ? 'Online agora' : user.lastSeen ? `Visto: ${new Date(user.lastSeen?.toDate?.() || user.lastSeen).toLocaleDateString()}` : 'Inativo'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
