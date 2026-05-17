import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Book, Video, FileText, ChevronRight, Star, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '@/src/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface LibraryProps {
  isFullPage?: boolean;
}

export default function Library({ isFullPage = false }: LibraryProps) {
  const [displayItems, setDisplayItems] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'library_items'),
      where('isPublic', '==', true),
      where('isHighlightedInCircle', '==', true)
    );

    const defaultItems = [
      { id: 'def1', type: 'Livro', title: 'A História da Maçonaria Universal', category: 'Livro', isFixedInCircle: true },
      { id: 'def2', type: 'Artigo', title: 'O Simbolismo da Arca no Rito Escocês', category: 'Artigo', isFixedInCircle: true },
      { id: 'def3', type: 'Palestra', title: 'Maçonaria e Ética na Sociedade Moderna', category: 'Palestra', isFixedInCircle: true },
      { id: 'def4', type: 'Artigo', title: 'As Colunas J e B: Significados Profundos', category: 'Artigo', isFixedInCircle: true },
    ];

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      
      const fixed = dbItems.filter((item: any) => item.isFixedInCircle);
      const others = dbItems.filter((item: any) => !item.isFixedInCircle);
      const shuffledOthers = others.sort(() => 0.5 - Math.random());
      
      let selectedDynamic = [...fixed, ...shuffledOthers];
      
      if (selectedDynamic.length < 4) {
        const remainingCount = 4 - selectedDynamic.length;
        const availableDefaults = defaultItems.filter(def => !selectedDynamic.some(sel => sel.title === def.title));
        selectedDynamic = [...selectedDynamic, ...availableDefaults.slice(0, remainingCount)];
      }

      const curiosidadesItem = {
        id: 'fixed-curiosidades',
        title: 'Curiosidades sobre a Arca e sobre a Loja',
        category: 'Destaque Fixo',
        isCuriosity: true,
        path: '/curiosidades'
      };

      setDisplayItems([curiosidadesItem, ...selectedDynamic.slice(0, 4)]);
    }, (error) => {
      console.error("Library highlights error:", error);
      setDisplayItems([
        { id: 'fixed-curiosidades', title: 'Curiosidades sobre a Arca e sobre a Loja', category: 'Destaque Fixo', isCuriosity: true, path: '/curiosidades' },
        ...defaultItems
      ]);
    });

    return () => unsubscribe();
  }, []);

  const getIcon = (item: any) => {
    if (item.isCuriosity) return Star;
    if (item.type === 'video' || item.youtubeUrl || item.category?.toLowerCase().includes('palestra')) return Video;
    if (item.type === 'pdf') return FileText;
    if (item.type === 'link') return Globe;
    return FileText;
  };

  const content = (
    <div className="flex flex-col lg:flex-row gap-16 items-center">
      <div className="lg:w-1/2">
        <div className="flex items-center gap-3 text-[#c5a059] mb-4 uppercase tracking-[0.4em] text-[10px] font-black">
          <Book className="w-4 h-4" />
          Conhecimento
        </div>
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#0b1d3a] mb-6 uppercase tracking-wider leading-tight">
          <span className="text-[#c5a059]">Círculo</span> de <span className="text-[#c5a059]">Estudos</span>
        </h2>
        <p className="text-[#0b1d3a]/70 text-lg mb-10 leading-relaxed font-sans text-justify">
          Um espaço dedicado à cultura, história e ao aprofundamento intelectual. Explore nossa seleção de materiais públicos sobre a Ordem e seus princípios fundamentais.
        </p>
        <div className="flex flex-col gap-4">
          {displayItems.map((item, i) => {
            const Icon = getIcon(item);
            return (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white/50 border border-[#c5a059]/10 hover:bg-white hover:border-[#c5a059]/40 hover:shadow-lg transition-all cursor-pointer group shadow-sm"
                onClick={() => {
                  if (item.isCuriosity) {
                    window.location.href = item.path;
                  } else if (item.type === 'video' && item.youtubeUrl) {
                    window.open(item.youtubeUrl, '_blank');
                  } else if (item.type === 'pdf' && item.url) {
                    window.open(item.url, '_blank');
                  } else if (item.type === 'link' && item.url) {
                    window.open(item.url, '_blank');
                  } else if (item.youtubeUrl) {
                    // Fallback for old items
                    window.open(item.youtubeUrl, '_blank');
                  } else {
                    window.location.href = `/biblioteca?id=${item.id}`;
                  }
                }}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${item.isCuriosity ? 'bg-[#c5a059] text-white shadow-[#c5a059]/30' : 'bg-[#c5a059]/10 text-[#c5a059]'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <span className={`text-[10px] uppercase font-black tracking-widest ${item.isCuriosity ? 'text-[#c5a059]' : 'text-[#c5a059]/60'}`}>{item.category || 'Sugestão'}</span>
                  <h4 className="text-[#0b1d3a] font-bold text-sm tracking-tight">{item.title}</h4>
                </div>
                <ChevronRight className={`w-4 h-4 ${item.isCuriosity ? 'text-[#c5a059]' : 'text-[#c5a059]/40 group-hover:text-[#c5a059] group-hover:translate-x-1'} transition-all`} />
              </motion.div>
            );
          })}
        </div>
      </div>
      
      <div className="lg:w-1/2 relative">
         <div className="aspect-square rounded-full border-2 border-[#c5a059]/10 flex items-center justify-center p-12 bg-[#c5a059]/5">
            <div className="aspect-square w-full rounded-full border border-[#c5a059]/20 bg-white/40 flex items-center justify-center p-8 shadow-inner">
              <div className="text-center p-12 bg-[#0b1d3a] rounded-[2.5rem] border border-[#c5a059]/30 shadow-2xl relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#c5a059]/10 to-transparent opacity-50" />
                <div className="relative z-10 transition-all duration-500">
                  <Book className="w-16 h-16 text-[#c5a059] mx-auto mb-6" />
                  <h3 className="font-serif text-2xl font-bold text-white mb-2">Biblioteca Arca 34</h3>
                  <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-black">Acesso Público ao Conhecimento</p>
                  {!isFullPage ? (
                    <Link 
                      to="/biblioteca"
                      className="mt-10 block w-full py-4 bg-[#c5a059] text-[#0b1d3a] font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-white hover:text-[#0b1d3a] transition-all text-center shadow-xl"
                    >
                      Explorar Acervo
                    </Link>
                  ) : (
                    <button className="mt-10 w-full py-4 bg-[#c5a059] text-[#0b1d3a] font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-white transition-all shadow-xl">
                      Fazer Login
                    </button>
                  )}
                </div>
              </div>
            </div>
         </div>
      </div>
    </div>
  );

  if (isFullPage) return content;

  return (
    <section id="biblioteca" className="py-24 bg-aged-beige border-t border-[#0b1d3a]/5">
      <div className="max-w-7xl mx-auto px-6">
        {content}
      </div>
    </section>
  );
}
