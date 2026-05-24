import React, { useState, useEffect } from 'react';
import { BookOpen, MessageSquare, Eye, Send, Edit, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';

interface Comment {
  id: string;
  itemId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: any;
}

export default function LibraryItemCard({ item, index, isHighlighted, isExpanded, onToggleComments, onShare, onDelete, onEdit }: any) {
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
    <div className={`bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] border ${isHighlighted ? 'border-[#c5a059]' : 'border-[#0b1d3a]/10'} relative flex flex-col group transition-all hover:border-[#c5a059]/30 shadow-md text-left`}>
      {onDelete && (
        <div className="absolute top-4 right-4 flex gap-1.5">
           <button onClick={onEdit} className="p-1.5 bg-[#0b1d3a]/5 text-[#c5a059] hover:bg-[#c5a059] hover:text-[#0b1d3a] rounded-md transition-all">
             <Edit className="w-3.5 h-3.5" />
           </button>
           <button onClick={onDelete} className="p-1.5 bg-red-50/5 text-red-600 hover:bg-red-50 hover:text-white rounded-md transition-all">
             <Trash2 className="w-3.5 h-3.5" />
           </button>
        </div>
      )}
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 bg-[#c5a059]/10 rounded-xl text-[#c5a059] shadow-inner"><BookOpen className="w-5 h-5" /></div>
        <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-[#0b1d3a]/5 border border-[#0b1d3a]/10 rounded-full text-[#c5a059]">{item.fileType}</span>
      </div>
      <h3 className="font-serif text-base md:text-xl font-bold text-[#0b1d3a] mb-1 leading-tight group-hover:text-[#c5a059] transition-colors">{item.title}</h3>
      <p className="text-[#c5a059]/80 text-[9px] uppercase tracking-wider font-black mb-3">{item.category}</p>
      <p className="text-[#0b1d3a]/80 text-xs italic leading-relaxed mb-6 flex-1 font-serif">"{item.description || "Sem descrição disponível."}"</p>
      
      <div className="pt-3 border-t border-[#0b1d3a]/5 flex items-center justify-between mt-auto">
         <div className="flex items-center gap-1 min-w-0">
           <span className="text-[8px] text-[#0b1d3a]/30 uppercase font-black shrink-0">Por:</span>
           <span className="text-[9px] text-[#c5a059] uppercase font-black truncate">{item.author || "Anônimo"}</span>
         </div>
         <div className="flex gap-1.5 shrink-0">
            <button onClick={onToggleComments} className="p-2 bg-[#0b1d3a]/5 border border-[#0b1d3a]/10 rounded-lg text-[#c5a059] hover:bg-[#c5a059] hover:text-[#0b1d3a] transition-all relative">
               <MessageSquare className="w-3.5 h-3.5" />
               {comments.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#c5a059] text-[#0b1d3a] text-[8px] flex items-center justify-center rounded-full font-black">{comments.length}</span>}
            </button>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#0b1d3a]/5 border border-[#0b1d3a]/10 rounded-lg text-[#c5a059] hover:bg-[#c5a059] hover:text-[#0b1d3a] transition-all"><Eye className="w-3.5 h-3.5" /></a>
         </div>
      </div>
      <button onClick={onShare} className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-[#0b1d3a]/5 border border-[#0b1d3a]/10 text-[#0b1d3a] rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-[#c5a059] hover:text-[#0b1d3a] transition-all"><MessageSquare className="w-3.5 h-3.5" /> Compartilhar</button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="mt-4 pt-4 border-t border-[#0b1d3a]/10 overflow-hidden">
             <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar mb-3">
                {comments.map(c => (
                  <div key={c.id} className="p-2.5 bg-[#0b1d3a]/5 rounded-xl border border-[#0b1d3a]/10">
                    <p className="text-[8px] font-black text-[#c5a059] uppercase tracking-wider mb-0.5">{c.userName}</p>
                    <p className="text-xs text-[#0b1d3a]/80 font-medium">{c.text}</p>
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
                <input className="w-full bg-[#0b1d3a]/5 border border-[#0b1d3a]/10 p-2.5 pr-8 rounded-xl text-xs text-[#0b1d3a] font-bold outline-none placeholder-[#0b1d3a]/30" placeholder="Sua contribuição..." value={newComment} onChange={e => setNewComment(e.target.value)} />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-[#c5a059] hover:text-[#0b1d3a] transition-colors"><Send className="w-3.5 h-3.5" /></button>
             </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
