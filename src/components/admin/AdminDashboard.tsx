import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth, logout, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, setDoc, deleteDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { useContent } from '@/src/context/ContentContext';
import { LogOut, Users, FileText, Save, Check, RefreshCw, X, Brain, Printer, ChevronDown, ChevronUp, Book, Video, Globe, Star, Play, Download, LayoutDashboard, ExternalLink, ArrowLeft, ShieldCheck, Clock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeCandidate } from '@/src/services/masonicAnalysisService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { content, updateContent } = useContent();
  const [activeTab, setActiveTab] = useState<'leads' | 'content' | 'events' | 'library' | 'members'>('leads');
  const [contentSubTab, setContentSubTab] = useState<'site' | 'management' | 'family' | 'masters' | 'social' | null>(null);
  const [newLibrarySection, setNewLibrarySection] = useState('');
  const [leads, setLeads] = useState<any[]>([]);
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [membershipRequests, setMembershipRequests] = useState<any[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [newInviteMessage, setNewInviteMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [analyzingLeads, setAnalyzingLeads] = useState<Record<string, boolean>>({});
  const [analysisReports, setAnalysisReports] = useState<Record<string, string>>({});
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

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

    // Candidate Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text("DADOS DO CANDIDATO", 14, 55);
    
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
      startY: 60,
      head: [['Campo', 'Informação']],
      body: personalData,
      theme: 'striped',
      headStyles: { fillColor: [139, 94, 52] },
      styles: { font: 'times' }
    });

    // Responses
    const lastY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFont("times", "bold");
    doc.text("RESPOSTAS DO QUESTIONÁRIO", 14, lastY);

    const responses = [
      ["Motivação", lead.motivation || "-"]
    ];

    for (let i = 1; i <= 12; i++) {
      if (lead[`q${i}`]) {
        responses.push([`Questão ${i}`, lead[`q${i}`]]);
      }
    }

    autoTable(doc, {
      startY: lastY + 5,
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
    <div className="min-h-screen bg-masonic-dark text-white p-6 pt-24">
      <AnimatePresence>
        {isSaving && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-masonic-dark/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <div className="bg-masonic-blue/95 border border-gold-500/30 p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 text-center max-w-sm w-full backdrop-blur-xl">
              <div className="w-20 h-20 rounded-full border-4 border-gold-500 border-t-transparent animate-spin flex items-center justify-center">
                <RefreshCw className="w-10 h-10 text-gold-500" />
              </div>
              <div>
                <h3 className="gold-text font-serif text-2xl font-bold uppercase tracking-widest mb-2">Gravando...</h3>
                <p className="text-gold-100/40 text-[10px] uppercase font-black tracking-[0.2em]">Salvando no Oriente Digital</p>
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
            <div className="bg-green-500 text-masonic-dark px-10 py-5 rounded-2xl shadow-3xl flex items-center gap-4 font-black uppercase tracking-[0.2em] text-[11px] border-4 border-white/20">
              <ShieldCheck className="w-6 h-6" />
              Obra Concluída com Sucesso!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-masonic-blue/30 p-8 rounded-3xl border border-gold-500/20">
          <div>
            <h1 className="font-serif text-3xl font-bold gold-text uppercase tracking-widest">Painel Administrativo</h1>
            <p className="text-gold-100/40 text-sm">Bem-vindo, {auth.currentUser?.email}</p>
            <div className="flex gap-4 mt-4">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-[10px] uppercase font-black text-gold-500/50 hover:text-gold-500 transition-colors"
              >
                <Globe className="w-3 h-3" /> Ver Site
              </button>
              <button 
                onClick={() => navigate('/biblioteca-restrita')}
                className="flex items-center gap-2 text-[10px] uppercase font-black text-gold-500/50 hover:text-gold-500 transition-colors"
              >
                <ShieldCheck className="w-3 h-3" /> Área Restrita
              </button>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg font-black uppercase text-[10px] tracking-widest"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </header>

        <div className="lg:grid lg:grid-cols-[280px_1fr] gap-10 items-start">
          <aside className="lg:sticky lg:top-24 flex flex-col gap-2">
            <button 
              onClick={() => { setActiveTab('leads'); setContentSubTab(null); }}
              className={`flex items-center gap-3 w-full px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'leads' ? 'bg-gold-500 text-masonic-dark shadow-[0_0_20px_rgba(230,176,0,0.3)]' : 'bg-white/5 text-gold-500/50 hover:bg-white/10 hover:text-gold-500'}`}
            >
              <Users className="w-5 h-5" /> Candidatos ({leads.length})
            </button>
            <button 
              onClick={() => { setActiveTab('content'); setContentSubTab(null); }}
              className={`flex items-center gap-3 w-full px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'content' ? 'bg-gold-500 text-masonic-dark shadow-[0_0_20px_rgba(230,176,0,0.3)]' : 'bg-white/5 text-gold-500/50 hover:bg-white/10 hover:text-gold-500'}`}
            >
              <FileText className="w-5 h-5" /> Editar Site
            </button>
            <button 
              onClick={() => { setActiveTab('events'); setContentSubTab(null); }}
              className={`flex items-center gap-3 w-full px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'events' ? 'bg-gold-500 text-masonic-dark shadow-[0_0_20px_rgba(230,176,0,0.3)]' : 'bg-white/5 text-gold-500/50 hover:bg-white/10 hover:text-gold-500'}`}
            >
              <RefreshCw className="w-5 h-5" /> Eventos ({editContent.events?.length || 0})
            </button>
            <button 
              onClick={() => { setActiveTab('library'); setContentSubTab(null); }}
              className={`flex items-center gap-3 w-full px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'library' ? 'bg-gold-500 text-masonic-dark shadow-[0_0_20px_rgba(230,176,0,0.3)]' : 'bg-white/5 text-gold-500/50 hover:bg-white/10 hover:text-gold-500'}`}
            >
              <Book className="w-5 h-5" /> Biblioteca ({libraryItems.length})
            </button>
            <button 
              onClick={() => { setActiveTab('members'); setContentSubTab(null); }}
              className={`flex items-center gap-3 w-full px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all ${activeTab === 'members' ? 'bg-gold-500 text-masonic-dark shadow-[0_0_20px_rgba(230,176,0,0.3)]' : 'bg-white/5 text-gold-500/50 hover:bg-white/10 hover:text-gold-500'}`}
            >
              <ShieldCheck className="w-5 h-5" /> Membros e Convites ({membershipRequests.filter(r => r.status === 'PENDING').length > 0 ? `+${membershipRequests.filter(r => r.status === 'PENDING').length}` : ''})
            </button>

            <div className="mt-8 p-8 bg-gold-500/5 border border-gold-500/10 rounded-[2.5rem] text-center backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500 mx-auto mb-4 border border-gold-500/20 shadow-[0_0_15px_rgba(230,176,0,0.1)]">
                <Brain className="w-6 h-6" />
              </div>
              <p className="text-[9px] uppercase font-black text-gold-500/40 tracking-[0.2em] mb-1">Status de IA</p>
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Sindicância Ativa</p>
            </div>
          </aside>

          <main className="min-w-0 space-y-8">
            {activeTab === 'content' && !contentExists && (
              <div className="p-8 bg-gold-500/10 border border-gold-500/30 rounded-3xl flex items-center justify-between">
                <div>
                  <h4 className="text-gold-500 font-bold uppercase tracking-widest text-xs">Atenção</h4>
                  <p className="text-gold-100/60 text-sm">O conteúdo inicial ainda não foi criado no banco de dados.</p>
                </div>
                <button 
                  onClick={handleSaveContent}
                  className="px-8 py-3 bg-gold-500 text-masonic-dark font-black text-[10px] uppercase rounded-xl tracking-widest shadow-xl"
                >
                  Criar Documento Inicial
                </button>
              </div>
            )}

            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 rounded-[3rem] border border-white/10 p-10 backdrop-blur-sm"
            >
          {activeTab === 'events' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-2xl gold-text uppercase tracking-widest underline decoration-gold-500/30 underline-offset-8">Calendário de Eventos</h3>
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
                  className="px-6 py-3 bg-gold-500 text-masonic-dark font-black rounded-xl text-xs uppercase tracking-widest hover:bg-gold-400 transition-all shadow-xl"
                >
                  + Inserir Nova Pauta
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                {(editContent.events || []).map((event, index) => (
                  <div key={index} className="bg-masonic-dark/50 p-6 rounded-2xl border border-white/5 relative">
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
                          <label className="block text-[9px] text-gold-500 uppercase font-black mb-1">Título do Evento</label>
                          <input 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500/50 outline-none"
                            value={event.title}
                            onChange={e => {
                              const newEvents = [...editContent.events];
                              newEvents[index].title = e.target.value;
                              setEditContent({...editContent, events: newEvents});
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-gold-500 uppercase font-black mb-1">Categoria (Ex: Magna, Social)</label>
                          <input 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500/50 outline-none"
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
                          <label className="block text-[9px] text-gold-500 uppercase font-black mb-1">Data Completa</label>
                          <input 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500/50 outline-none"
                            value={event.date}
                            onChange={e => {
                              const newEvents = [...editContent.events];
                              newEvents[index].date = e.target.value;
                              setEditContent({...editContent, events: newEvents});
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-gold-500 uppercase font-black mb-1">Horário</label>
                          <input 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500/50 outline-none"
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
                        <label className="block text-[9px] text-gold-500 uppercase font-black mb-1">Localização</label>
                        <input 
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500/50 outline-none"
                          value={event.location}
                          onChange={e => {
                            const newEvents = [...editContent.events];
                            newEvents[index].location = e.target.value;
                            setEditContent({...editContent, events: newEvents});
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-gold-500 uppercase font-black mb-1">Breve Descrição do Evento</label>
                        <textarea 
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500/50 outline-none resize-none"
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
              <div className="pt-8 border-t border-white/10 flex justify-end">
                <button 
                  onClick={handleSaveContent}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-gold-500 text-masonic-dark px-10 py-4 rounded-xl font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-gold-400 transition-all font-sans shadow-2xl"
                >
                  {isSaving ? <RefreshCw className="animate-spin" /> : <Save />} Salvar Agenda
                </button>
              </div>
            </div>
          )}

          
          {activeTab === 'leads' && (
            <div className="space-y-6">
              {leads.length === 0 ? (
                <p className="text-center text-gold-50/30 py-12 italic">Nenhum interessado encontrado no momento.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {leads.map(lead => (
                      <div key={lead.id} className="bg-masonic-blue/40 p-6 rounded-2xl border border-white/5 hover:border-gold-500/30 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                              className="p-1 hover:bg-white/5 rounded-lg text-gold-500/50 hover:text-gold-500"
                            >
                              {expandedLead === lead.id ? <ChevronUp /> : <ChevronDown />}
                            </button>
                            <div>
                              <h3 className="text-xl font-bold text-gold-100">{lead.fullName || lead.name}</h3>
                              <p className="text-gold-500 text-sm">{lead.email} | {lead.phone}</p>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <span className="text-[10px] text-white/30 uppercase font-mono">
                              {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleString() : 'Recent'}
                            </span>
                            <div className="flex gap-2">
                              {lead.type === 'masonic_quest' && (
                                <span className="bg-gold-500/20 text-gold-500 text-[8px] px-2 py-1 rounded-full border border-gold-500/30 uppercase font-bold tracking-widest">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 pt-6 border-t border-white/5">
                                  <div className="space-y-6">
                                    <h4 className="text-gold-500 text-[10px] uppercase font-bold tracking-[0.2em] border-b border-gold-500/20 pb-1 flex items-center gap-2">
                                      <Brain className="w-3 h-3" /> Parecer do Consultor AI
                                    </h4>
                                    
                                    {(lead.analysisReport || analysisReports[lead.id]) ? (
                                      <div className="space-y-4">
                                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-sm font-serif leading-relaxed h-[400px] overflow-y-auto custom-scrollbar">
                                          <pre className="whitespace-pre-wrap text-gold-100/90">{analysisReports[lead.id] || lead.analysisReport}</pre>
                                        </div>
                                      <div className="flex flex-col md:flex-row gap-2">
                                        <button 
                                          onClick={() => handlePrint(lead.id)}
                                          className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-gold-500 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                                        >
                                          <Printer className="w-4 h-4" /> Imprimir Parecer
                                        </button>
                                        <button 
                                          onClick={() => handleDownloadLeadPDF(lead)}
                                          className="flex-1 flex items-center justify-center gap-2 bg-gold-500 text-masonic-dark py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-gold-400 transition-all shadow-lg"
                                        >
                                          <Download className="w-4 h-4" /> Baixar Ficha (PDF)
                                        </button>
                                      </div>
                                      </div>
                                    ) : (
                                      <div className="bg-gold-500/5 border border-gold-500/10 p-8 rounded-2xl text-center">
                                        <Brain className="w-12 h-12 text-gold-500/30 mx-auto mb-4" />
                                        <p className="text-gold-100/40 text-xs mb-6 px-4">
                                          O perfil deste candidato ainda não foi processado pela inteligência de sindicância.
                                        </p>
                                        <button 
                                          onClick={() => handleAnalyze(lead)}
                                          disabled={analyzingLeads[lead.id]}
                                          className="px-8 py-3 bg-gold-500 text-masonic-dark rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gold-400 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                                        >
                                          {analyzingLeads[lead.id] ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                                          Gerar Parecer Técnico
                                        </button>
                                      </div>
                                    )}

                                    <h4 className="text-gold-500 text-[10px] uppercase font-bold tracking-[0.2em] border-b border-gold-500/20 pb-1 mt-8">Dados Pessoais</h4>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                      <div>
                                        <p className="text-white/40 uppercase font-bold text-[9px]">Nascimento:</p>
                                        <p>{lead.birthDate}</p>
                                      </div>
                                      <div>
                                        <p className="text-white/40 uppercase font-bold text-[9px]">Escolaridade:</p>
                                        <p>{lead.education}</p>
                                      </div>
                                      <div>
                                        <p className="text-white/40 uppercase font-bold text-[9px]">Crença:</p>
                                        <p>{lead.faith}</p>
                                      </div>
                                      <div>
                                        <p className="text-white/40 uppercase font-bold text-[9px]">Cidade:</p>
                                        <p>{lead.city}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-6">
                                    <h4 className="text-gold-500 text-[10px] uppercase font-bold tracking-[0.2em] border-b border-gold-500/20 pb-1">Perfil e Respostas</h4>
                                    <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                                      <div>
                                        <p className="text-white/40 uppercase font-bold text-[9px]">Estado Civil:</p>
                                        <p>{lead.civilStatus}</p>
                                      </div>
                                      <div>
                                        <p className="text-white/40 uppercase font-bold text-[9px]">Filhos:</p>
                                        <p>{lead.childrenCount || "Nenhum"}</p>
                                      </div>
                                      <div>
                                        <p className="text-white/40 uppercase font-bold text-[9px]">Profissão:</p>
                                        <p>{lead.profession}</p>
                                      </div>
                                      <div>
                                        <p className="text-white/40 uppercase font-bold text-[9px]">Renda:</p>
                                        <p>{lead.income}</p>
                                      </div>
                                    </div>

                                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                      <div className="bg-white/5 p-4 rounded-xl">
                                        <p className="text-[10px] text-gold-500 uppercase font-black mb-2">Motivação</p>
                                        <p className="text-xs text-gold-100 italic">"{lead.motivation}"</p>
                                      </div>
                                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => lead[`q${num}`] ? (
                                        <div key={num} className="bg-white/5 p-4 rounded-xl">
                                          <p className="text-[10px] text-gold-500 uppercase font-black mb-2">Questão {num}</p>
                                          <p className="text-xs text-gold-100">{lead[`q${num}`]}</p>
                                        </div>
                                      ) : null)}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-4 pt-4 border-t border-white/5">
                                  <p className="text-gold-50/60 text-sm bg-white/5 p-4 rounded-xl italic">"{lead.message}"</p>
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
                    className="group bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-left hover:border-gold-500/40 transition-all hover:bg-gold-500/5"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-500 mb-6 group-hover:scale-110 transition-transform">
                      <LayoutDashboard className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-white mb-2 uppercase tracking-wider">Editar Conteúdo <span className="gold-text">do Site</span></h3>
                    <p className="text-gold-100/40 text-[10px] uppercase tracking-widest font-black">Hero, História, Filantropia e Missão</p>
                  </button>

                  <button 
                    onClick={() => setContentSubTab('management')}
                    className="group bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-left hover:border-gold-500/40 transition-all hover:bg-gold-500/5"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-500 mb-6 group-hover:scale-110 transition-transform">
                      <Users className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-white mb-2 uppercase tracking-wider">Atual <span className="gold-text">Gestão</span></h3>
                    <p className="text-gold-100/40 text-[10px] uppercase tracking-widest font-black">Fotos e nomes do Quadro de Obreiros</p>
                  </button>

                  <button 
                    onClick={() => setContentSubTab('masters')}
                    className="group bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-left hover:border-gold-500/40 transition-all hover:bg-gold-500/5"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-500 mb-6 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-white mb-2 uppercase tracking-wider">Galeria de <span className="gold-text">Honra</span></h3>
                    <p className="text-gold-100/40 text-[10px] uppercase tracking-widest font-black">Editais de Past Veneráveis Mestres</p>
                  </button>

                  <button 
                    onClick={() => setContentSubTab('family')}
                    className="group bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-left hover:border-gold-500/40 transition-all hover:bg-gold-500/5"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 mb-6 group-hover:scale-110 transition-transform">
                      <Star className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-white mb-2 uppercase tracking-wider">Cunhadas e <span className="text-pink-500">Jovens</span></h3>
                    <p className="text-gold-100/40 text-[10px] uppercase tracking-widest font-black">Fraternidade Feminina e Ordem DeMolay/Filhas de Jó</p>
                  </button>

                  <button 
                    onClick={() => setContentSubTab('social')}
                    className="group bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-left hover:border-gold-500/40 transition-all hover:bg-gold-500/5"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-500 mb-6 group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-white mb-2 uppercase tracking-wider">Álbum <span className="gold-text">Social</span></h3>
                    <p className="text-gold-100/40 text-[10px] uppercase tracking-widest font-black">Vídeos e fotos da Galeria do Site</p>
                  </button>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <button 
                    onClick={() => setContentSubTab(null)}
                    className="flex items-center gap-2 text-gold-500/60 hover:text-gold-500 transition-colors uppercase tracking-widest text-[10px] font-black pb-4 border-b border-white/5 w-full text-left"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar para Menu de Edição
                  </button>

                  <div className="pt-4">
                    {/* Render the specific content editor based on contentSubTab */}
                    {contentSubTab === 'site' && (
                      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <h3 className="font-serif text-xl border-l-4 border-gold-500 pl-4 uppercase tracking-widest font-bold">Seção de Entrada (Hero)</h3>
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-gold-500 mb-2">Título Principal</label>
                              <input 
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500/50 outline-none"
                                value={editContent.hero.title}
                                onChange={e => setEditContent({...editContent, hero: {...editContent.hero, title: e.target.value}})}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-gold-500 mb-2">Sub-título</label>
                              <input 
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500/50 outline-none"
                                value={editContent.hero.subTitle}
                                onChange={e => setEditContent({...editContent, hero: {...editContent.hero, subTitle: e.target.value}})}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-gold-500 mb-2">Tagline de Impacto</label>
                              <textarea 
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500/50 outline-none text-sm"
                                rows={3}
                                value={editContent.hero.tagline}
                                onChange={e => setEditContent({...editContent, hero: {...editContent.hero, tagline: e.target.value}})}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h3 className="font-serif text-xl border-l-4 border-gold-500 pl-4 uppercase tracking-widest font-bold">Nossa História</h3>
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-gold-500 mb-2">Memorial Descritivo</label>
                              <textarea 
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500/50 outline-none text-sm"
                                rows={8}
                                value={editContent.history.text}
                                onChange={e => setEditContent({...editContent, history: {...editContent.history, text: e.target.value}})}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <label className="block text-[10px] uppercase tracking-widest text-gold-500 mb-2">Missão</label>
                            <textarea 
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500/50 outline-none text-sm"
                              rows={3}
                              value={editContent.history.mission}
                              onChange={e => setEditContent({...editContent, history: {...editContent.history, mission: e.target.value}})}
                            />
                          </div>
                          <div className="space-y-4">
                            <label className="block text-[10px] uppercase tracking-widest text-gold-500 mb-2">Visão</label>
                            <textarea 
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500/50 outline-none text-sm"
                              rows={3}
                              value={editContent.history.vision}
                              onChange={e => setEditContent({...editContent, history: {...editContent.history, vision: e.target.value}})}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-serif text-xl border-l-4 border-gold-500 pl-4 uppercase tracking-widest font-bold">Filantropia e Missão Social</h3>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gold-500 mb-2">Descrição das Obras Sociais</label>
                            <textarea 
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500/50 outline-none text-sm"
                              rows={4}
                              value={editContent.philanthropy.description}
                              onChange={e => setEditContent({...editContent, philanthropy: {...editContent.philanthropy, description: e.target.value}})}
                            />
                          </div>
                          
                          <div className="space-y-4 mt-6">
                            <div className="flex justify-between items-center">
                              <h4 className="text-[10px] uppercase font-black tracking-widest text-gold-500/60">Iniciativas e Impacto</h4>
                              <button 
                                onClick={() => {
                                  const newIn = { title: 'Nova Obra', description: '...', impact: '' };
                                  setEditContent({...editContent, philanthropy: {...editContent.philanthropy, initiatives: [...(editContent.philanthropy.initiatives || []), newIn]}});
                                }}
                                className="text-xs font-bold text-gold-500 hover:text-gold-400"
                              >
                                + Adicionar Iniciativa
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {editContent.philanthropy.initiatives?.map((item, idx) => (
                                <div key={idx} className="bg-black/20 p-4 rounded-xl space-y-3 relative group border border-white/5">
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
                                      className="w-full bg-transparent border-b border-white/10 text-xs text-white font-bold focus:border-gold-500 outline-none"
                                      value={item.title}
                                      placeholder="Título da Obra"
                                      onChange={e => {
                                        const newIn = [...editContent.philanthropy.initiatives];
                                        newIn[idx].title = e.target.value;
                                        setEditContent({...editContent, philanthropy: {...editContent.philanthropy, initiatives: newIn}});
                                      }}
                                    />
                                    <input 
                                      className="w-full bg-transparent border-b border-white/10 text-[10px] text-gold-500 placeholder:text-gold-500/30 outline-none"
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
                        </div>

                        <div className="space-y-6 mt-12 bg-white/5 p-8 rounded-2xl border border-white/10">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="font-serif text-xl gold-text uppercase tracking-widest">Marcos Históricos (Timeline)</h3>
                            <button 
                              onClick={() => {
                                const newMilestone = { year: '20XX', title: 'Novo Marco', description: 'Descrição...' };
                                setEditContent({...editContent, history: {...editContent.history, milestones: [...(editContent.history.milestones || []), newMilestone]}});
                              }}
                              className="px-4 py-2 bg-gold-500/10 border border-gold-500/30 text-gold-500 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gold-500 hover:text-masonic-dark transition-all"
                            >
                              + Adicionar Marco
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {editContent.history.milestones?.map((milestone, index) => (
                              <div key={index} className="p-6 bg-black/20 rounded-xl border border-white/5 space-y-4 relative">
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
                                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Ano</label>
                                    <input 
                                      className="w-full bg-white/5 border border-white/10 rounded p-2 text-gold-500 font-bold focus:border-gold-500 outline-none text-xs"
                                      value={milestone.year}
                                      onChange={e => {
                                        const newMs = [...editContent.history.milestones];
                                        newMs[index].year = e.target.value;
                                        setEditContent({...editContent, history: {...editContent.history, milestones: newMs}});
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Título</label>
                                    <input 
                                      className="w-full bg-white/5 border border-white/10 rounded p-2 text-white focus:border-gold-500 outline-none text-sm"
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
                                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Descrição</label>
                                  <textarea 
                                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white/60 focus:border-gold-500 outline-none text-xs resize-none"
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
                            className="flex items-center gap-2 bg-gold-500 text-masonic-dark px-10 py-4 rounded-xl font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-gold-400 transition-all font-sans shadow-2xl"
                          >
                            {isSaving ? <RefreshCw className="animate-spin" /> : <Save />} Salvar Alterações do Site
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {contentSubTab === 'management' && (
                      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="font-serif text-xl gold-text uppercase tracking-widest underline decoration-gold-500/30 underline-offset-8">Atual Gestão (Quadro de Obreiros)</h3>
                          <button 
                            onClick={() => {
                              const newMember = { name: 'Novo Irmão', role: 'Cargo...' };
                              const newManagement = [...(editContent.management || []), newMember];
                              setEditContent({...editContent, management: newManagement});
                            }}
                            className="px-6 py-3 bg-gold-500 text-masonic-dark rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gold-400 transition-all shadow-xl"
                          >
                            + Adicionar Irmão ao Quadro
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {(editContent.management || []).map((member, index) => (
                            <div key={index} className="p-6 bg-black/20 rounded-xl border border-white/5 space-y-4 relative group">
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
                                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1 font-sans">Cargo/Função</label>
                                  <input 
                                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-gold-500 font-bold focus:border-gold-500 outline-none uppercase text-xs"
                                    value={member.role}
                                    onChange={e => {
                                      const newManagement = editContent.management.map((m, i) => i === index ? { ...m, role: e.target.value } : m);
                                      setEditContent({...editContent, management: newManagement});
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1 font-sans">Nome do Irmão</label>
                                  <input 
                                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white font-sans focus:border-gold-500 outline-none"
                                    value={member.name}
                                    onChange={e => {
                                      const newManagement = editContent.management.map((m, i) => i === index ? { ...m, name: e.target.value } : m);
                                      setEditContent({...editContent, management: newManagement});
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1 font-sans">URL da Foto (opcional)</label>
                                  <input 
                                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white/50 text-[10px] focus:border-gold-500 outline-none"
                                    placeholder="Link direto (.jpg, .png)"
                                    value={(member as any).photo || ''}
                                    onChange={e => {
                                      const newManagement = editContent.management.map((m, i) => i === index ? { ...m, photo: e.target.value } : m);
                                      setEditContent({...editContent, management: newManagement});
                                    }}
                                  />
                                  {(member as any).photo && (
                                    <div className="mt-2 w-12 h-12 rounded-full overflow-hidden border border-gold-500/20 mx-auto bg-black/20">
                                      <img 
                                        src={(member as any).photo} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover" 
                                        referrerPolicy="no-referrer" 
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100?text=Error';
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                                <div className="pt-2 flex justify-end">
                                  <button 
                                    onClick={handleSaveContent}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-gold-500 text-masonic-dark rounded-lg text-[9px] uppercase font-black tracking-widest hover:bg-gold-400 transition-all flex items-center gap-2 shadow-lg"
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
                            className="flex items-center gap-2 bg-gold-500 text-masonic-dark px-10 py-4 rounded-xl font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-gold-400 transition-all font-sans"
                          >
                            {isSaving ? <RefreshCw className="animate-spin" /> : <Save />} Salvar Gestão
                          </button>
                        </div>
                      </div>
                    )}

                    {contentSubTab === 'masters' && (
                      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="font-serif text-xl gold-text uppercase tracking-widest underline decoration-gold-500/30 underline-offset-8">Galeria de Honoráveis Mestres</h3>
                          <button 
                            onClick={() => {
                              const newMaster = {
                                id: Date.now().toString(),
                                name: "Novo Mestre",
                                period: "20XX - 20XX",
                                role: "Past Venerável Mestre",
                                biography: "",
                                firstLady: { name: "", biography: "" }
                              };
                              setEditContent({...editContent, masters: [...(editContent.masters || []), newMaster]});
                            }}
                            className="px-4 py-2 bg-gold-500 text-masonic-dark rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gold-400 transition-all shadow-lg"
                          >
                            + Adicionar Mestre
                          </button>
                        </div>
                        
                        <div className="space-y-8">
                          {editContent.masters?.map((master, index) => (
                            <div key={master.id} className="p-8 bg-masonic-dark/50 rounded-2xl border border-white/5 space-y-6 relative overflow-hidden">
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
                                  <h4 className="text-[10px] uppercase font-black text-gold-500/60 tracking-[0.2em] border-b border-gold-500/10 pb-2">Dados Básicos</h4>
                                  <div>
                                    <label className="block text-[10px] text-white/40 mb-1">Nome do Irmão</label>
                                    <input 
                                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-gold-500"
                                      value={master.name}
                                      onChange={e => {
                                        const newMasters = editContent.masters.map((m, i) => i === index ? { ...m, name: e.target.value } : m);
                                        setEditContent({...editContent, masters: newMasters});
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-white/40 mb-1">Período (Ex: 2023 - 2025)</label>
                                    <input 
                                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-gold-500"
                                      value={master.period}
                                      onChange={e => {
                                        const newMasters = editContent.masters.map((m, i) => i === index ? { ...m, period: e.target.value } : m);
                                        setEditContent({...editContent, masters: newMasters});
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-white/40 mb-1">Cargo/Título</label>
                                    <input 
                                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-gold-500"
                                      value={master.role}
                                      onChange={e => {
                                        const newMasters = editContent.masters.map((m, i) => i === index ? { ...m, role: e.target.value } : m);
                                        setEditContent({...editContent, masters: newMasters});
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-white/40 mb-1">URL da Foto do Mestre</label>
                                    <div className="space-y-2">
                                      <input 
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-[10px] focus:border-gold-500 outline-none"
                                        placeholder="Use link direto (ex: i.ibb.co/.../image.jpg)"
                                        value={master.photo || ''}
                                        onChange={e => {
                                          const newMasters = editContent.masters.map((m, i) => i === index ? { ...m, photo: e.target.value } : m);
                                          setEditContent({...editContent, masters: newMasters});
                                        }}
                                      />
                                      <p className="text-[8px] text-gold-500/50 italic font-mono">Dica: No ImgBB, use o 'Link Direto'</p>
                                    </div>
                                    {master.photo && (
                                      <div className="mt-2 w-full h-32 overflow-hidden rounded-xl border border-white/10 bg-black/20 flex flex-col items-center justify-center relative">
                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-center">
                                          <p className="text-[8px] uppercase font-bold text-white/40">Preview</p>
                                        </div>
                                        <img 
                                          src={master.photo} 
                                          alt="Preview" 
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

                                <div className="space-y-4 md:col-span-2">
                                  <h4 className="text-[10px] uppercase font-black text-gold-500/60 tracking-[0.2em] border-b border-gold-500/10 pb-2">Biografia e Dados da Cunhada</h4>
                                  <div>
                                    <label className="block text-[10px] text-white/40 mb-1">Biografia / Memorial</label>
                                    <textarea 
                                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-gold-500 outline-none"
                                      rows={4}
                                      value={master.biography}
                                      onChange={e => {
                                        const newMasters = editContent.masters.map((m, i) => i === index ? { ...m, biography: e.target.value } : m);
                                        setEditContent({...editContent, masters: newMasters});
                                      }}
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                                      <label className="block text-[10px] text-white/40 mb-1">Nome da Cunhada</label>
                                      <input 
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-gold-500"
                                        value={master.firstLady?.name || ''}
                                        onChange={e => {
                                          const newMasters = editContent.masters.map((m, i) => i === index ? { ...m, firstLady: { ...(m.firstLady || { biography: '', photo: '' }), name: e.target.value } } : m);
                                          setEditContent({...editContent, masters: newMasters});
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] text-white/40 mb-1">URL Foto Cunhada</label>
                                      <input 
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs focus:border-gold-500 outline-none"
                                        placeholder="Link direto (.jpg, .png)"
                                        value={master.firstLady?.photo || ''}
                                        onChange={e => {
                                          const newMasters = editContent.masters.map((m, i) => i === index ? { ...m, firstLady: { ...(m.firstLady || { name: '', biography: '' }), photo: e.target.value } } : m);
                                          setEditContent({...editContent, masters: newMasters});
                                        }}
                                      />
                                      {master.firstLady?.photo && (
                                        <div className="mt-2 w-full h-24 overflow-hidden rounded-xl border border-white/10 bg-black/20 relative">
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
                                      className="flex items-center gap-2 bg-gold-500 text-masonic-dark px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all border border-gold-500/30 shadow-xl hover:bg-gold-400"
                                    >
                                      {isSaving ? <RefreshCw className="animate-spin w-3 h-3" /> : <Save className="w-3 h-3" />} Salvar Este Mestre
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="pt-8 border-t border-white/10 flex justify-end">
                          <button 
                            onClick={handleSaveContent}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-gold-500 text-masonic-dark px-10 py-4 rounded-xl font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-gold-400 transition-all font-sans"
                          >
                            {isSaving ? <RefreshCw className="animate-spin" /> : <Save />} Salvar Heróis da Arca
                          </button>
                        </div>
                      </div>
                    )}

                    {contentSubTab === 'family' && (
                      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center bg-gold-500/10 p-6 rounded-2xl border border-gold-500/20">
                          <div>
                            <h3 className="font-serif text-xl gold-text uppercase tracking-widest">Família e Entidades Paramaçônicas</h3>
                            <p className="text-gold-100/40 text-[10px] uppercase font-bold tracking-widest">Gerencie o conteúdo do grupo de Cunhadas e ordens juvenis.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Guardiãs */}
                          <div className="bg-masonic-dark/50 p-6 rounded-3xl border border-white/5 space-y-4">
                            <h4 className="text-gold-500 font-bold uppercase text-[11px] tracking-widest border-b border-gold-500/10 pb-2">Guardiãs da Aliança (Cunhadas)</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-[9px] text-white/40 uppercase mb-1">Título do Grupo</label>
                                <input 
                                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm"
                                  value={editContent.familyGroups?.guardians.title || ''}
                                  onChange={e => setEditContent({...editContent, familyGroups: {...editContent.familyGroups!, guardians: {...editContent.familyGroups!.guardians, title: e.target.value}}})}
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-white/40 uppercase mb-1">URL da Foto</label>
                                <input 
                                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-[10px]"
                                  placeholder="Link direto (.jpg, .png)"
                                  value={editContent.familyGroups?.guardians.photo || ''}
                                  onChange={e => setEditContent({...editContent, familyGroups: {...editContent.familyGroups!, guardians: {...editContent.familyGroups!.guardians, photo: e.target.value}}})}
                                />
                                {editContent.familyGroups?.guardians.photo && (
                                  <div className="mt-2 w-full h-24 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                                    <img 
                                      src={editContent.familyGroups.guardians.photo} 
                                      alt="Preview" 
                                      className="w-full h-full object-cover" 
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Link+Invalido';
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                              <div>
                                <label className="block text-[9px] text-white/40 uppercase mb-1">Descrição</label>
                                <textarea 
                                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs outline-none"
                                  rows={3}
                                  value={editContent.familyGroups?.guardians.description || ''}
                                  onChange={e => setEditContent({...editContent, familyGroups: {...editContent.familyGroups!, guardians: {...editContent.familyGroups!.guardians, description: e.target.value}}})}
                                />
                              </div>
                              <div className="pt-2 flex justify-end">
                                <button 
                                  onClick={handleSaveContent}
                                  disabled={isSaving}
                                  className="text-[9px] uppercase font-bold text-gold-500/40 hover:text-gold-500 flex items-center gap-2"
                                >
                                  {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Salvar Este
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* DeMolay */}
                          <div className="bg-masonic-dark/50 p-6 rounded-3xl border border-white/5 space-y-4">
                            <h4 className="text-gold-500 font-bold uppercase text-[11px] tracking-widest border-b border-gold-500/10 pb-2">Ordem DeMolay</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-[9px] text-white/40 uppercase mb-1">Título</label>
                                <input 
                                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm"
                                  value={editContent.familyGroups?.demolay.title || ''}
                                  onChange={e => setEditContent({...editContent, familyGroups: {...editContent.familyGroups!, demolay: {...editContent.familyGroups!.demolay, title: e.target.value}}})}
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-white/40 uppercase mb-1">URL da Foto</label>
                                <input 
                                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-[10px]"
                                  placeholder="Link direto (.jpg, .png)"
                                  value={editContent.familyGroups?.demolay.photo || ''}
                                  onChange={e => setEditContent({...editContent, familyGroups: {...editContent.familyGroups!, demolay: {...editContent.familyGroups!.demolay, photo: e.target.value}}})}
                                />
                                {editContent.familyGroups?.demolay.photo && (
                                  <div className="mt-2 w-full h-24 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                                    <img 
                                      src={editContent.familyGroups.demolay.photo} 
                                      alt="Preview" 
                                      className="w-full h-full object-cover" 
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Link+Invalido';
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                              <div>
                                <label className="block text-[9px] text-white/40 uppercase mb-1">Descrição</label>
                                <textarea 
                                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs outline-none"
                                  rows={3}
                                  value={editContent.familyGroups?.demolay.description || ''}
                                  onChange={e => setEditContent({...editContent, familyGroups: {...editContent.familyGroups!, demolay: {...editContent.familyGroups!.demolay, description: e.target.value}}})}
                                />
                              </div>
                              <div className="pt-2 flex justify-end">
                                <button 
                                  onClick={handleSaveContent}
                                  disabled={isSaving}
                                  className="text-[9px] uppercase font-bold text-gold-500/40 hover:text-gold-500 flex items-center gap-2"
                                >
                                  {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Salvar Este
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-8 border-t border-white/10 flex justify-end">
                          <button 
                            onClick={handleSaveContent}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-gold-500 text-masonic-dark px-10 py-4 rounded-xl font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-gold-400 transition-all font-sans"
                          >
                            {isSaving ? <RefreshCw className="animate-spin" /> : <Save />} Salvar Família
                          </button>
                        </div>
                      </div>
                    )}

                    {contentSubTab === 'social' && (
                      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center">
                          <h3 className="font-serif text-2xl gold-text uppercase tracking-widest border-b border-gold-500/20 pb-2">Álbum Social & Galeria</h3>
                          <button 
                            onClick={() => {
                              const newPhoto = { url: "", title: "Nova Foto", category: "Social" };
                              setEditContent({...editContent, gallery: [...(editContent.gallery || []), newPhoto]});
                            }}
                            className="px-6 py-3 bg-gold-500 text-masonic-dark font-black rounded-xl text-xs uppercase tracking-widest hover:bg-gold-400 transition-all shadow-xl"
                          >
                            + Adicionar Imagem
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {(editContent.gallery || []).map((photo, index) => (
                            <div key={index} className="bg-masonic-dark/50 p-6 rounded-2xl border border-white/5 relative group">
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
                                  <div className="w-full h-32 overflow-hidden rounded-xl border border-white/10 bg-black/20">
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
                                  <label className="block text-[9px] text-gold-500 uppercase font-black mb-1">Legenda</label>
                                  <input 
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs outline-none"
                                    value={photo.title}
                                    onChange={e => {
                                      const newGallery = editContent.gallery.map((p, i) => i === index ? { ...p, title: e.target.value } : p);
                                      setEditContent({...editContent, gallery: newGallery});
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] text-gold-500 uppercase font-black mb-1">URL da Imagem</label>
                                  <input 
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs outline-none"
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
                                    className="text-[8px] uppercase font-bold text-gold-500/40 hover:text-gold-500 flex items-center gap-1 transition-colors"
                                  >
                                    {isSaving ? <RefreshCw className="w-2 h-2 animate-spin" /> : <Save className="w-2 h-2" />} Salvar Foto
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
                            className="flex items-center gap-2 bg-gold-500 text-masonic-dark px-10 py-4 rounded-xl font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-gold-400 transition-all font-sans"
                          >
                            {isSaving ? <RefreshCw className="animate-spin" /> : <Save />} Salvar Álbum
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
                <h3 className="font-serif text-2xl gold-text uppercase tracking-widest underline decoration-gold-500/30 underline-offset-8">Acervo da Biblioteca</h3>
                <button 
                  onClick={async () => {
                    const newItem = {
                      title: "Novo Documento",
                      category: "Trabalho",
                      author: "Irmão...",
                      description: "",
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
                  className="px-6 py-3 bg-gold-500 text-masonic-dark font-black rounded-xl text-xs uppercase tracking-widest hover:bg-gold-400 transition-all shadow-xl"
                >
                  + Novo Item
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {libraryItems.map((item) => (
                  <div key={item.id} className="bg-masonic-dark/50 p-8 rounded-3xl border border-white/5 space-y-6">
                    <div className="flex justify-between items-start">
                       <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[9px] text-gold-500 uppercase font-black mb-1">Título</label>
                              <input 
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm outline-none"
                                value={item.title}
                                onChange={async (e) => await updateDoc(doc(db, 'library_items', item.id), { title: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-gold-500 uppercase font-black mb-1">Autor</label>
                              <input 
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm outline-none"
                                value={item.author}
                                onChange={async (e) => await updateDoc(doc(db, 'library_items', item.id), { author: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                                <label className="block text-[9px] text-gold-500 uppercase font-black mb-1">Link Youtube (se houver)</label>
                                <input 
                                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm outline-none"
                                  value={item.youtubeUrl || ''}
                                  placeholder="https://youtube.com/..."
                                  onChange={async (e) => await updateDoc(doc(db, 'library_items', item.id), { youtubeUrl: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-wrap gap-4 pt-2">
                               <label className="flex items-center gap-2 cursor-pointer group">
                                 <input 
                                   type="checkbox"
                                   checked={item.isPublic}
                                   onChange={async (e) => await updateDoc(doc(db, 'library_items', item.id), { isPublic: e.target.checked })}
                                   className="w-4 h-4 rounded border-white/20 bg-white/5 text-gold-500"
                                 />
                                 <span className="text-[10px] uppercase font-bold text-white/40 group-hover:text-white transition-colors">Público</span>
                               </label>
                               <label className="flex items-center gap-2 cursor-pointer group">
                                 <input 
                                   type="checkbox"
                                   checked={item.isHighlightedInCircle}
                                   onChange={async (e) => await updateDoc(doc(db, 'library_items', item.id), { isHighlightedInCircle: e.target.checked })}
                                   className="w-4 h-4 rounded border-white/20 bg-white/5 text-gold-500"
                                 />
                                 <span className="text-[10px] uppercase font-bold text-white/40 group-hover:text-white transition-colors">Destaque (Home)</span>
                               </label>
                               <label className="flex items-center gap-2 cursor-pointer group">
                                 <input 
                                   type="checkbox"
                                   checked={item.isFixedInCircle}
                                   onChange={async (e) => await updateDoc(doc(db, 'library_items', item.id), { isFixedInCircle: e.target.checked })}
                                   className="w-4 h-4 rounded border-white/20 bg-white/5 text-gold-500"
                                 />
                                 <span className="text-[10px] uppercase font-bold text-white/40 group-hover:text-white transition-colors">Sempre Fixo</span>
                               </label>
                               <label className="flex items-center gap-2 cursor-pointer group text-gold-500">
                                 <input 
                                   type="checkbox"
                                   checked={item.isCuriosity}
                                   onChange={async (e) => await updateDoc(doc(db, 'library_items', item.id), { isCuriosity: e.target.checked })}
                                   className="w-4 h-4 rounded border-gold-500/20 bg-white/5 text-gold-500"
                                 />
                                 <Star className="w-3 h-3" />
                                 <span className="text-[10px] uppercase font-black">Curiosidade</span>
                               </label>
                            </div>
                          </div>

                          <div className="flex flex-col justify-between">
                            <textarea 
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-xs outline-none flex-1 mb-4"
                              placeholder="Resumo ou descrição..."
                              rows={3}
                              value={item.description}
                              onChange={async (e) => await updateDoc(doc(db, 'library_items', item.id), { description: e.target.value })}
                            />
                            <button 
                              onClick={async () => {
                                if(confirm('Excluir este item permanentemente?')) {
                                  await deleteDoc(doc(db, 'library_items', item.id));
                                }
                              }}
                              className="flex items-center justify-center gap-2 text-red-500 hover:text-red-400 text-[10px] font-bold uppercase tracking-wider p-2"
                            >
                              <X className="w-4 h-4" /> Excluir Registro
                            </button>
                          </div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-12">
              {/* Copy Links Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gold-500/5 p-8 rounded-3xl border border-gold-500/10 backdrop-blur-sm">
                <div className="space-y-2">
                  <h4 className="text-gold-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                     <Globe className="w-4 h-4" /> Link do Site
                  </h4>
                  <div className="flex gap-2">
                    <input 
                      readOnly
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white/60 text-[10px] font-mono outline-none"
                      value={window.location.origin}
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin);
                        alert('Link do site copiado!');
                      }}
                      className="px-4 py-2 bg-gold-500 text-masonic-dark rounded-xl font-bold text-[10px] uppercase hover:bg-gold-400 transition-all"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-gold-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                     <FileText className="w-4 h-4" /> Instruções
                  </h4>
                  <div className="flex gap-2">
                    <input 
                      readOnly
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white/60 text-[10px] font-mono outline-none"
                      value={`${window.location.origin}/instrucoes`}
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/instrucoes`);
                        alert('Link de instruções copiado!');
                      }}
                      className="px-4 py-2 bg-gold-500 text-masonic-dark rounded-xl font-bold text-[10px] uppercase hover:bg-gold-400 transition-all"
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
                    <h3 className="font-serif text-2xl gold-text uppercase tracking-widest underline decoration-gold-500/30 underline-offset-8 text-left">Solicitações de Ingresso</h3>
                    <p className="text-gold-100/40 text-[9px] uppercase font-black tracking-widest mt-2">Pessoas que pediram acesso pelo site</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {membershipRequests.length === 0 ? (
                    <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.2em] italic py-8 text-center bg-white/5 border border-white/5 rounded-2xl">Nenhuma solicitação recebida</p>
                  ) : (
                    membershipRequests.map(req => (
                      <div key={req.id} className="bg-masonic-blue/40 p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-gold-500/30 transition-all">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border ${req.status === 'APPROVED' ? 'bg-green-500/10 border-green-500/30 text-green-500' : req.status === 'REJECTED' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-gold-500/10 border-gold-500/30 text-gold-500'}`}>
                            {req.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-white font-bold">{req.name}</h4>
                            <p className="text-gold-500/70 text-xs">{req.email}</p>
                            <p className="text-[8px] text-white/20 uppercase font-bold tracking-widest mt-1">
                              Solicitado em: {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleString('pt-BR') : 'Recent'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {req.status === 'PENDING' ? (
                            <>
                              <button 
                                onClick={() => handleUpdateStatusRequest(req.id, req.email, 'APPROVED')}
                                className="px-4 py-2 bg-green-500 text-masonic-dark font-black uppercase text-[9px] tracking-widest rounded-lg hover:bg-green-400 transition-all"
                              >
                                Aprovar
                              </button>
                              <button 
                                onClick={() => handleUpdateStatusRequest(req.id, req.email, 'REJECTED')}
                                className="px-4 py-2 bg-red-500/20 text-red-500 font-black border border-red-500/30 uppercase text-[9px] tracking-widest rounded-lg hover:bg-red-500 hover:text-white transition-all"
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
                            className="p-2 text-white/10 hover:text-red-500 transition-colors"
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
              <div className="space-y-6 pt-12 border-t border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-serif text-2xl gold-text uppercase tracking-widest underline decoration-gold-500/30 underline-offset-8 text-left">Convites Autorizados</h3>
                    <p className="text-gold-100/40 text-[9px] uppercase font-black tracking-widest mt-2">Emails que podem se cadastrar na área restrita</p>
                  </div>
                </div>

                <form onSubmit={handleInvite} className="bg-masonic-dark/50 p-8 rounded-3xl border border-gold-500/10 mb-8 backdrop-blur-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div className="space-y-2">
                      <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest ml-1">E-mail para Autorizar</label>
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold-500 transition-all font-sans"
                        placeholder="email@irmao.com"
                        value={newInviteEmail}
                        onChange={e => setNewInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-gold-500 uppercase font-black tracking-widest ml-1">Mensagem Pessoal (Opcional)</label>
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-gold-500 transition-all font-sans"
                        placeholder="Bem-vindo à nossa Arca, Ir."
                        value={newInviteMessage}
                        onChange={e => setNewInviteMessage(e.target.value)}
                      />
                    </div>
                  </div>
                  <button 
                    disabled={isInviting}
                    className="w-full mt-6 py-4 bg-gold-500 text-masonic-dark font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-gold-400 disabled:opacity-50 transition-all shadow-[0_0_30px_rgba(230,176,0,0.2)]"
                  >
                    {isInviting ? <RefreshCw className="animate-spin mx-auto" /> : 'Autorizar E-mail Individual'}
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {invitations.map(invite => (
                    <div key={invite.id} className="p-6 bg-white/5 rounded-2xl border border-white/5 relative group hover:border-gold-500/20 transition-all">
                      <button 
                        onClick={() => handleRemoveInvite(invite.email)}
                        className="absolute top-4 right-4 text-red-500/30 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-500">
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-white font-bold text-sm truncate">{invite.email}</p>
                          <p className="text-[8px] text-gold-500/50 uppercase font-black tracking-widest">
                            Autorizado em: {invite.createdAt?.toDate ? invite.createdAt.toDate().toLocaleString('pt-BR') : 'Recente'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <span className={`text-[8px] font-black tracking-widest uppercase px-2 py-1 rounded-full ${invite.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-gold-500/10 text-gold-500 border border-gold-500/20'}`}>
                          {invite.status === 'ACCEPTED' ? 'Cadastrado' : 'Pendente'}
                        </span>
                        {invite.status === 'ACCEPTED' && (
                           <span className="text-[8px] text-white/30 truncate max-w-[100px]">UID: {invite.userId}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Registered Users Section */}
              <div className="space-y-6 pt-12 border-t border-white/10">
                <div>
                   <h3 className="font-serif text-2xl gold-text uppercase tracking-widest underline decoration-gold-500/30 underline-offset-8 text-left">Membros Cadastrados</h3>
                   <p className="text-gold-100/40 text-[9px] uppercase font-black tracking-widest mt-2 text-left">Irmãos que já criaram suas contas e estão ativos</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {registeredUsers.map(user => (
                    <div key={user.id} className="p-6 bg-white/5 rounded-2xl border border-white/5 flex gap-4 items-center group hover:border-gold-500/20 transition-all">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-500 text-xl font-bold border border-gold-500/20 overflow-hidden">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            user.displayName?.[0]?.toUpperCase() || 'I'
                          )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-masonic-dark ${user.isOnline ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-500'}`} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-bold text-sm truncate">{user.displayName || 'Irmão'}</h4>
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
                        <p className="text-white/40 text-xs truncate">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <select 
                            className="text-[8px] px-2 py-0.5 bg-white/5 border-none rounded text-gold-500/60 uppercase font-black tracking-widest outline-none cursor-pointer hover:bg-white/10"
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
                            {user.isOnline ? 'Online agora' : user.lastSeen ? `Visto: ${new Date(user.lastSeen).toLocaleDateString()}` : 'Inativo'}
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
