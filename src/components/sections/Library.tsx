import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Book, Video, FileText, ChevronRight, Star } from 'lucide-react';
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
    if (item.youtubeUrl || item.category?.toLowerCase().includes('palestra')) return Video;
    return FileText;
  };

  const content = (
    <div className="flex flex-col lg:flex-row gap-12 items-center">
      <div className="lg:w-1/2">
        <h2 className="font-serif text-3xl font-bold text-white mb-4">
          Círculo de <span className="gold-text">Estudos</span>
        </h2>
        <p className="text-gold-50/70 text-base mb-6 leading-relaxed font-sans">
          Um espaço dedicado à cultura, história e ao aprofundamento intelectual. Explore nossa seleção de materiais públicos sobre a Ordem e seus princípios.
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
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-gold-500/5 hover:border-gold-500/20 transition-all cursor-pointer group"
                onClick={() => {
                  if (item.isCuriosity) window.location.href = item.path;
                  else if (item.youtubeUrl) window.open(item.youtubeUrl, '_blank');
                  else window.location.href = `/biblioteca?id=${item.id}`;
                }}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.isCuriosity ? 'bg-gold-500 shadow-[0_0_15px_rgba(230,176,0,0.3)]' : 'bg-gold-500/10'}`}>
                  <Icon className={`${item.isCuriosity ? 'text-masonic-dark' : 'text-gold-500'} w-6 h-6`} />
                </div>
                <div className="flex-1">
                  <span className={`text-[10px] uppercase font-bold tracking-widest ${item.isCuriosity ? 'text-gold-500' : 'text-gold-500/60'}`}>{item.category || 'Sugestão'}</span>
                  <h4 className="text-white font-bold text-sm tracking-tight">{item.title}</h4>
                </div>
                <ChevronRight className={`w-4 h-4 ${item.isCuriosity ? 'text-gold-500' : 'text-gold-500/40 group-hover:text-gold-500'} transition-colors`} />
              </motion.div>
            );
          })}
        </div>
      </div>
      
      <div className="lg:w-1/2 relative">
         <div className="aspect-square rounded-full border-2 border-gold-500/10 flex items-center justify-center p-12">
            <div className="aspect-square w-full rounded-full border border-gold-500/20 bg-gradient-to-br from-gold-500/10 to-transparent flex items-center justify-center p-8">
              <div className="text-center p-8 bg-masonic-dark/80 backdrop-blur rounded-3xl border border-gold-500/30 shadow-2xl relative group overflow-hidden">
                <div className="relative z-10 transition-all duration-500">
                  <Book className="w-16 h-16 text-gold-500 mx-auto mb-4" />
                  <h3 className="font-serif text-2xl font-bold text-white mb-2">Biblioteca Arca 34</h3>
                  <p className="text-gold-50/50 text-xs uppercase tracking-widest">Acesso Público ao Conhecimento</p>
                  {!isFullPage ? (
                    <Link 
                      to="/biblioteca"
                      className="mt-8 block w-full py-3 bg-gold-500 text-masonic-dark font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-gold-600 transition-colors text-center"
                    >
                      Explorar Acervo
                    </Link>
                  ) : (
                    <button className="mt-8 w-full py-3 bg-gold-500 text-masonic-dark font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-gold-600 transition-colors">
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
    <section id="biblioteca" className="py-12 bg-masonic-dark border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        {content}
      </div>
    </section>
  );
}
