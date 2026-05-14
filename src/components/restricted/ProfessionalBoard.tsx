import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, UserCircle, Plus, Search, X, Edit,
  MapPin, Building, Phone, Clock, MessageSquare,
  Handshake, Globe
} from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../../lib/firebase';
import { 
  collection, query, orderBy, onSnapshot, addDoc, 
  serverTimestamp, deleteDoc, doc, where, updateDoc
} from 'firebase/firestore';

interface BoardItem {
  id: string;
  type: 'JOB' | 'RESUME' | 'SERVICE';
  title: string;
  description: string;
  company?: string;
  location?: string;
  contact: string;
  website?: string;
  phone?: string;
  discount?: string;
  priceRange?: string;
  linkedin?: string;
  attachmentUrl?: string; // photo for jobs, cv link for resumes
  authorId: string;
  authorName: string;
  createdAt: any;
}

export default function ProfessionalBoard() {
  const [activeTab, setActiveTab] = useState<'JOB' | 'RESUME' | 'SERVICE'>('SERVICE');
  const [items, setItems] = useState<BoardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    contact: '',
    website: '',
    phone: '',
    discount: '',
    priceRange: '',
    linkedin: '',
    attachmentUrl: ''
  });

  useEffect(() => {
    const q = query(
      collection(db, 'professional_board'),
      where('type', '==', activeTab),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BoardItem[]);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'professional_board');
    });

    return () => unsubscribe();
  }, [activeTab]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      if (editingItemId) {
        await updateDoc(doc(db, 'professional_board', editingItemId), {
          ...newItem,
          updatedAt: serverTimestamp()
        });
        setEditingItemId(null);
      } else {
        await addDoc(collection(db, 'professional_board'), {
          ...newItem,
          type: activeTab,
          authorId: auth.currentUser.uid,
          authorName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0],
          createdAt: serverTimestamp()
        });
      }
      setShowAddModal(false);
      setNewItem({ 
        title: '', 
        description: '', 
        company: '', 
        location: '', 
        contact: '',
        website: '',
        phone: '',
        discount: '',
        priceRange: '',
        linkedin: '',
        attachmentUrl: ''
      });
    } catch (error) {
      handleFirestoreError(error, editingItemId ? OperationType.UPDATE : OperationType.CREATE, 'professional_board');
    }
  };

  const handleEdit = (item: BoardItem) => {
    setNewItem({
      title: item.title,
      description: item.description,
      company: item.company || '',
      location: item.location || '',
      contact: item.contact,
      website: item.website || '',
      phone: item.phone || '',
      discount: item.discount || '',
      priceRange: item.priceRange || '',
      linkedin: item.linkedin || '',
      attachmentUrl: item.attachmentUrl || ''
    });
    setEditingItemId(item.id);
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja remover este registro?')) return;
    try {
      await deleteDoc(doc(db, 'professional_board', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'professional_board');
    }
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Search and Tabs */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => setActiveTab('SERVICE')}
            className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'SERVICE' ? 'bg-gold-500 text-masonic-dark shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            <Handshake className="w-4 h-4" /> Vamos nos Ajudar
          </button>
          <button 
            onClick={() => setActiveTab('JOB')}
            className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'JOB' ? 'bg-gold-500 text-masonic-dark shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            <Briefcase className="w-4 h-4" /> Vagas de Emprego
          </button>
          <button 
            onClick={() => setActiveTab('RESUME')}
            className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'RESUME' ? 'bg-gold-500 text-masonic-dark shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            <UserCircle className="w-4 h-4" /> Currículos / Talentos
          </button>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500/30 group-focus-within:text-gold-500 transition-colors" />
            <input 
              type="text"
              placeholder="Buscar..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-xs text-white focus:outline-none focus:border-gold-500/50"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gold-500 text-masonic-dark rounded-xl hover:bg-gold-400 transition-all shadow-lg font-black uppercase text-[10px] tracking-widest"
          >
            <Plus className="w-4 h-4" />
            {activeTab === 'SERVICE' ? 'Cadastre sua Empresa / Serviço' : activeTab === 'JOB' ? 'Cadastrar Vaga' : 'Cadastrar Currículo'}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-gold-500/30 transition-all group relative overflow-hidden flex flex-col"
          >
             <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
               {item.type === 'SERVICE' ? <Handshake className="w-16 h-16 text-gold-500" /> : item.type === 'JOB' ? <Briefcase className="w-16 h-16 text-gold-500" /> : <UserCircle className="w-16 h-16 text-gold-500" />}
             </div>
 
             <div className="relative z-10 flex-1 flex flex-col space-y-4">
               <div className="flex justify-between items-start">
                 <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded border ${item.type === 'SERVICE' ? 'bg-gold-500/10 text-gold-500 border-gold-500/20' : item.type === 'JOB' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                   {item.type === 'SERVICE' ? 'Serviço / Loja' : item.type === 'JOB' ? 'Oportunidade' : 'Talento'}
                 </span>
                 {auth.currentUser?.uid === item.authorId && (
                   <div className="flex gap-2">
                     <button onClick={() => handleEdit(item)} className="text-gold-500/50 hover:text-gold-500 transition-colors p-1" title="Editar"><Edit className="w-4 h-4" /></button>
                     <button onClick={() => handleDelete(item.id)} className="text-red-500/50 hover:text-red-500 transition-colors">
                       <X className="w-4 h-4" />
                     </button>
                   </div>
                 )}
               </div>

               <div className="flex-1">
                 <h3 className="text-lg font-serif font-bold text-white group-hover:gold-text transition-colors">
                   {item.title}
                 </h3>
                 {(item.company || item.location) && (
                   <p className="flex items-center gap-1.5 text-gold-400/80 text-[10px] font-black uppercase tracking-widest mt-1">
                     {item.type === 'RESUME' ? <MapPin className="w-3 h-3" /> : <Building className="w-3 h-3" />}
                     {item.company || item.location}
                   </p>
                 )}

                 {item.type === 'JOB' && item.attachmentUrl && (
                   <div className="mt-4 rounded-xl overflow-hidden aspect-video border border-white/10">
                     <img src={item.attachmentUrl} alt="Vaga" className="w-full h-full object-cover" />
                   </div>
                 )}

                 <p className="text-white/60 text-xs leading-relaxed line-clamp-4 mt-4">
                   {item.description}
                 </p>
               </div>

               <div className="space-y-3 pt-4 border-t border-white/5">
                 {item.discount && (
                   <div className="bg-gold-500/10 p-2 rounded-lg border border-gold-500/20">
                     <p className="text-gold-500 text-[9px] font-black uppercase tracking-widest">✨ Desconto Irmão: {item.discount}</p>
                   </div>
                 )}
                 
                 <div className="grid grid-cols-2 gap-2">
                    {(item.phone || item.contact.includes('@')) ? (
                       <a 
                       href={item.phone ? `https://wa.me/${item.phone.replace(/\D/g,'')}` : `mailto:${item.contact}`}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-gold-500/50 p-2 rounded-xl text-white text-[10px] font-bold transition-all"
                     >
                       <Phone className="w-3 h-3 text-gold-500" /> Contato
                     </a>
                    ) : (
                      <div className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 p-2 rounded-xl text-white/40 text-[10px]">
                        <MessageSquare className="w-3 h-3" /> {item.contact}
                      </div>
                    )}

                    {(item.website || item.linkedin || item.attachmentUrl) && (
                      <a 
                        href={item.website || item.linkedin || item.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-gold-500/10 border border-gold-500/20 hover:bg-gold-500/20 p-2 rounded-xl text-gold-500 text-[10px] font-bold transition-all"
                      >
                        <Globe className="w-3 h-3" /> {item.type === 'RESUME' ? 'CV/Perfil' : 'Ver Mais'}
                      </a>
                    )}
                 </div>
                 
                 {item.priceRange && (
                   <div className="text-[9px] text-white/30 uppercase tracking-widest text-center italic">
                     Valores: {item.priceRange}
                   </div>
                 )}
               </div>

               <div className="flex items-center justify-between pt-2">
                 <span className="text-[8px] text-white/20 uppercase tracking-widest">Postado por: {item.authorName}</span>
                 <span className="text-[8px] text-white/20">{item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleDateString() : 'Recent'}</span>
               </div>
             </div>
          </motion.div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-masonic-dark/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-masonic-blue border border-gold-500/30 rounded-[2rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-white uppercase tracking-wider">
                  {editingItemId ? 'Editar Registro' : (activeTab === 'SERVICE' ? 'Cadastrar Serviço / Loja' : activeTab === 'JOB' ? 'Cadastrar Vaga' : 'Cadastrar Currículo')}
                </h2>
                <button onClick={() => setShowAddModal(false)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black tracking-widest text-gold-500 ml-1">
                    {activeTab === 'SERVICE' ? 'Nome do Serviço / Negócio' : activeTab === 'JOB' ? 'Título da Vaga' : 'Cargo / Área de Atuação'}
                  </label>
                  <input 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-gold-500/50"
                    placeholder={activeTab === 'SERVICE' ? "Ex: Advocacia Silva" : "Ex: Desenvolvedor React"}
                    value={newItem.title}
                    onChange={e => setNewItem({...newItem, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black tracking-widest text-gold-500 ml-1">
                      {activeTab === 'SERVICE' ? 'Empresa / Responsável' : activeTab === 'JOB' ? 'Empresa' : 'Localização'}
                    </label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-gold-500/50"
                      value={activeTab === 'RESUME' ? newItem.location : newItem.company}
                      onChange={e => {
                        if (activeTab === 'RESUME') setNewItem({...newItem, location: e.target.value});
                        else setNewItem({...newItem, company: e.target.value});
                      }}
                    />
                  </div>
                  {activeTab === 'SERVICE' && (
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black tracking-widest text-gold-500 ml-1">WhatsApp / Tel</label>
                      <input 
                        required
                        type="tel" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-gold-500/50"
                        placeholder="(00) 00000-0000"
                        value={newItem.phone}
                        onChange={e => setNewItem({...newItem, phone: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                {activeTab === 'SERVICE' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black tracking-widest text-gold-500 ml-1">Desconto Irmão?</label>
                      <input 
                         type="text" 
                         className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-gold-500/50"
                         placeholder="Ex: 15% OFF"
                         value={newItem.discount}
                         onChange={e => setNewItem({...newItem, discount: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black tracking-widest text-gold-500 ml-1">Faixa de Preço</label>
                      <input 
                         type="text" 
                         className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-gold-500/50"
                         placeholder="Ex: R$ 50 - R$ 200"
                         value={newItem.priceRange}
                         onChange={e => setNewItem({...newItem, priceRange: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'SERVICE' && (
                   <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black tracking-widest text-gold-500 ml-1">Site / Portfólio (URL)</label>
                    <input 
                      type="url" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-gold-500/50"
                      placeholder="https://..."
                      value={newItem.website}
                      onChange={e => setNewItem({...newItem, website: e.target.value})}
                    />
                  </div>
                )}

                {(activeTab === 'JOB' || activeTab === 'RESUME') && (
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black tracking-widest text-gold-500 ml-1">
                      {activeTab === 'RESUME' ? 'Link do Currículo / LinkedIn' : 'Link da Vaga / Foto (URL)'}
                    </label>
                    <input 
                      type="url" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-gold-500/50"
                      placeholder="https://..."
                      value={activeTab === 'RESUME' ? newItem.linkedin : newItem.attachmentUrl}
                      onChange={e => {
                        if (activeTab === 'RESUME') setNewItem({...newItem, linkedin: e.target.value});
                        else setNewItem({...newItem, attachmentUrl: e.target.value});
                      }}
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black tracking-widest text-gold-500 ml-1">Contato Geral</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-gold-500/50"
                    placeholder="Email ou link de contato..."
                    value={newItem.contact}
                    onChange={e => setNewItem({...newItem, contact: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black tracking-widest text-gold-500 ml-1">Descrição / Detalhes</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-gold-500/50 resize-none"
                    value={newItem.description}
                    onChange={e => setNewItem({...newItem, description: e.target.value})}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-gold-500 text-masonic-dark rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gold-400 transition-all mt-4"
                >
                  {editingItemId ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
