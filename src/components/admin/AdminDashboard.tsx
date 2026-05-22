import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db, auth, logout, handleFirestoreError, OperationType, storage } from '@/src/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, setDoc, deleteDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useContent } from '@/src/context/ContentContext';
import { LogOut, Users, FileText, Save, Check, RefreshCw, X, Brain, Printer, ChevronDown, ChevronUp, Book, Video, Globe, Star, Play, Download, LayoutDashboard, ExternalLink, ArrowLeft, ShieldCheck, Clock, Eye, EyeOff, Plus, Upload, Link as LinkIcon, Trash2, MessageSquare, Edit, History, HandHeart, AlignLeft, AlignCenter, AlignRight, AlignJustify, Archive, Sliders } from 'lucide-react';
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

const formatBirthDate = (dateStr: any) => {
  if (!dateStr) return "-";
  
  // If it is a Firestore timestamp or contains toDate
  if (dateStr && typeof dateStr === 'object' && typeof dateStr.toDate === 'function') {
    try {
      const d = dateStr.toDate();
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      // fallback
    }
  }

  const str = String(dateStr);
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return str;
  
  try {
    const parts = str.split('T')[0].split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  } catch (e) {
    // fallback
  }
  return str;
};

const renderAnalysisReport = (reportVal: any) => {
  if (!reportVal) return null;
  
  let report = reportVal;
  if (typeof report === 'string') {
    try {
      report = JSON.parse(report);
    } catch (e) {
      // It is plain text
      return <pre className="whitespace-pre-wrap text-[#0b1d3a]/90 font-sans text-xs md:text-sm">{report}</pre>;
    }
  }

  // Beautiful styled rendering for structured report
  return (
    <div className="space-y-6 text-[#0b1d3a]">
      <div className="flex items-center justify-between border-b border-[#0b1d3a]/10 pb-3">
        <h5 className="font-bold uppercase text-[10px] tracking-wider text-[#c5a059]">Parecer de Sindicância AI</h5>
        <div className="bg-[#0b1d3a] text-[#f4efe2] px-3 py-1 rounded-full text-xs font-bold font-serif whitespace-nowrap">
          Perfil {report.profileType || 'Indefinido'}
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase font-semibold text-[#0b1d3a]/40 tracking-wider">Síntese do Candidato</p>
        <p className="font-serif leading-relaxed text-sm mt-1">{report.synthesis}</p>
      </div>

      <div>
        <p className="text-[10px] uppercase font-semibold text-[#0b1d3a]/40 tracking-wider mb-2">Desempenho por Valores</p>
        <div className="space-y-2">
          {Array.isArray(report.performanceTable) ? (
            report.performanceTable.map((row: any, idx: number) => {
              const scoreColors: Record<string, string> = {
                'A': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
                'B': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
                'C': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                'D': 'bg-red-500/10 text-red-600 border-red-500/20'
              };
              const scoreColor = scoreColors[row.score?.toUpperCase()] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';
              
              return (
                <div key={idx} className="flex justify-between items-start gap-4 p-3 bg-[#0b1d3a]/5 rounded-xl border border-[#0b1d3a]/5">
                  <div className="space-y-1">
                    <p className="font-bold text-xs">{row.category}</p>
                    <p className="text-[11px] text-[#0b1d3a]/70 leading-normal">{row.reason}</p>
                  </div>
                  <span className={`text-xs font-serif font-bold px-2 py-1 rounded border ${scoreColor} min-w-[32px] text-center shrink-0`}>
                    {row.score}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-[#0b1d3a]/60 italic">Nenhum detalhe de desempenho disponível.</p>
          )}
        </div>
      </div>

      {report.sindicanciaPoints && (
        <div>
          <p className="text-[10px] uppercase font-semibold text-[#0b1d3a]/40 tracking-wider mb-2">Pontos para Sindicância</p>
          <ul className="space-y-1.5 list-disc pl-4 text-xs font-medium leading-relaxed">
            {Array.isArray(report.sindicanciaPoints) ? (
              report.sindicanciaPoints.map((point: string, idx: number) => (
                <li key={idx} className="text-[#0b1d3a]/80">{point}</li>
              ))
            ) : (
              <li className="text-[#0b1d3a]/80">{String(report.sindicanciaPoints)}</li>
            )}
          </ul>
        </div>
      )}

      <div className="bg-[#0b1d3a]/5 p-4 rounded-xl border border-[#c5a059]/20">
        <p className="text-[10px] uppercase font-bold text-[#c5a059] tracking-wider">Parecer Final do Consultor</p>
        <p className="font-serif italic leading-relaxed text-xs text-[#0b1d3a]/90 mt-1.5">{report.finalParecer}</p>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { content, updateContent } = useContent();
  const [activeTab, setActiveTab] = useState<'leads' | 'content' | 'events' | 'library' | 'members' | 'permissions'>('leads');
  const [contentSubTab, setContentSubTab] = useState<'site' | 'management' | 'family' | 'masters' | 'social' | 'contact' | 'home' | 'about' | 'filantropia' | null>(null);
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
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [analyzingLeads, setAnalyzingLeads] = useState<Record<string, boolean>>({});
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [analysisReports, setAnalysisReports] = useState<Record<string, any>>({});
  const [leadsSubTab, setLeadsSubTab] = useState<'new' | 'sindicancia' | 'archived'>('new');
  const [uploadingItems, setUploadingItems] = useState<Record<string, boolean>>({});

  const { homeContent, updateHomeContent } = useContent();
  const [tempHomeContent, setTempHomeContent] = useState<any>(null);
  const [isSavingHome, setIsSavingHome] = useState(false);
  const [uploadingHomeImages, setUploadingHomeImages] = useState<Record<string, boolean>>({});

  const { aboutContent, updateAboutContent } = useContent();
  const [tempAboutContent, setTempAboutContent] = useState<any>(null);
  const [isSavingAbout, setIsSavingAbout] = useState(false);
  const [uploadingAboutImages, setUploadingAboutImages] = useState<Record<string, boolean>>({});

  const { socialContent, updateSocialContent } = useContent();
  const [tempSocialContent, setTempSocialContent] = useState<any>(null);
  const [isSavingSocial, setIsSavingSocial] = useState(false);
  const [uploadingSocialImages, setUploadingSocialImages] = useState<Record<string, boolean>>({});

  const loggedInEmail = auth.currentUser?.email?.toLowerCase() || '';
  const isMasterAdmin = ['sophiabohn@gmail.com', 'lojaarcadaalianca34@gmail.com'].includes(loggedInEmail) || 
                        registeredUsers.find(u => u.uid === auth.currentUser?.uid || u.id === auth.currentUser?.uid)?.isMasterAdmin === true;

  useEffect(() => {
    if (auth.currentUser && ['sophiabohn@gmail.com', 'lojaarcadaalianca34@gmail.com'].includes(auth.currentUser.email?.toLowerCase() || '')) {
      const userUid = auth.currentUser.uid;
      const mainUserDoc = registeredUsers.find(u => u.id === userUid);
      if (mainUserDoc && (mainUserDoc.isMasterAdmin !== true || mainUserDoc.role !== 'admin' || mainUserDoc.isAdmin !== true)) {
        updateDoc(doc(db, 'users', userUid), {
          isMasterAdmin: true,
          isAdmin: true,
          role: 'admin'
        }).catch(err => {
          console.error("Auto-init master admin error:", err);
        });
      }
    }
  }, [auth.currentUser, registeredUsers]);

  useEffect(() => {
    if (homeContent) {
      setTempHomeContent(JSON.parse(JSON.stringify(homeContent)));
    }
  }, [homeContent]);

  useEffect(() => {
    if (aboutContent) {
      setTempAboutContent(JSON.parse(JSON.stringify(aboutContent)));
    }
  }, [aboutContent]);

  useEffect(() => {
    if (socialContent) {
      setTempSocialContent(JSON.parse(JSON.stringify(socialContent)));
    }
  }, [socialContent]);

  const handleSocialImageUpload = async (fieldPath: string, file: File, indexProp?: number) => {
    if (!file) return;
    
    setUploadingSocialImages(prev => ({ ...prev, [fieldPath]: true }));
    
    try {
      const storageRef = ref(storage, `social/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise<string>((resolve, reject) => {
        uploadTask.on('state_changed', 
          null,
          (error) => {
            console.error("Social image upload error:", error);
            setUploadingSocialImages(prev => ({ ...prev, [fieldPath]: false }));
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            setTempSocialContent((prev: any) => {
              if (!prev) return prev;
              const updated = { ...prev };
              if (indexProp !== undefined) {
                if (fieldPath === 'gallery') {
                  const updatedGallery = [...(updated.gallery || [])];
                  updatedGallery[indexProp] = downloadURL;
                  updated.gallery = updatedGallery;
                } else if (fieldPath === 'campaigns') {
                  const updatedCampaigns = [...(updated.campaigns || [])];
                  updatedCampaigns[indexProp].image = downloadURL;
                  updated.campaigns = updatedCampaigns;
                }
              } else {
                const parts = fieldPath.split('.');
                if (parts.length === 2) {
                  updated[parts[0]] = { ...updated[parts[0]], [parts[1]]: downloadURL };
                } else {
                  updated[fieldPath] = downloadURL;
                }
              }
              return updated;
            });
            
            setUploadingSocialImages(prev => ({ ...prev, [fieldPath]: false }));
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error("Error setting up social image upload:", error);
      setUploadingSocialImages(prev => ({ ...prev, [fieldPath]: false }));
    }
  };

  const handleAboutImageUpload = async (fieldPath: string, file: File, indexProp?: number) => {
    if (!file) return;
    
    setUploadingAboutImages(prev => ({ ...prev, [fieldPath]: true }));
    
    try {
      const storageRef = ref(storage, `about/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise<string>((resolve, reject) => {
        uploadTask.on('state_changed', 
          null,
          (error) => {
            console.error("About image upload error:", error);
            setUploadingAboutImages(prev => ({ ...prev, [fieldPath]: false }));
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            setTempAboutContent((prev: any) => {
              if (!prev) return prev;
              const updated = { ...prev };
              if (indexProp !== undefined) {
                const updatedImages = [...(updated.images || [])];
                updatedImages[indexProp] = downloadURL;
                updated.images = updatedImages;
              } else {
                const parts = fieldPath.split('.');
                if (parts.length === 2) {
                  updated[parts[0]] = { ...updated[parts[0]], [parts[1]]: downloadURL };
                } else {
                  updated[fieldPath] = downloadURL;
                }
              }
              return updated;
            });
            
            setUploadingAboutImages(prev => ({ ...prev, [fieldPath]: false }));
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error("Error setting up about image upload:", error);
      setUploadingAboutImages(prev => ({ ...prev, [fieldPath]: false }));
    }
  };

  const renderAboutImageEditor = (label: string, fieldPath: string, imageUrl: string, indexProp?: number) => {
    return (
      <div className="space-y-3 bg-white/35 border border-[#0b1d3a]/5 p-4 rounded-2xl shadow-sm text-left">
        <label className="block text-[10px] uppercase font-black tracking-widest text-[#0b1d3a]">{label}</label>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <input
            type="text"
            className="flex-1 w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-2.5 text-xs text-[#0b1d3a] lg:text-sm focus:border-[#c5a059]/50 outline-none"
            placeholder="URL da Imagem..."
            value={imageUrl || ''}
            onChange={(e) => {
              const urlVal = e.target.value;
              setTempAboutContent((prev: any) => {
                if (!prev) return prev;
                const updated = { ...prev };
                if (indexProp !== undefined) {
                  const updatedImages = [...(updated.images || [])];
                  updatedImages[indexProp] = urlVal;
                  updated.images = updatedImages;
                } else {
                  const parts = fieldPath.split('.');
                  if (parts.length === 2) {
                    updated[parts[0]] = { ...updated[parts[0]], [parts[1]]: urlVal };
                  } else {
                    updated[fieldPath] = urlVal;
                  }
                }
                return updated;
              });
            }}
          />
          <div className="relative">
            <button className="flex items-center gap-2 px-3 py-2 bg-[#0b1d3a] hover:bg-[#c5a059] text-white text-[10px] font-black uppercase rounded-xl transition-all shadow pointer-events-none">
              <Upload className="w-3.5 h-3.5" /> Enviar
            </button>
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAboutImageUpload(fieldPath, file, indexProp);
              }}
            />
          </div>
        </div>
        {uploadingAboutImages[fieldPath] && (
          <p className="text-[10px] text-[#c5a059] font-bold animate-pulse">Enviando imagem, aguarde...</p>
        )}
        {imageUrl && (
          <div className="mt-2 w-full max-w-[200px] h-20 rounded-xl overflow-hidden border border-[#0b1d3a]/10 bg-black/5 shadow-inner">
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    );
  };

  const handleHomeImageUpload = async (fieldPath: string, file: File, sectionId?: string) => {
    if (!file) return;
    
    setUploadingHomeImages(prev => ({ ...prev, [fieldPath]: true }));
    
    try {
      const storageRef = ref(storage, `home/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise<string>((resolve, reject) => {
        uploadTask.on('state_changed', 
          null,
          (error) => {
            console.error("Home image upload error:", error);
            setUploadingHomeImages(prev => ({ ...prev, [fieldPath]: false }));
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            setTempHomeContent((prev: any) => {
              if (!prev) return prev;
              const updated = { ...prev };
              if (sectionId) {
                updated.dynamicSections = (updated.dynamicSections || []).map((sec: any) => {
                  if (sec.id === sectionId) {
                    return { ...sec, image: downloadURL };
                  }
                  return sec;
                });
              } else {
                const parts = fieldPath.split('.');
                if (parts.length === 2) {
                  updated[parts[0]] = { ...updated[parts[0]], [parts[1]]: downloadURL };
                }
              }
              return updated;
            });
            
            setUploadingHomeImages(prev => ({ ...prev, [fieldPath]: false }));
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error("Error setting up home image upload:", error);
      setUploadingHomeImages(prev => ({ ...prev, [fieldPath]: false }));
    }
  };

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

  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), {
        status: newStatus
      });
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Erro ao atualizar status do candidato.');
    }
  };

  const getLeadStatusType = (lead: any): 'new' | 'sindicancia' | 'archived' => {
    if (!lead) return 'new';
    const s = String(lead.status || 'Proposta Recebida').toUpperCase().trim();
    if (s.includes('SINDICÂNCIA') || s.includes('SINDICANCIA')) {
      return 'sindicancia';
    }
    if (s.includes('ARQUIVAD') || s.includes('RECUSAD') || s.includes('REJEITAD') || s === 'REJECTED' || s === 'RECUSADO') {
      return 'archived';
    }
    return 'new';
  };

  const getLeadStatusBadge = (lead: any) => {
    const currentStatus = lead.status || "Proposta Recebida";
    
    if (currentStatus === "Em Sindicância Formal") {
      return (
        <span className="bg-emerald-500/10 text-emerald-600 text-[8px] px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase font-black tracking-widest whitespace-nowrap">
          Em Sindicância Formal
        </span>
      );
    }
    
    if (currentStatus === "Proposta Arquivada" || currentStatus === "Proposta Arquivada / Recusada" || currentStatus.includes("Arquivada") || currentStatus.includes("Recusada")) {
      return (
        <span className="bg-gray-500/10 text-gray-500 text-[8px] px-2.5 py-1 rounded-full border border-gray-500/20 uppercase font-black tracking-widest whitespace-nowrap">
          Proposta Arquivada
        </span>
      );
    }
    
    return (
      <span className="bg-amber-500/10 text-amber-600 text-[8px] px-2.5 py-1 rounded-full border border-amber-500/20 uppercase font-black tracking-widest whitespace-nowrap">
        Proposta Recebida
      </span>
    );
  };

  const handlePrint = (reportId: string) => {
    const reportVal = analysisReports[reportId] || leads.find(l => l.id === reportId)?.analysisReport;
    if (!reportVal) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let report = reportVal;
    if (typeof report === 'string') {
      try {
        report = JSON.parse(report);
      } catch (e) {
        // Not a JSON string
      }
    }

    let reportHtml = "";
    if (typeof report === 'object' && report !== null) {
      reportHtml = `
        <div style="margin-bottom: 25px; border-bottom: 1px dashed #333; padding-bottom: 15px;">
          <h2 style="margin: 0 0 10px 0; font-size: 18px; text-transform: uppercase;">Classificação de Perfil: Perfil ${report.profileType || 'N/A'}</h2>
          <p style="margin: 0; font-style: italic;"><strong>Síntese:</strong> ${report.synthesis || ''}</p>
        </div>
        
        <h3 style="text-transform: uppercase; font-size: 14px; border-bottom: 1px solid #333; margin-top: 25px;">Desempenho por Valores</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="border-bottom: 2px solid #333;">
              <th style="text-align: left; padding: 6px; font-weight: bold; font-size: 12px; width: 30%;">Categoria</th>
              <th style="text-align: center; padding: 6px; font-weight: bold; font-size: 12px; width: 15%;">Score</th>
              <th style="text-align: left; padding: 6px; font-weight: bold; font-size: 12px; width: 55%;">Justificativa</th>
            </tr>
          </thead>
          <tbody>
            ${(report.performanceTable || []).map((p: any) => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 6px; font-size: 12px; font-weight: bold;">${p.category}</td>
                <td style="padding: 6px; font-size: 12px; text-align: center; font-weight: bold;">${p.score}</td>
                <td style="padding: 6px; font-size: 12px;">${p.reason}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${report.sindicanciaPoints && report.sindicanciaPoints.length > 0 ? `
          <h3 style="text-transform: uppercase; font-size: 14px; border-bottom: 1px solid #333; margin-top: 25px;">Pontos Críticos para Sindicância Presencial</h3>
          <ul style="margin-top: 10px; padding-left: 20px; font-size: 12px;">
            ${report.sindicanciaPoints.map((p: string) => `<li style="margin-bottom: 4px;">${p}</li>`).join('')}
          </ul>
        ` : ''}

        <div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #ccc; margin-top: 30px; border-radius: 4px;">
          <h3 style="margin: 0 0 8px 0; text-transform: uppercase; font-size: 13px; color: #111;">Parecer Final do Consultor AI</h3>
          <p style="margin: 0; font-size: 12px; line-height: 1.5; font-style: italic;">${report.finalParecer || ''}</p>
        </div>
      `;
    } else {
      reportHtml = `<pre>${String(reportVal)}</pre>`;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Parecer Técnico Confidencial - ARLS Arca da Aliança nº 34</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; color: #333; max-width: 800px; margin: auto; }
            pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; text-transform: uppercase; letter-spacing: 2px; font-size: 20px; }
            .header p { margin: 5px 0; color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
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
          ${reportHtml}
          <div class="no-print" style="margin-top: 50px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; cursor: pointer; font-family: inherit; border: 1px solid #333; background: #fff; font-weight: bold;">Imprimir / Salvar como PDF</button>
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
    let analysis = lead.analysis || lead.analysisReport || analysisReports[lead.id];
    if (typeof analysis === 'string') {
      try {
        analysis = JSON.parse(analysis);
      } catch (e) {
        analysis = null;
      }
    }

    if (analysis) {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("times", "bold");
      doc.text("PARECER TÉCNICO - INTELIGÊNCIA ARTIFICIAL", 14, currentY);
      
      currentY += 8;
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      const synthesis = doc.splitTextToSize(`SÍNTESE: ${analysis.synthesis || "N/A"}`, pageWidth - 28);
      doc.text(synthesis, 14, currentY);
      currentY += (synthesis.length * 5) + 5;

      // Score Table
      const scoreData = [
        ["Perfil Identificado", `Perfil ${analysis.profileType || "N/A"}`],
        ["Sindicância Recomendada", (analysis.profileType === 'A' || analysis.profileType === 'B') ? "SIM - RECOMENDADA" : "NÃO RECOMENDADA"],
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
      
      const ptsString = Array.isArray(analysis.sindicanciaPoints || [])
        ? (analysis.sindicanciaPoints || []).join("\n- ")
        : String(analysis.sindicanciaPoints || "N/A");
      const points = doc.splitTextToSize("- " + ptsString, pageWidth - 28);
      doc.text(points, 14, currentY);
      currentY += (points.length * 5) + 10;

      doc.setFont("times", "bold");
      doc.text("PARECER FINAL:", 14, currentY);
      currentY += 6;
      doc.setFont("times", "italic");
      const finalVerdict = doc.splitTextToSize(analysis.finalParecer || "N/A", pageWidth - 28);
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
      ["Data de Nascimento", formatBirthDate(lead.birthDate)],
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

  const renderTextBlockEditor = (label: string, valueObj: any, onChangeText: (txt: string) => void, onChangeAlign: (align: any) => void) => {
    const currentAlign = valueObj?.align || 'left';
    return (
      <div className="space-y-2 bg-white/35 border border-[#0b1d3a]/5 p-4 rounded-2xl shadow-sm text-left">
        <div className="flex justify-between items-center">
          <label className="text-[10px] uppercase font-black tracking-widest text-[#0b1d3a]">{label}</label>
          <span className="flex items-center gap-1.5 bg-white/60 p-0.5 rounded-lg border border-[#0b1d3a]/10 shadow-sm">
            <button
              type="button"
              onClick={() => onChangeAlign('left')}
              className={`p-1 rounded-md transition-all ${
                currentAlign === 'left'
                  ? 'bg-[#0b1d3a] text-[#f4efe2] shadow-sm'
                  : 'text-[#0b1d3a]/60 hover:text-[#0b1d3a] hover:bg-[#0b1d3a]/5'
              }`}
              title="Esquerda"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChangeAlign('center')}
              className={`p-1 rounded-md transition-all ${
                currentAlign === 'center'
                  ? 'bg-[#0b1d3a] text-[#f4efe2] shadow-sm'
                  : 'text-[#0b1d3a]/60 hover:text-[#0b1d3a] hover:bg-[#0b1d3a]/5'
              }`}
              title="Centralizado"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChangeAlign('right')}
              className={`p-1 rounded-md transition-all ${
                currentAlign === 'right'
                  ? 'bg-[#0b1d3a] text-[#f4efe2] shadow-sm'
                  : 'text-[#0b1d3a]/60 hover:text-[#0b1d3a] hover:bg-[#0b1d3a]/5'
              }`}
              title="Direita"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChangeAlign('justify')}
              className={`p-1 rounded-md transition-all ${
                currentAlign === 'justify'
                  ? 'bg-[#0b1d3a] text-[#f4efe2] shadow-sm'
                  : 'text-[#0b1d3a]/60 hover:text-[#0b1d3a] hover:bg-[#0b1d3a]/5'
              }`}
              title="Justificado"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
          </span>
        </div>
        <textarea
          className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-3 text-[#0b1d3a] text-sm focus:border-[#c5a059]/50 outline-none shadow-inner animate-none"
          rows={2}
          value={valueObj?.text || ''}
          onChange={(e) => onChangeText(e.target.value)}
        />
      </div>
    );
  };

  const renderImageEditor = (label: string, fieldPath: string, imageUrl: string, sectionId?: string) => {
    return (
      <div className="space-y-3 bg-white/35 border border-[#0b1d3a]/5 p-4 rounded-2xl shadow-sm text-left">
        <label className="block text-[10px] uppercase font-black tracking-widest text-[#0b1d3a]">{label}</label>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <input
            type="text"
            className="flex-1 w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-2.5 text-xs text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
            placeholder="URL da Imagem..."
            value={imageUrl || ''}
            onChange={(e) => {
              const urlVal = e.target.value;
              setTempHomeContent((prev: any) => {
                if (!prev) return prev;
                const updated = { ...prev };
                if (sectionId) {
                  updated.dynamicSections = (updated.dynamicSections || []).map((sec: any) => 
                    sec.id === sectionId ? { ...sec, image: urlVal } : sec
                  );
                } else {
                  const parts = fieldPath.split('.');
                  if (parts.length === 2) {
                    updated[parts[0]] = { ...updated[parts[0]], [parts[1]]: urlVal };
                  }
                }
                return updated;
              });
            }}
          />
          <div className="relative">
            <button className="flex items-center gap-2 px-3 py-2 bg-[#0b1d3a] hover:bg-[#c5a059] text-white text-[10px] font-black uppercase rounded-xl transition-all shadow pointer-events-none">
              <Upload className="w-3.5 h-3.5" /> Enviar
            </button>
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleHomeImageUpload(fieldPath, file, sectionId);
              }}
            />
          </div>
        </div>
        {uploadingHomeImages[fieldPath] && (
          <p className="text-[10px] text-[#c5a059] font-bold animate-pulse">Enviando imagem, aguarde...</p>
        )}
        {imageUrl && (
          <div className="mt-2 w-full max-w-[200px] h-20 rounded-xl overflow-hidden border border-[#0b1d3a]/10 bg-black/5 shadow-inner">
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    );
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

        <div className="lg:grid lg:grid-cols-[280px_1fr] gap-10 items-start w-full">
          <aside className="lg:sticky lg:top-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-col gap-2 mb-6 lg:mb-0 w-full min-w-0">
            <button 
              onClick={() => { setActiveTab('leads'); setContentSubTab(null); }}
              className={`flex items-center gap-3 w-full px-4 py-3 lg:px-6 lg:py-4 rounded-2xl font-bold uppercase tracking-widest text-[9px] lg:text-[10px] transition-all justify-center lg:justify-start ${activeTab === 'leads' ? 'bg-[#0b1d3a] text-[#f4efe2] shadow-xl' : 'bg-white/40 text-[#0b1d3a]/50 hover:bg-white/60 hover:text-[#0b1d3a] border border-[#0b1d3a]/5'}`}
            >
              <Users className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
              <span className="truncate">Candidatos ({leads.length})</span>
            </button>
            <button 
              onClick={() => { setActiveTab('content'); setContentSubTab(null); }}
              className={`flex items-center gap-3 w-full px-4 py-3 lg:px-6 lg:py-4 rounded-2xl font-bold uppercase tracking-widest text-[9px] lg:text-[10px] transition-all justify-center lg:justify-start ${activeTab === 'content' ? 'bg-[#0b1d3a] text-[#f4efe2] shadow-xl' : 'bg-white/40 text-[#0b1d3a]/50 hover:bg-white/60 hover:text-[#0b1d3a] border border-[#0b1d3a]/5'}`}
            >
              <FileText className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
              <span className="truncate">Editar Site</span>
            </button>
            <button 
              onClick={() => { setActiveTab('events'); setContentSubTab(null); }}
              className={`flex items-center gap-3 w-full px-4 py-3 lg:px-6 lg:py-4 rounded-2xl font-bold uppercase tracking-widest text-[9px] lg:text-[10px] transition-all justify-center lg:justify-start ${activeTab === 'events' ? 'bg-[#0b1d3a] text-[#f4efe2] shadow-xl' : 'bg-white/40 text-[#0b1d3a]/50 hover:bg-white/60 hover:text-[#0b1d3a] border border-[#0b1d3a]/5'}`}
            >
              <RefreshCw className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
              <span className="truncate">Eventos ({editContent.events?.length || 0})</span>
            </button>
            <button 
              onClick={() => { setActiveTab('library'); setContentSubTab(null); }}
              className={`flex items-center gap-3 w-full px-4 py-3 lg:px-6 lg:py-4 rounded-2xl font-bold uppercase tracking-widest text-[9px] lg:text-[10px] transition-all justify-center lg:justify-start ${activeTab === 'library' ? 'bg-[#0b1d3a] text-[#f4efe2] shadow-xl' : 'bg-white/40 text-[#0b1d3a]/50 hover:bg-white/60 hover:text-[#0b1d3a] border border-[#0b1d3a]/5'}`}
            >
              <Book className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
              <span className="truncate">Biblioteca ({libraryItems.length})</span>
            </button>
            <button 
              onClick={() => { setActiveTab('members'); setContentSubTab(null); }}
              className={`flex items-center gap-3 w-full px-4 py-3 lg:px-6 lg:py-4 rounded-2xl font-bold uppercase tracking-widest text-[9px] lg:text-[10px] transition-all justify-center lg:justify-start ${activeTab === 'members' ? 'bg-[#0b1d3a] text-[#f4efe2] shadow-xl' : 'bg-white/40 text-[#0b1d3a]/50 hover:bg-white/60 hover:text-[#0b1d3a] border border-[#0b1d3a]/5'}`}
            >
              <ShieldCheck className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
              <span className="truncate">Membros/Convites ({registeredUsers.length + invitations.filter(i => i.status === 'PENDING').length})</span>
              {membershipRequests.filter(r => r.status === 'PENDING' && r.type !== 'UNAUTHORIZED_ATTEMPT').length > 0 && (
                <span className="ml-2 bg-[#c5a059] text-[#0b1d3a] text-[8px] px-1.5 py-0.5 rounded-full animate-pulse shrink-0">
                  +{membershipRequests.filter(r => r.status === 'PENDING' && r.type !== 'UNAUTHORIZED_ATTEMPT').length}
                </span>
              )}
            </button>

            {isMasterAdmin && (
              <button 
                onClick={() => { setActiveTab('permissions'); setContentSubTab(null); }}
                className={`flex items-center gap-3 w-full px-4 py-3 lg:px-6 lg:py-4 rounded-2xl font-bold uppercase tracking-widest text-[9px] lg:text-[10px] transition-all justify-center lg:justify-start ${activeTab === 'permissions' ? 'bg-[#0b1d3a] text-[#f4efe2] shadow-xl' : 'bg-white/40 text-[#0b1d3a]/50 hover:bg-white/60 hover:text-[#0b1d3a] border border-[#0b1d3a]/5'}`}
              >
                <Sliders className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                <span className="truncate">Equipe Admin</span>
              </button>
            )}

            <div className="hidden lg:block mt-8 p-8 bg-[#c5a059]/10 border border-[#c5a059]/20 rounded-[2.5rem] text-center backdrop-blur-sm">
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
            <div className="space-y-6 w-full max-w-full">
              {/* Tab Navigation for Candidates */}
              <div className="flex border-b border-[#0b1d3a]/10 pb-1 max-w-full overflow-x-auto gap-4 custom-scrollbar scrollbar-none">
                <button
                  onClick={() => setLeadsSubTab('new')}
                  className={`pb-3 text-xs uppercase font-black tracking-widest border-b-2 transition-all shrink-0 ${
                    leadsSubTab === 'new'
                      ? 'border-[#c5a059] text-[#0b1d3a]'
                      : 'border-transparent text-[#0b1d3a]/50 hover:text-[#0b1d3a]'
                  }`}
                >
                  Novas Propostas ({leads.filter(l => getLeadStatusType(l) === 'new').length})
                </button>
                <button
                  onClick={() => setLeadsSubTab('sindicancia')}
                  className={`pb-3 text-xs uppercase font-black tracking-widest border-b-2 transition-all shrink-0 ${
                    leadsSubTab === 'sindicancia'
                      ? 'border-[#c5a059] text-[#0b1d3a]'
                      : 'border-transparent text-[#0b1d3a]/50 hover:text-[#0b1d3a]'
                  }`}
                >
                  Em Sindicância ({leads.filter(l => getLeadStatusType(l) === 'sindicancia').length})
                </button>
                <button
                  onClick={() => setLeadsSubTab('archived')}
                  className={`pb-3 text-xs uppercase font-black tracking-widest border-b-2 transition-all shrink-0 ${
                    leadsSubTab === 'archived'
                      ? 'border-[#c5a059] text-[#0b1d3a]'
                      : 'border-transparent text-[#0b1d3a]/50 hover:text-[#0b1d3a]'
                  }`}
                >
                  Arquivados ({leads.filter(l => getLeadStatusType(l) === 'archived').length})
                </button>
              </div>

              {leads.filter(lead => getLeadStatusType(lead) === leadsSubTab).length === 0 ? (
                <p className="text-center text-[#0b1d3a]/30 py-12 italic bg-white/20 rounded-2xl w-full">Nenhum candidato nesta etapa no momento.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 w-full">
                  {leads.filter(lead => getLeadStatusType(lead) === leadsSubTab).map(lead => (
                      <div key={lead.id} className="bg-white/40 p-3 sm:p-6 rounded-2xl border border-[#0b1d3a]/5 hover:border-[#c5a059]/30 transition-all shadow-sm w-full min-w-0">
                        
                        {/* Compact Header for Leads cards */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button 
                              onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                              className="p-2 hover:bg-[#0b1d3a]/5 rounded-xl text-[#0b1d3a]/40 hover:text-[#0b1d3a] shrink-0"
                            >
                              {expandedLead === lead.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                            <div className="min-w-0 flex-1 sm:flex-initial">
                              <h3 className="text-lg md:text-xl font-bold text-[#0b1d3a] leading-tight truncate">{lead.fullName || lead.name}</h3>
                              <p className="text-[#0b1d3a]/60 text-xs mt-1 block sm:inline truncate">{lead.email}</p>
                              {lead.phone && <span className="text-[#c5a059] font-bold text-xs sm:ml-2 sm:pl-2 sm:border-l border-[#0b1d3a]/10">{lead.phone}</span>}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#0b1d3a]/5 shrink-0">
                            <span className="text-[9px] text-[#0b1d3a]/40 font-mono">
                              {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleString() : 'Recém-enviado'}
                            </span>
                            
                            <div className="flex flex-wrap items-center gap-2">
                              {/* STATUS BADGE */}
                              {getLeadStatusBadge(lead)}
                              
                              {/* ANALYZED STATUS BADGE */}
                              {(lead.analysisReport || analysisReports[lead.id]) && (
                                <span className="bg-green-500/10 text-green-600 text-[8px] px-2.5 py-1 rounded-full border border-green-500/20 uppercase font-black tracking-widest whitespace-nowrap">
                                  Análise AI Gerada
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
                                <div className="space-y-6 mt-6 pt-6 border-t border-[#0b1d3a]/5">
                                  
                                  {/* WORKFLOW STATUS CONTROL BAR */}
                                  <div className="p-3 sm:p-4 bg-white/60 border border-[#0b1d3a]/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-center sm:text-left">
                                      <p className="text-[8px] uppercase tracking-wider font-semibold text-[#0b1d3a]/40">Status do Fluxo:</p>
                                      <p className="text-xs font-bold text-[#0b1d3a]">{lead.status || "Proposta Recebida"}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                      {getLeadStatusType(lead) !== 'sindicancia' && (
                                        <button
                                          onClick={() => handleUpdateLeadStatus(lead.id, "Em Sindicância Formal")}
                                          className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-[#f4efe2] text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                                        >
                                          <ShieldCheck className="w-3.5 h-3.5" /> Avançar para Sindicância
                                        </button>
                                      )}
                                      {getLeadStatusType(lead) !== 'archived' && (
                                        <button
                                          onClick={() => handleUpdateLeadStatus(lead.id, "Proposta Arquivada")}
                                          className="flex-1 sm:flex-none px-4 py-2 bg-red-600/10 border border-red-600/30 hover:bg-red-600 hover:text-white text-red-600 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                                        >
                                          <Archive className="w-3.5 h-3.5" /> Arquivar Proposta
                                        </button>
                                      )}
                                      {getLeadStatusType(lead) !== 'new' && (
                                        <button
                                          onClick={() => handleUpdateLeadStatus(lead.id, "Proposta Recebida")}
                                          className="flex-1 sm:flex-none px-4 py-2 bg-[#0b1d3a]/10 border border-[#0b1d3a]/20 text-[#0b1d3a] text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                                        >
                                          <RefreshCw className="w-3.5 h-3.5" /> Reabrir / Voltar para Recebidas
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                                    <div className="space-y-6">
                                      <h4 className="text-[#0b1d3a] text-[10px] uppercase font-bold tracking-[0.2em] border-b border-[#0b1d3a]/10 pb-1 flex items-center gap-2 font-bold">
                                        <Brain className="w-3 h-3 text-[#c5a059]" /> Parecer do Consultor AI
                                      </h4>
                                      
                                      {(lead.analysisReport || analysisReports[lead.id]) ? (
                                        <div className="space-y-4">
                                          <div className="bg-white/80 p-3 sm:p-6 rounded-2xl border border-[#0b1d3a]/10 text-sm font-serif leading-relaxed h-[400px] overflow-y-auto custom-scrollbar shadow-inner">
                                            {renderAnalysisReport(analysisReports[lead.id] || lead.analysisReport)}
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
                                      <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                                        <div>
                                          <p className="text-[#0b1d3a]/40 uppercase font-black text-[9px]">Nome:</p>
                                          <p className="text-[#0b1d3a] font-bold">{lead.fullName || lead.name || "-"}</p>
                                        </div>
                                        <div>
                                          <p className="text-[#0b1d3a]/40 uppercase font-black text-[9px]">Data de Nascimento:</p>
                                          <p className="text-[#0b1d3a] font-bold">{formatBirthDate(lead.birthDate)}</p>
                                        </div>
                                        <div>
                                          <p className="text-[#0b1d3a]/40 uppercase font-black text-[9px]">Profissão:</p>
                                          <p className="text-[#0b1d3a] font-bold">{lead.profession || "-"}</p>
                                        </div>
                                        <div>
                                          <p className="text-[#0b1d3a]/40 uppercase font-black text-[9px]">Escolaridade:</p>
                                          <p className="text-[#0b1d3a] font-bold">{lead.education || "-"}</p>
                                        </div>
                                        <div>
                                          <p className="text-[#0b1d3a]/40 uppercase font-black text-[9px]">Crença:</p>
                                          <p className="text-[#0b1d3a] font-bold">{lead.faith || "-"}</p>
                                        </div>
                                        <div>
                                          <p className="text-[#0b1d3a]/40 uppercase font-black text-[9px]">Cidade:</p>
                                          <p className="text-[#0b1d3a] font-bold">{lead.city || "-"}</p>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-6">
                                      <h4 className="text-[#0b1d3a] text-[10px] uppercase font-bold tracking-[0.2em] border-b border-[#0b1d3a]/10 pb-1 font-bold">Perfil e Respostas</h4>
                                      <div className="grid grid-cols-2 gap-4 text-xs mb-6 font-sans">
                                        <div>
                                          <p className="text-[#0b1d3a]/40 uppercase font-black text-[9px]">Estado Civil:</p>
                                          <p className="text-[#0b1d3a] font-bold">{lead.civilStatus}</p>
                                        </div>
                                        <div>
                                          <p className="text-[#0b1d3a]/40 uppercase font-black text-[9px]">Filhos:</p>
                                          <p className="text-[#0b1d3a] font-bold">{lead.childrenCount || "Nenhum"}</p>
                                        </div>
                                        <div>
                                          <p className="text-[#0b1d3a]/40 uppercase font-black text-[9px]">Profissão:</p>
                                          <p className="text-[#0b1d3a] font-bold">{lead.profession}</p>
                                        </div>
                                        <div>
                                          <p className="text-[#0b1d3a]/40 uppercase font-black text-[9px]">Renda:</p>
                                          <p className="text-[#0b1d3a] font-bold">{lead.income}</p>
                                        </div>
                                      </div>

                                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                        <div className="bg-white/80 p-3 sm:p-4 rounded-xl shadow-sm border border-[#0b1d3a]/5">
                                          <p className="text-[10px] text-[#0b1d3a] uppercase font-black mb-2 font-bold">Motivação</p>
                                          <p className="text-xs text-[#0b1d3a]/80 italic">"{lead.motivation}"</p>
                                        </div>
                                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => lead[`q${num}`] ? (
                                          <div key={num} className="bg-white/80 p-3 sm:p-4 rounded-xl shadow-sm border border-[#0b1d3a]/5">
                                            <p className="text-[10px] text-[#0b1d3a] uppercase font-black mb-2 font-bold">Questão {num}</p>
                                            <p className="text-xs text-[#0b1d3a]/80">{lead[`q${num}`]}</p>
                                          </div>
                                        ) : null)}
                                      </div>
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
                    onClick={() => setContentSubTab('home')}
                    className="group bg-white/40 border border-[#0b1d3a]/5 p-8 rounded-[2.5rem] text-left hover:border-[#c5a059]/40 transition-all hover:bg-white/80 shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059] mb-6 group-hover:scale-110 transition-transform">
                      <LayoutDashboard className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#0b1d3a] mb-2 uppercase tracking-wider">Gerenciar <span className="text-[#c5a059]">Home</span></h3>
                    <p className="text-[#0b1d3a]/40 text-[10px] uppercase tracking-widest font-black">Boas-Vindas, Banner Principal, Alinhamentos e Seções Dinâmicas</p>
                  </button>

                  <button 
                    onClick={() => setContentSubTab('about')}
                    className="group bg-white/40 border border-[#0b1d3a]/5 p-8 rounded-[2.5rem] text-left hover:border-[#c5a059]/40 transition-all hover:bg-white/80 shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059] mb-6 group-hover:scale-110 transition-transform">
                      <History className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#0b1d3a] mb-2 uppercase tracking-wider">Gerenciar <span className="text-[#c5a059]">Sobre Nós</span></h3>
                    <p className="text-[#0b1d3a]/40 text-[10px] uppercase tracking-widest font-black">Nossa História, Tríade Maçônica, Linha do Tempo e Fotos Dinâmicas</p>
                  </button>

                  <button 
                    onClick={() => setContentSubTab('filantropia')}
                    className="group bg-white/40 border border-[#0b1d3a]/5 p-8 rounded-[2.5rem] text-left hover:border-[#c5a059]/40 transition-all hover:bg-white/80 shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059] mb-6 group-hover:scale-110 transition-transform">
                      <HandHeart className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#0b1d3a] mb-2 uppercase tracking-wider">Gerenciar <span className="text-[#c5a059]">Ações Sociais</span></h3>
                    <p className="text-[#0b1d3a]/40 text-[10px] uppercase tracking-widest font-black">Filantropia, Campanhas, Projetos, Galeria de Fotos e Alinhamentos</p>
                  </button>

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
                    <h3 className="font-serif text-2xl font-bold text-[#0b1d3a] mb-2 uppercase tracking-wider">Gerenciar Família / <span className="text-pink-500">Paramaçônicas</span></h3>
                    <p className="text-[#0b1d3a]/40 text-[10px] uppercase tracking-widest font-black">Fraternidade de Cunhadas e Grupos Paramaçônicos Juvenis</p>
                  </button>

                  <button 
                    onClick={() => setContentSubTab('social')}
                    className="group bg-white/40 border border-[#0b1d3a]/5 p-8 rounded-[2.5rem] text-left hover:border-[#c5a059]/40 transition-all hover:bg-white/80 shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059] mb-6 group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#0b1d3a] mb-2 uppercase tracking-wider">Gerenciar <span className="text-[#c5a059]">Galeria de Fotos</span></h3>
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
                    {contentSubTab === 'home' && tempHomeContent && (
                      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                        {/* Header and Live Save Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[#0b1d3a]/10 gap-4">
                          <div>
                            <h3 className="font-serif text-2xl font-bold text-[#0b1d3a] uppercase tracking-wider">Gerenciar Home</h3>
                            <p className="text-[10px] text-[#0b1d3a]/50 uppercase tracking-widest font-black">Configure textos, alinhamentos, imagens e seções dinâmicas da página inicial pública</p>
                          </div>
                          <button
                            onClick={async () => {
                              setIsSavingHome(true);
                              try {
                                await updateHomeContent(tempHomeContent);
                                setShowSaveSuccess(true);
                              } catch (err) {
                                console.error("Error saving Home content:", err);
                              } finally {
                                setIsSavingHome(false);
                              }
                            }}
                            disabled={isSavingHome}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#0b1d3a] hover:bg-[#c5a059] text-white text-xs rounded-xl font-black uppercase transition-all shadow-lg hover:shadow-xl hover:-translate-y-px"
                          >
                            {isSavingHome ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSavingHome ? 'Salvando...' : 'Salvar Alterações'}
                          </button>
                        </div>

                        {/* Welcoming Banner Section */}
                        <div className="space-y-6">
                          <h3 className="font-serif text-xl border-l-4 border-[#c5a059] pl-4 uppercase tracking-widest font-bold text-[#0b1d3a]">Banner de Boas-Vindas (Bem-vindo)</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              {renderTextBlockEditor(
                                "Título de Boas-Vindas",
                                tempHomeContent.welcomeBanner?.title,
                                (txt) => setTempHomeContent((prev: any) => ({
                                  ...prev,
                                  welcomeBanner: { ...prev.welcomeBanner, title: { ...prev.welcomeBanner.title, text: txt } }
                                })),
                                (aln) => setTempHomeContent((prev: any) => ({
                                  ...prev,
                                  welcomeBanner: { ...prev.welcomeBanner, title: { ...prev.welcomeBanner.title, align: aln } }
                                }))
                              )}

                              {renderTextBlockEditor(
                                "Subtítulo de Boas-Vindas",
                                tempHomeContent.welcomeBanner?.subTitle,
                                (txt) => setTempHomeContent((prev: any) => ({
                                  ...prev,
                                  welcomeBanner: { ...prev.welcomeBanner, subTitle: { ...prev.welcomeBanner.subTitle, text: txt } }
                                })),
                                (aln) => setTempHomeContent((prev: any) => ({
                                  ...prev,
                                  welcomeBanner: { ...prev.welcomeBanner, subTitle: { ...prev.welcomeBanner.subTitle, align: aln } }
                                }))
                              )}
                            </div>

                            <div>
                              {renderImageEditor(
                                "Imagem de Fundo - Banner Boas-Vindas (URL ou File)",
                                "welcomeBanner.backgroundImage",
                                tempHomeContent.welcomeBanner?.backgroundImage
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Hero Section */}
                        <div className="space-y-6 pt-6 border-t border-[#0b1d3a]/5">
                          <h3 className="font-serif text-xl border-l-4 border-[#c5a059] pl-4 uppercase tracking-widest font-bold text-[#0b1d3a]">Banner Principal (Hero)</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              {renderTextBlockEditor(
                                "Título Principal (Hero)",
                                tempHomeContent.hero?.title,
                                (txt) => setTempHomeContent((prev: any) => ({
                                  ...prev,
                                  hero: { ...prev.hero, title: { ...prev.hero.title, text: txt } }
                                })),
                                (aln) => setTempHomeContent((prev: any) => ({
                                  ...prev,
                                  hero: { ...prev.hero, title: { ...prev.hero.title, align: aln } }
                                }))
                              )}

                              {renderTextBlockEditor(
                                "Linha de Topo (Sub-título Hero)",
                                tempHomeContent.hero?.subTitle,
                                (txt) => setTempHomeContent((prev: any) => ({
                                  ...prev,
                                  hero: { ...prev.hero, subTitle: { ...prev.hero.subTitle, text: txt } }
                                })),
                                (aln) => setTempHomeContent((prev: any) => ({
                                  ...prev,
                                  hero: { ...prev.hero, subTitle: { ...prev.hero.subTitle, align: aln } }
                                }))
                              )}

                              {renderTextBlockEditor(
                                "Tagline / Descrição Principal",
                                tempHomeContent.hero?.tagline,
                                (txt) => setTempHomeContent((prev: any) => ({
                                  ...prev,
                                  hero: { ...prev.hero, tagline: { ...prev.hero.tagline, text: txt } }
                                })),
                                (aln) => setTempHomeContent((prev: any) => ({
                                  ...prev,
                                  hero: { ...prev.hero, tagline: { ...prev.hero.tagline, align: aln } }
                                }))
                              )}
                            </div>

                            <div>
                              {renderImageEditor(
                                "Imagem de Fundo - Hero",
                                "hero.backgroundImage",
                                tempHomeContent.hero?.backgroundImage
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Dynamic HTML Sections */}
                        <div className="space-y-6 pt-6 border-t border-[#0b1d3a]/5">
                          <div className="flex justify-between items-center bg-white/40 p-4 rounded-2xl border border-[#0b1d3a]/5 shadow-sm">
                            <div>
                              <h3 className="font-serif text-lg font-bold text-[#0b1d3a] uppercase tracking-wider">Seções Dinâmicas de Texto</h3>
                              <p className="text-[10px] text-[#0b1d3a]/50 uppercase font-bold tracking-wider">Adicione novos carrosséis de imagens ou seções explicativas</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newSec = {
                                  id: String(Date.now()),
                                  title: { text: 'Nova Seção Dinâmica', align: 'left' },
                                  description: { text: 'Substitua este texto pelo conteúdo desejado...', align: 'left' },
                                  image: ''
                                };
                                setTempHomeContent((prev: any) => ({
                                  ...prev,
                                  dynamicSections: [...(prev.dynamicSections || []), newSec]
                                }));
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-[#0b1d3a] hover:bg-[#c5a059] text-white text-xs font-black uppercase rounded-xl transition-all shadow-md hover:-translate-y-px"
                            >
                              <Plus className="w-4 h-4" /> Adicionar Nova Seção
                            </button>
                          </div>

                          {(!tempHomeContent.dynamicSections || tempHomeContent.dynamicSections.length === 0) ? (
                            <div className="text-center py-12 bg-white/20 rounded-3xl border border-dashed border-[#0b1d3a]/10">
                              <p className="text-sm text-[#0b1d3a]/40 italic">Nenhuma seção dinâmica de texto adicionada ainda.</p>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {tempHomeContent.dynamicSections.map((section: any, index: number) => (
                                <div key={section.id} className="border border-[#0b1d3a]/10 p-6 rounded-[2.5rem] bg-white/40 relative space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm('Tem certeza que deseja excluir esta seção dinâmica?')) {
                                        setTempHomeContent((prev: any) => ({
                                          ...prev,
                                          dynamicSections: prev.dynamicSections.filter((sec: any) => sec.id !== section.id)
                                        }));
                                      }
                                    }}
                                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-all border border-red-200"
                                    title="Excluir seção"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                  
                                  <h4 className="font-serif text-sm font-bold text-[#0b1d3a] uppercase tracking-wider border-b border-[#0b1d3a]/5 pb-2 text-left">Seção Dinâmica #{index + 1}</h4>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      {renderTextBlockEditor(
                                        "Título da Seção", 
                                        section.title, 
                                        (txt) => {
                                          setTempHomeContent((prev: any) => ({
                                            ...prev,
                                            dynamicSections: prev.dynamicSections.map((s: any) => s.id === section.id ? { ...s, title: { ...s.title, text: txt } } : s)
                                          }));
                                        },
                                        (aln) => {
                                          setTempHomeContent((prev: any) => ({
                                            ...prev,
                                            dynamicSections: prev.dynamicSections.map((s: any) => s.id === section.id ? { ...s, title: { ...s.title, align: aln } } : s)
                                          }));
                                        }
                                      )}
                                      
                                      {renderTextBlockEditor(
                                        "Descrição / Texto", 
                                        section.description, 
                                        (txt) => {
                                          setTempHomeContent((prev: any) => ({
                                            ...prev,
                                            dynamicSections: prev.dynamicSections.map((s: any) => s.id === section.id ? { ...s, description: { ...s.description, text: txt } } : s)
                                          }));
                                        },
                                        (aln) => {
                                          setTempHomeContent((prev: any) => ({
                                            ...prev,
                                            dynamicSections: prev.dynamicSections.map((s: any) => s.id === section.id ? { ...s, description: { ...s.description, align: aln } } : s)
                                          }));
                                        }
                                      )}
                                    </div>
                                    
                                    <div>
                                      {renderImageEditor("Imagem da Seção", `dynamicImage_${section.id}`, section.image, section.id)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {contentSubTab === 'about' && tempAboutContent && (
                      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300 text-left">
                        {/* Header and Live Save Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[#0b1d3a]/10 gap-4">
                          <div>
                            <h3 className="font-serif text-2xl font-bold text-[#0b1d3a] uppercase tracking-wider">Gerenciar Sobre Nós</h3>
                            <p className="text-[10px] text-[#0b1d3a]/50 uppercase tracking-widest font-black">Gerencie Nossa História, Missão, Visão, Valores, Linha do Tempo e Fotos Dinâmicas</p>
                          </div>
                          <button
                            onClick={async () => {
                              setIsSavingAbout(true);
                              try {
                                await updateAboutContent(tempAboutContent);
                                setShowSaveSuccess(true);
                              } catch (err) {
                                console.error("Error saving About content:", err);
                              } finally {
                                setIsSavingAbout(false);
                              }
                            }}
                            disabled={isSavingAbout}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#0b1d3a] hover:bg-[#c5a059] text-white text-xs rounded-xl font-black uppercase transition-all shadow-lg hover:shadow-xl hover:-translate-y-px"
                          >
                            {isSavingAbout ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSavingAbout ? 'Salvando...' : 'Salvar Alterações'}
                          </button>
                        </div>

                        {/* Nossa História Editor */}
                        <div className="bg-white/40 p-8 rounded-3xl border border-[#0b1d3a]/5 space-y-6">
                          <h3 className="font-serif text-xl border-l-4 border-[#c5a059] pl-4 uppercase tracking-widest font-bold text-[#0b1d3a]">Nossa História</h3>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              {renderTextBlockEditor(
                                "Pequeno Título (Tagline)",
                                tempAboutContent.smallTitle,
                                (txt) => setTempAboutContent((prev: any) => ({ ...prev, smallTitle: { ...prev.smallTitle, text: txt } })),
                                (aln) => setTempAboutContent((prev: any) => ({ ...prev, smallTitle: { ...prev.smallTitle, align: aln } }))
                              )}

                              {renderTextBlockEditor(
                                "Título Principal",
                                tempAboutContent.title,
                                (txt) => setTempAboutContent((prev: any) => ({ ...prev, title: { ...prev.title, text: txt } })),
                                (aln) => setTempAboutContent((prev: any) => ({ ...prev, title: { ...prev.title, align: aln } }))
                              )}

                              {renderTextBlockEditor(
                                "Subtítulo (Destaque)",
                                tempAboutContent.subTitle,
                                (txt) => setTempAboutContent((prev: any) => ({ ...prev, subTitle: { ...prev.subTitle, text: txt } })),
                                (aln) => setTempAboutContent((prev: any) => ({ ...prev, subTitle: { ...prev.subTitle, align: aln } }))
                              )}
                            </div>

                            <div className="space-y-4">
                              {renderTextBlockEditor(
                                "Memorial Descritivo (Texto Completo)",
                                tempAboutContent.text,
                                (txt) => setTempAboutContent((prev: any) => ({ ...prev, text: { ...prev.text, text: txt } })),
                                (aln) => setTempAboutContent((prev: any) => ({ ...prev, text: { ...prev.text, align: aln } }))
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Nossa História Imagens Editor */}
                        <div className="bg-white/40 p-8 rounded-3xl border border-[#0b1d3a]/5 space-y-6">
                          <div className="flex justify-between items-center pb-2 border-b border-[#0b1d3a]/10">
                            <div>
                              <h3 className="font-serif text-xl border-l-4 border-[#c5a059] pl-4 uppercase tracking-widest font-bold text-[#0b1d3a]">Fotos Ilustrativas (História)</h3>
                              <p className="text-[9px] text-[#0b1d3a]/50 uppercase tracking-widest ml-4 font-black">Insira links ou carregue fotos para ilustrar a aba Sobre Nós</p>
                            </div>
                            <button
                              onClick={() => {
                                setTempAboutContent((prev: any) => ({
                                  ...prev,
                                  images: [...(prev.images || []), ""]
                                }));
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-[#0b1d3a] hover:bg-[#c5a059] text-white text-[9px] uppercase tracking-wider font-extrabold rounded-lg transition-all"
                            >
                              <Plus className="w-3 h-3" /> Adicionar Foto
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(tempAboutContent.images || []).map((imgUrl: string, idx: number) => (
                              <div key={idx} className="relative bg-white/60 p-4 rounded-2xl border border-dashed border-[#0b1d3a]/10 space-y-3">
                                <div className="absolute top-2 right-2 z-10">
                                  <button
                                    onClick={() => {
                                      setTempAboutContent((prev: any) => ({
                                        ...prev,
                                        images: (prev.images || []).filter((_: any, i: number) => i !== idx)
                                      }));
                                    }}
                                    className="p-1 px-2 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase rounded transition-all shadow"
                                  >
                                    X
                                  </button>
                                </div>
                                {renderAboutImageEditor(`Foto #${idx + 1}`, `images`, imgUrl, idx)}
                              </div>
                            ))}
                            {(tempAboutContent.images || []).length === 0 && (
                              <div className="col-span-full text-center py-6 text-xs text-[#0b1d3a]/40 font-bold bg-[#0b1d3a]/5 rounded-2xl border border-dashed border-[#0b1d3a]/10">
                                Nenhuma foto ilustrativa configurada. Será renderizada a moldura padrão "2009".
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Missão, Visão e Valores Editor */}
                        <div className="bg-white/40 p-8 rounded-3xl border border-[#0b1d3a]/5 space-y-6">
                          <h3 className="font-serif text-xl border-l-4 border-[#c5a059] pl-4 uppercase tracking-widest font-bold text-[#0b1d3a]">Tríade da Oficina (Missão, Visão e Valores)</h3>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              {renderTextBlockEditor(
                                "Definição de Missão",
                                tempAboutContent.mission,
                                (txt) => setTempAboutContent((prev: any) => ({ ...prev, mission: { ...prev.mission, text: txt } })),
                                (aln) => setTempAboutContent((prev: any) => ({ ...prev, mission: { ...prev.mission, align: aln } }))
                              )}

                              {renderTextBlockEditor(
                                "Definição de Visão",
                                tempAboutContent.vision,
                                (txt) => setTempAboutContent((prev: any) => ({ ...prev, vision: { ...prev.vision, text: txt } })),
                                (aln) => setTempAboutContent((prev: any) => ({ ...prev, vision: { ...prev.vision, align: aln } }))
                              )}
                            </div>

                            <div className="space-y-4 bg-white/30 p-6 rounded-2xl border border-[#0b1d3a]/5">
                              <div className="flex justify-between items-center pb-2 border-b border-[#0b1d3a]/10">
                                <label className="block text-[10px] uppercase font-black tracking-widest text-[#0b1d3a]">Nossos Valores Maçônicos</label>
                                <button
                                  type="button"
                                  className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0b1d3a] hover:bg-[#c5a059] text-[#f4efe2] text-[8px] uppercase tracking-wider font-extrabold rounded"
                                  onClick={() => {
                                    setTempAboutContent((prev: any) => ({
                                      ...prev,
                                      values: [...(prev.values || []), "Novo Valor"]
                                    }));
                                  }}
                                >
                                  <Plus className="w-3 h-3" /> Adicionar
                                </button>
                              </div>

                              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 pt-2">
                                {(tempAboutContent.values || []).map((val: string, index: number) => (
                                  <div key={index} className="flex gap-2 items-center bg-white/50 p-2.5 rounded-xl border border-[#0b1d3a]/5">
                                    <input
                                      type="text"
                                      className="flex-1 bg-white border border-[#0b1d3a]/10 rounded-lg p-1.5 text-xs text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
                                      value={val}
                                      onChange={(e) => {
                                        const newVal = e.target.value;
                                        setTempAboutContent((prev: any) => {
                                          const nextVals = [...prev.values];
                                          nextVals[index] = newVal;
                                          return { ...prev, values: nextVals };
                                        });
                                      }}
                                    />
                                    <button
                                      type="button"
                                      className="p-1 px-2.5 bg-red-105 hover:bg-red-200 text-red-600 rounded-lg text-xs font-bold"
                                      onClick={() => {
                                        setTempAboutContent((prev: any) => ({
                                          ...prev,
                                          values: prev.values.filter((_: any, i: number) => i !== index)
                                        }));
                                      }}
                                    >
                                      Remover
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Marcos Históricos (Timeline) Editor */}
                        <div className="bg-white/40 p-8 rounded-3xl border border-[#0b1d3a]/5 space-y-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-[#0b1d3a]/10 gap-4">
                            <div>
                              <h3 className="font-serif text-xl border-l-4 border-[#c5a059] pl-4 uppercase tracking-widest font-bold text-[#0b1d3a]">Marcos Históricos (Linha do Tempo)</h3>
                              <p className="text-[9px] text-[#0b1d3a]/50 uppercase tracking-widest ml-4 font-black">Crie, edite e organize marcos de fundação e atos gloriosos no tempo</p>
                            </div>
                            <button
                              onClick={() => {
                                setTempAboutContent((prev: any) => ({
                                  ...prev,
                                  milestones: [
                                    ...(prev.milestones || []),
                                    { year: new Date().getFullYear().toString(), title: "Novo Marco", description: "Escreva os fatos históricos do período de forma resumida." }
                                  ]
                                }));
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-[#0b1d3a] hover:bg-[#c5a059] text-white text-[9px] uppercase tracking-wider font-extrabold rounded-lg transition-all"
                            >
                              <Plus className="w-3 h-3" /> Adicionar Marco
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(tempAboutContent.milestones || []).map((ms: any, index: number) => (
                              <div key={index} className="bg-white/60 p-6 rounded-2xl border border-[#0b1d3a]/5 space-y-4 relative group">
                                <button
                                  onClick={() => {
                                    setTempAboutContent((prev: any) => ({
                                      ...prev,
                                      milestones: prev.milestones.filter((_: any, i: number) => i !== index)
                                    }));
                                  }}
                                  className="absolute top-4 right-4 p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-xs font-bold animate-in"
                                >
                                  Excluir
                                </button>
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="col-span-1">
                                    <label className="block text-[8px] uppercase tracking-widest font-black text-[#0b1d3a]/50 mb-1">Ano</label>
                                    <input
                                      type="text"
                                      className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-2.5 text-xs text-[#0b1d3a] font-bold focus:border-[#c5a059]/50 outline-none text-center"
                                      value={ms.year || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setTempAboutContent((prev: any) => {
                                          const nextMilestones = [...prev.milestones];
                                          nextMilestones[index] = { ...nextMilestones[index], year: val };
                                          return { ...prev, milestones: nextMilestones };
                                        });
                                      }}
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <label className="block text-[8px] uppercase tracking-widest font-black text-[#0b1d3a]/50 mb-1">Título do Fato</label>
                                    <input
                                      type="text"
                                      className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-2.5 text-xs text-[#0b1d3a] focus:border-[#c5a059]/50 outline-none"
                                      value={ms.title || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setTempAboutContent((prev: any) => {
                                          const nextMilestones = [...prev.milestones];
                                          nextMilestones[index] = { ...nextMilestones[index], title: val };
                                          return { ...prev, milestones: nextMilestones };
                                        });
                                      }}
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[8px] uppercase tracking-widest font-black text-[#0b1d3a]/50 mb-1">Fatos/Descrição do Marco</label>
                                  <textarea
                                    className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-3 text-xs text-[#0b1d3a] leading-relaxed focus:border-[#c5a059]/50 outline-none min-h-[80px]"
                                    value={ms.description || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setTempAboutContent((prev: any) => {
                                        const nextMilestones = [...prev.milestones];
                                        nextMilestones[index] = { ...nextMilestones[index], description: val };
                                        return { ...prev, milestones: nextMilestones };
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {contentSubTab === 'filantropia' && tempSocialContent && (
                      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                        {/* Header and Live Save Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[#0b1d3a]/10 gap-4">
                          <div className="text-left">
                            <h3 className="font-serif text-2xl font-bold text-[#0b1d3a] uppercase tracking-wider">Gerenciar Ações Sociais</h3>
                            <p className="text-[#0b1d3a]/60 text-xs mt-1">Configure o título principal, subtítulos, campanhas e imagens de filantropia d'A Arca.</p>
                          </div>
                          <button
                            type="button"
                            disabled={isSavingSocial}
                            onClick={async () => {
                              setIsSavingSocial(true);
                              try {
                                await updateSocialContent(tempSocialContent);
                                alert('Salvo com sucesso!');
                              } catch (err) {
                                console.error(err);
                              } finally {
                                setIsSavingSocial(false);
                              }
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-[#0b1d3a] hover:bg-[#c5a059] text-[#f4efe2] hover:text-[#0b1d3a] rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-lg hover:shadow-xl shrink-0"
                          >
                            {isSavingSocial ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            {isSavingSocial ? 'Salvando...' : 'Salvar Alterações'}
                          </button>
                        </div>

                        {/* Text Block Editors (Hero layout) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {renderTextBlockEditor(
                            "Título Principal de Filantropia",
                            tempSocialContent.title,
                            (txt) => setTempSocialContent((prev: any) => ({ ...prev, title: { ...prev.title, text: txt } })),
                            (aln) => setTempSocialContent((prev: any) => ({ ...prev, title: { ...prev.title, align: aln } }))
                          )}
                          
                          {renderTextBlockEditor(
                            "Subtítulo Descritivo",
                            tempSocialContent.subTitle,
                            (txt) => setTempSocialContent((prev: any) => ({ ...prev, subTitle: { ...prev.subTitle, text: txt } })),
                            (aln) => setTempSocialContent((prev: any) => ({ ...prev, subTitle: { ...prev.subTitle, align: aln } }))
                          )}

                          {renderTextBlockEditor(
                            "Mensagem / Apresentação Institucional",
                            tempSocialContent.description,
                            (txt) => setTempSocialContent((prev: any) => ({ ...prev, description: { ...prev.description, text: txt } })),
                            (aln) => setTempSocialContent((prev: any) => ({ ...prev, description: { ...prev.description, align: aln } }))
                          )}
                        </div>

                        {/* Campaigns Management */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-[#0b1d3a]/5 pb-3">
                            <h4 className="font-serif text-lg font-bold text-[#0b1d3a] uppercase tracking-wider text-left">Campanhas e Projetos de Solidariedade</h4>
                            <button
                              type="button"
                              onClick={() => {
                                setTempSocialContent((prev: any) => ({
                                  ...prev,
                                  campaigns: [
                                    ...(prev.campaigns || []),
                                    { title: 'Nova Campanha', description: '', image: '', status: 'Ativo', link: '' }
                                  ]
                                }));
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                            >
                              <Plus className="w-4 h-4" /> Nova Campanha
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(tempSocialContent.campaigns || []).map((camp: any, index: number) => (
                              <div key={index} className="border border-[#0b1d3a]/10 p-6 rounded-[2rem] bg-white/40 relative space-y-4 shadow-sm flex flex-col justify-between">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm('Tem certeza que deseja excluir esta campanha?')) {
                                      setTempSocialContent((prev: any) => ({
                                        ...prev,
                                        campaigns: prev.campaigns.filter((_: any, i: number) => i !== index)
                                      }));
                                    }
                                  }}
                                  className="absolute top-4 right-4 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-all border border-red-200 z-10"
                                  title="Excluir campanha"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="space-y-4">
                                  <div className="text-left font-bold text-xs text-[#0b1d3a]/40 font-serif border-b border-[#0b1d3a]/5 pb-1">
                                    Campanha #{index + 1}
                                  </div>

                                  <div className="text-left">
                                    <label className="block text-[9px] uppercase font-black tracking-widest text-[#0b1d3a] mb-1 font-bold">Título</label>
                                    <input
                                      type="text"
                                      value={camp.title || ''}
                                      className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-2.5 text-xs text-[#0b1d3a] outline-none focus:border-[#c5a059]/50"
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setTempSocialContent((prev: any) => {
                                          const camps = [...prev.campaigns];
                                          camps[index] = { ...camps[index], title: val };
                                          return { ...prev, campaigns: camps };
                                        });
                                      }}
                                    />
                                  </div>

                                  <div className="text-left">
                                    <label className="block text-[9px] uppercase font-black tracking-widest text-[#0b1d3a] mb-1 font-bold">Descrição</label>
                                    <textarea
                                      rows={3}
                                      value={camp.description || ''}
                                      className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-2.5 text-xs text-[#0b1d3a] outline-none focus:border-[#c5a059]/50"
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setTempSocialContent((prev: any) => {
                                          const camps = [...prev.campaigns];
                                          camps[index] = { ...camps[index], description: val };
                                          return { ...prev, campaigns: camps };
                                        });
                                      }}
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 text-left">
                                    <div>
                                      <label className="block text-[9px] uppercase font-black tracking-widest text-[#0b1d3a] mb-1 font-bold">Meta / Status</label>
                                      <input
                                        type="text"
                                        value={camp.status || ''}
                                        placeholder="Ex: Ativo, Concluído"
                                        className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-2.5 text-xs text-[#0b1d3a] outline-none focus:border-[#c5a059]/50"
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setTempSocialContent((prev: any) => {
                                            const camps = [...prev.campaigns];
                                            camps[index] = { ...camps[index], status: val };
                                            return { ...prev, campaigns: camps };
                                          });
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] uppercase font-black tracking-widest text-[#0b1d3a] mb-1 font-bold">Link (Doação)</label>
                                      <input
                                        type="text"
                                        value={camp.link || ''}
                                        placeholder="https://..."
                                        className="w-full bg-white border border-[#0b1d3a]/10 rounded-xl p-2.5 text-xs text-[#0b1d3a] outline-none focus:border-[#c5a059]/50"
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setTempSocialContent((prev: any) => {
                                            const camps = [...prev.campaigns];
                                            camps[index] = { ...camps[index], link: val };
                                            return { ...prev, campaigns: camps };
                                          });
                                        }}
                                      />
                                    </div>
                                  </div>

                                  {/* Campaign Image upload/url input */}
                                  <div className="space-y-2 text-left bg-white/35 border border-[#0b1d3a]/5 p-3 rounded-xl shadow-inner">
                                    <label className="block text-[9px] uppercase font-black tracking-widest text-[#0b1d3a] font-bold">Imagem da Campanha</label>
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={camp.image || ''}
                                        placeholder="URL da Imagem..."
                                        className="flex-1 bg-white border border-[#0b1d3a]/10 rounded-lg p-2 text-xs text-[#0b1d3a] outline-none focus:border-[#c5a059]/50"
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setTempSocialContent((prev: any) => {
                                            const camps = [...prev.campaigns];
                                            camps[index] = { ...camps[index], image: val };
                                            return { ...prev, campaigns: camps };
                                          });
                                        }}
                                      />
                                      <label className="flex items-center justify-center p-2 bg-white border border-[#0b1d3a]/10 rounded-lg cursor-pointer hover:bg-[#c5a059]/10 hover:border-[#c5a059]/30 transition-all shrink-0">
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              await handleSocialImageUpload('campaigns', file, index);
                                            }
                                          }}
                                        />
                                        {uploadingSocialImages[`campaigns`] ? (
                                          <RefreshCw className="w-4 h-4 text-[#c5a059] animate-spin" />
                                        ) : (
                                          <Upload className="w-4 h-4 text-[#c5a059]" />
                                        )}
                                      </label>
                                    </div>
                                    {camp.image && (
                                      <div className="mt-2 h-20 rounded-lg overflow-hidden border border-[#0b1d3a]/10 relative group">
                                        <img src={camp.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}

                            {(tempSocialContent.campaigns || []).length === 0 && (
                              <div className="col-span-full text-center py-10 bg-white/20 rounded-3xl border border-dashed border-[#0b1d3a]/10">
                                <p className="text-sm text-[#0b1d3a]/40 italic">Nenhum projeto cadastrado. Adicione projetos e dê luz ao plano filantrópico!</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Gallery / Past Action Images */}
                        <div className="space-y-4 pt-4 border-t border-[#0b1d3a]/5">
                          <div className="flex justify-between items-center pb-3">
                            <h4 className="font-serif text-lg font-bold text-[#0b1d3a] uppercase tracking-wider text-left">Galeria de Fotos (Álbum de Ações Realizadas)</h4>
                            <button
                              type="button"
                              onClick={() => {
                                setTempSocialContent((prev: any) => ({
                                  ...prev,
                                  gallery: [...(prev.gallery || []), '']
                                }));
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                            >
                              <Plus className="w-4 h-4" /> Nova Foto da Galeria
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(tempSocialContent.gallery || []).map((imgUrl: string, idx: number) => (
                              <div key={idx} className="border border-[#0b1d3a]/10 p-4 rounded-2xl bg-white/40 relative space-y-3 shadow-sm text-left animate-in fade-in-30">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTempSocialContent((prev: any) => ({
                                      ...prev,
                                      gallery: prev.gallery.filter((_: any, i: number) => i !== idx)
                                    }));
                                  }}
                                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-full transition-all border border-red-100 z-10"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>

                                <label className="block text-[9px] uppercase font-black tracking-widest text-[#0b1d3a]">Foto #{idx + 1}</label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={imgUrl || ''}
                                    placeholder="URL da Imagem..."
                                    className="flex-1 bg-white border border-[#0b1d3a]/10 rounded-lg p-2 text-xs text-[#0b1d3a] outline-none focus:border-[#c5a059]/50"
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setTempSocialContent((prev: any) => {
                                        const gal = [...prev.gallery];
                                        gal[idx] = val;
                                        return { ...prev, gallery: gal };
                                      });
                                    }}
                                  />
                                  <label className="flex items-center justify-center p-2 bg-white border border-[#0b1d3a]/10 rounded-lg cursor-pointer hover:bg-[#c5a059]/10 hover:border-[#c5a059]/30 transition-all shrink-0">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          await handleSocialImageUpload('gallery', file, idx);
                                        }
                                      }}
                                    />
                                    {uploadingSocialImages[`gallery`] ? (
                                      <RefreshCw className="w-4 h-4 text-[#c5a059] animate-spin" />
                                    ) : (
                                      <Upload className="w-4 h-4 text-[#c5a059]" />
                                    )}
                                  </label>
                                </div>
                                {imgUrl && (
                                  <div className="mt-2 h-32 rounded-lg overflow-hidden border border-[#0b1d3a]/10 relative animate-in fade-in zoom-in-95 duration-200">
                                    <img src={imgUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  </div>
                                )}
                              </div>
                            ))}

                            {(tempSocialContent.gallery || []).length === 0 && (
                              <div className="col-span-full text-center py-10 bg-white/20 rounded-3xl border border-dashed border-[#0b1d3a]/10">
                                <p className="text-sm text-[#0b1d3a]/40 italic">Nenhuma imagem adicionada à galeria. Faça upload de fotos dos momentos gloriosos de caridade!</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

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
                                    <textarea 
                                      className="w-full bg-transparent border border-[#0b1d3a]/10 rounded-lg p-2 text-[10px] text-[#0b1d3a]/80 placeholder:text-[#0b1d3a]/30 outline-none focus:border-[#c5a059]"
                                      value={item.description || ''}
                                      placeholder="Descrição da iniciativa"
                                      rows={2}
                                      onChange={e => {
                                        const newIn = [...editContent.philanthropy.initiatives];
                                        newIn[idx].description = e.target.value;
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
                                  <div>
                                    <label className="block text-[10px] text-[#0b1d3a]/60 uppercase mb-1 font-bold">Website / Link Oficial</label>
                                    <input 
                                      className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] text-xs focus:border-[#c5a059] outline-none shadow-sm"
                                      value={editContent.familyGroups?.[groupKey].website || ''}
                                      placeholder="https://exemplo.com"
                                      onChange={e => setEditContent({...editContent, familyGroups: {...editContent.familyGroups!, [groupKey]: {...editContent.familyGroups![groupKey], website: e.target.value}}})}
                                    />
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
                                <label className="block text-[10px] text-white/40 uppercase mb-1">História com a Loja</label>
                                <textarea 
                                  className="w-full bg-white/40 border border-[#0b1d3a]/10 rounded-lg p-3 text-[#0b1d3a] text-sm min-h-[120px] focus:border-[#c5a059] outline-none"
                                  placeholder="História ou ligação desta instituição com a Loja Maçônica ARLS Arca da Aliança nº 34"
                                  value={editContent.familyGroups?.[groupKey].historyWithLodge || ''}
                                  onChange={e => setEditContent({...editContent, familyGroups: {...editContent.familyGroups!, [groupKey]: {...editContent.familyGroups![groupKey], historyWithLodge: e.target.value}}})}
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
                          <h3 className="font-serif text-xl border-l-4 border-[#c5a059] pl-4 uppercase tracking-widest font-bold mb-4 text-[#0b1d3a]">Cabeçalho da Galeria de Fotos</h3>
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
                          <h3 className="font-serif text-2xl text-[#0b1d3a] uppercase tracking-widest border-b border-[#c5a059]/20 pb-2 font-bold">Gerenciar Galeria de Fotos</h3>
                          <button 
                            onClick={() => {
                              const newPhoto = { url: "", title: "Nova Foto", category: "Social", description: "" };
                              setEditContent({...editContent, gallery: [...(editContent.gallery || []), newPhoto]});
                            }}
                            className="px-6 py-3 bg-[#0b1d3a] text-[#f4efe2] font-black rounded-xl text-xs uppercase tracking-widest hover:bg-[#c5a059] transition-all shadow-xl"
                          >
                            + Adicionar Imagem
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {(editContent.gallery || []).map((photo, index) => (
                            <div key={index} className="bg-white/40 p-6 rounded-2xl border border-[#0b1d3a]/5 relative group shadow-sm flex flex-col justify-between">
                              <button 
                                onClick={() => {
                                  const newGallery = editContent.gallery.filter((_, i) => i !== index);
                                  setEditContent({...editContent, gallery: newGallery});
                                }}
                                className="absolute top-2 right-2 z-10 text-red-500/50 hover:text-red-500 p-2"
                              >
                                <X className="w-5 h-5" />
                              </button>
                              <div className="space-y-3 flex-1 flex flex-col justify-between">
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
                                <div className="space-y-3 mt-2">
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
                                    <label className="block text-[9px] text-[#0b1d3a] uppercase font-black mb-1">Descrição</label>
                                    <textarea 
                                      rows={3}
                                      className="w-full bg-white/80 border border-[#0b1d3a]/10 rounded-lg p-2 text-[#0b1d3a] text-xs outline-none shadow-sm resize-y"
                                      placeholder="Descreva este registro ou momento fraternal..."
                                      value={photo.description || ''}
                                      onChange={e => {
                                        const newGallery = editContent.gallery.map((p, i) => i === index ? { ...p, description: e.target.value } : p);
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
                                </div>
                                <div className="pt-3 flex justify-end border-t border-[#0b1d3a]/5 mt-3">
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
                            {isSaving ? <RefreshCw className="animate-spin" /> : <Save />} Salvar Galeria de Fotos
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
                  {invitations.filter(inv => inv.status === 'PENDING').map(invite => (
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
                        <span className="bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20 text-[8px] font-black tracking-widest uppercase px-2 py-1 rounded-full">
                          Pendente
                        </span>
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
                  {registeredUsers.map(user => {
                    const inviteData = invitations.find(i => i.email === user.email);
                    return (
                      <div key={user.id} className="p-6 bg-white/40 rounded-2xl border border-[#0b1d3a]/5 flex flex-col gap-4 group hover:border-[#c5a059]/20 transition-all shadow-sm">
                        <div className="flex gap-4 items-center">
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
                                  onClick={() => setDeletingUser(user)}
                                  className="text-red-500/30 hover:text-red-500 transition-colors p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-[#0b1d3a]/40 text-xs truncate">{user.email}</p>
                          </div>
                        </div>

                        <div className="space-y-1 bg-[#0b1d3a]/5 p-3 rounded-xl border border-[#0b1d3a]/5">
                          <div className="flex items-center justify-between gap-2">
                             <span className="text-[7px] text-[#0b1d3a]/40 uppercase font-black tracking-widest">Autorizado em:</span>
                             <span className="text-[7px] text-[#c5a059] font-bold uppercase">{inviteData?.createdAt?.toDate ? inviteData.createdAt.toDate().toLocaleString('pt-BR') : 'Manual'}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                             <span className="text-[7px] text-[#0b1d3a]/40 uppercase font-black tracking-widest">Cadastrado em:</span>
                             <span className="text-[7px] text-[#c5a059] font-bold uppercase">{user.createdAt?.toDate ? user.createdAt.toDate().toLocaleString('pt-BR') : 'N/A'}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
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

                        <div className="flex items-center gap-2">
                          <select 
                            disabled={!isMasterAdmin}
                            className={`text-[8px] px-2 py-0.5 border border-[#0b1d3a]/10 rounded uppercase font-black tracking-widest outline-none shadow-sm ${!isMasterAdmin ? 'bg-gray-100/50 text-[#0b1d3a]/30 cursor-not-allowed' : 'bg-white/40 text-[#0b1d3a]/60 cursor-pointer hover:bg-white/60'}`}
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
                          <span className="text-[8px] text-[#0b1d3a]/20 uppercase font-black tracking-widest ml-auto">
                            {user.isOnline ? 'Online agora' : user.lastSeen ? `Visto: ${new Date(user.lastSeen?.toDate?.() || user.lastSeen).toLocaleDateString()}` : 'Inativo'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && isMasterAdmin && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Permissions Management Widget */}
              <div className="bg-white/40 p-6 md:p-10 rounded-[2.5rem] border border-[#0b1d3a]/10 backdrop-blur-sm shadow-sm w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h3 className="font-serif text-2xl text-[#0b1d3a] uppercase tracking-widest underline decoration-[#c5a059]/30 underline-offset-8 text-left font-bold">Equipe Admin & Permissões</h3>
                    <p className="text-[#0b1d3a]/40 text-[9px] uppercase font-black tracking-widest mt-2">Área Exclusiva do Administrador Master para concessão e revogação de acessos</p>
                  </div>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-[#0b1d3a]/10 text-[#0b1d3a]/40 text-[9px] font-black uppercase tracking-widest">
                        <th className="pb-4">Nome / Irmão</th>
                        <th className="pb-4">Email</th>
                        <th className="pb-4">Nível de Acesso</th>
                        <th className="pb-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0b1d3a]/5">
                      {registeredUsers.map((user) => {
                        const userEmail = user.email?.toLowerCase() || '';
                        const isThisUserMaster = user.isMasterAdmin === true || ['sophiabohn@gmail.com', 'lojaarcadaalianca34@gmail.com'].includes(userEmail);
                        const isThisUserAdmin = user.role === 'admin' || user.isAdmin === true || isThisUserMaster;
                        
                        return (
                          <tr key={user.id} className="text-[#0b1d3a] text-xs hover:bg-[#0b1d3a]/5 transition-colors">
                            <td className="py-4 font-bold pr-4 flex items-center gap-2">
                              {user.displayName || user.name || 'Sem nome'}
                              {isThisUserMaster && (
                                <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                                  Master Admin
                                </span>
                              )}
                            </td>
                            <td className="py-4 text-[#0b1d3a]/60 pr-4">{user.email || '-'}</td>
                            <td className="py-4 pr-4">
                              {isThisUserMaster ? (
                                <span className="font-bold text-[#c5a059]">Administrador Master</span>
                              ) : isThisUserAdmin ? (
                                <span className="font-bold text-amber-500">Administrador Comum</span>
                              ) : (
                                <span className="text-[#0b1d3a]/40">Membro / Usuário</span>
                              )}
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex justify-end gap-2">
                                {isThisUserMaster ? (
                                  <button
                                    disabled
                                    className="px-3 py-1.5 bg-gray-500/5 text-gray-500/40 border border-gray-500/10 text-[9px] font-black uppercase tracking-widest rounded-lg cursor-not-allowed"
                                  >
                                    Protegido
                                  </button>
                                ) : isThisUserAdmin ? (
                                  <button
                                    onClick={async () => {
                                      if (confirm(`Atenção: Deseja realmente revogar o acesso administrativo de ${user.displayName || user.email}? Ele perderá acesso ao painel.`)) {
                                        try {
                                          await updateDoc(doc(db, 'users', user.id), {
                                            isAdmin: false,
                                            role: 'member'
                                          });
                                          alert('Acesso administrativo revogado com sucesso.');
                                        } catch (err) {
                                          handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
                                        }
                                      }
                                    }}
                                    className="px-3 py-1.5 bg-red-600/10 border border-red-600/30 hover:bg-red-600 hover:text-white text-red-600 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all"
                                  >
                                    Revogar Admin
                                  </button>
                                ) : (
                                  <button
                                    onClick={async () => {
                                      if (confirm(`Confirmar promoção de ${user.displayName || user.email} a Administrador Comum?`)) {
                                        try {
                                          await updateDoc(doc(db, 'users', user.id), {
                                            isAdmin: true,
                                            role: 'admin'
                                          });
                                          alert('Usuário promovido a Administrador Comum.');
                                        } catch (err) {
                                          handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
                                        }
                                      }
                                    }}
                                    className="px-3 py-1.5 bg-[#0b1d3a] border border-[#c5a059]/30 hover:bg-[#c5a059] text-[#f4efe2] text-[9px] font-black uppercase tracking-widest rounded-lg transition-all shadow-sm"
                                  >
                                    Promover a Admin
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </motion.div>
          </main>
        </div>
        <AnimatePresence>
          {deletingUser && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] bg-[#0b1d3a]/80 backdrop-blur-md flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-[#f4efe2] border-4 border-[#c5a059]/40 p-10 rounded-[3rem] shadow-3xl max-w-lg w-full text-center space-y-8 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-[#c5a059]" />
                <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500">
                  <Trash2 className="w-12 h-12" />
                </div>
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl font-bold text-[#0b1d3a] uppercase tracking-tight">Confirmação Solene</h3>
                  <p className="text-[#0b1d3a]/80 text-sm leading-relaxed px-4">
                    "Atenção: Deseja realmente remover este Obreiro do Quadro Digital da Arca da Aliança? Esta ação retirará o irmão de nossas colunas virtuais e revogará seu acesso definitivo."
                  </p>
                  <p className="text-[#c5a059] font-black uppercase tracking-widest text-[10px] bg-[#c5a059]/5 py-2 rounded-xl">
                    Irmão: {deletingUser.displayName || deletingUser.email}
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-4">
                  <button 
                    onClick={async () => {
                      try {
                        await deleteDoc(doc(db, 'users', deletingUser.id));
                        setDeletingUser(null);
                        alert('Obreiro removido com sucesso.');
                      } catch(e) {
                        handleFirestoreError(e, OperationType.DELETE, `users/${deletingUser.id}`);
                      }
                    }}
                    className="flex-1 px-8 py-4 bg-red-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-xl"
                  >
                    Confirmar Exclusão
                  </button>
                  <button 
                    onClick={() => setDeletingUser(null)}
                    className="flex-1 px-8 py-4 bg-[#0b1d3a]/5 text-[#0b1d3a]/60 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-[#0b1d3a]/10 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
