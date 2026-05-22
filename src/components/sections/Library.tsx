import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Book, Video, FileText, ChevronRight, Star, Globe, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '@/src/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface LibraryProps {
  isFullPage?: boolean;
}

const DEFAULT_ITEMS = [
  { 
    id: 'fixed-curiosidades', 
    title: 'Curiosidades sobre a Arca e sobre a Loja', 
    category: 'Destaque Fixo', 
    isCuriosity: true, 
    path: '/curiosidades' 
  },
  { id: 'def1', type: 'Livro', title: 'A História da Maçonaria Universal', category: 'Livro', isFixedInCircle: true },
  { id: 'def2', type: 'Artigo', title: 'O Simbolismo da Arca no Rito Escocês', category: 'Artigo', isFixedInCircle: true },
  { id: 'def3', type: 'Palestra', title: 'Maçonaria e Ética na Sociedade Moderna', category: 'Palestra', isFixedInCircle: true },
  { id: 'def4', type: 'Artigo', title: 'As Colunas J e B: Significados Profundos', category: 'Artigo', isFixedInCircle: true },
];

export default function Library({ isFullPage = false }: LibraryProps) {
  const [displayItems, setDisplayItems] = useState<any[]>(DEFAULT_ITEMS);
  const [dbPublicItems, setDbPublicItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  useEffect(() => {
    // Queries only public items to be absolutely secure and fit metadata guidelines
    const q = query(
      collection(db, 'library_items'),
      where('isPublic', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let dbItems: any[] = [];
      if (!snapshot.empty) {
        dbItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      }
      setDbPublicItems(dbItems);

      // Homepage Círculo de Estudos: Curiosidades at position 1 (index 0) and 4 rotating public cards
      const others = dbItems.filter((item: any) => !item.isCuriosity && item.id !== 'fixed-curiosidades');
      const shuffledOthers = [...others].sort(() => 0.5 - Math.random());
      
      let selectedDynamic = shuffledOthers.slice(0, 4);
      
      // If database has fewer than 4 rotating public items, backfill with high-quality default items
      if (selectedDynamic.length < 4) {
        const remainingCount = 4 - selectedDynamic.length;
        const availableDefaults = DEFAULT_ITEMS.slice(1).filter(def => !selectedDynamic.some(sel => sel.title === def.title));
        selectedDynamic = [...selectedDynamic, ...availableDefaults.slice(0, remainingCount)];
      }

      const curiosidadesItem = DEFAULT_ITEMS[0];
      setDisplayItems([curiosidadesItem, ...selectedDynamic]);
    }, (error) => {
      console.error("Library items real-time loader error:", error);
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

  const handleItemClick = (item: any) => {
    if (item.isCuriosity) {
      window.location.href = item.path || '/curiosidades';
    } else if (item.type === 'video' && item.youtubeUrl) {
      window.open(item.youtubeUrl, '_blank');
    } else if (item.type === 'pdf' && item.url) {
      window.open(item.url, '_blank');
    } else if (item.type === 'link' && item.url) {
      window.open(item.url, '_blank');
    } else if (item.url) {
      window.open(item.url, '_blank');
    } else if (item.youtubeUrl) {
      window.open(item.youtubeUrl, '_blank');
    } else {
      window.location.href = `/biblioteca?id=${item.id}`;
    }
  };

  // Build the dynamic filter categories list
  const categoriesList = ['Todos', ...Array.from(new Set(dbPublicItems.map(item => item.category).filter(Boolean)))];

  // Filter public catalog elements
  const filteredCatalogItems = dbPublicItems.filter(item => {
    const matchesSearch = !searchTerm || 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isFullPage) {
    return (
      <div className="space-y-10">
        {/* Search controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-6 border-b border-[#0b1d3a]/5">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0b1d3a]/30" />
            <input 
              type="text" 
              placeholder="Buscar estudos, livros, artigos..."
              className="w-full bg-white/70 backdrop-blur-sm border border-[#0b1d3a]/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-[#0b1d3a] outline-none focus:border-[#c5a059]/50 shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
            {categoriesList.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-extrabold transition-all border ${
                  selectedCategory === cat 
                    ? 'bg-[#0b1d3a] text-white border-[#0b1d3a]' 
                    : 'bg-white/40 text-[#0b1d3a]/60 border-[#c5a059]/10 hover:bg-white hover:text-[#0b1d3a]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Grid */}
        {filteredCatalogItems.length === 0 ? (
          <div className="text-center py-20 bg-white/30 rounded-3xl border border-[#c5a059]/10 p-8 shadow-sm">
            <Book className="w-12 h-12 text-[#c5a059]/40 mx-auto mb-4" />
            <p className="text-[#0b1d3a]/60 font-sans text-sm font-semibold max-w-sm mx-auto">Nenhum item público encontrado com os termos ou cadastrado no painel administrativo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCatalogItems.map((item, i) => {
              const Icon = getIcon(item);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/70 backdrop-blur-sm border border-[#c5a059]/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white hover:border-[#c5a059]/40 hover:shadow-xl transition-all shadow-sm"
                >
                  <div className="mb-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[9px] bg-[#c5a059]/10 text-[#c5a059] px-2.5 py-1 rounded-full uppercase font-black tracking-wider">
                        {item.category || item.type || 'Público'}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059]">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-[#0b1d3a] font-serif font-bold text-lg mb-2 leading-snug">{item.title}</h3>
                    {item.author && (
                      <p className="text-[#0b1d3a]/50 text-xs mb-3 font-sans">Por: {item.author}</p>
                    )}
                    {item.description && (
                      <p className="text-[#0b1d3a]/70 text-xs font-sans text-justify leading-relaxed line-clamp-3">{item.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleItemClick(item)}
                    className="w-full py-3.5 bg-[#c5a059]/10 text-[#0b1d3a] hover:bg-[#c5a059] hover:text-[#0b1d3a] rounded-xl font-bold font-sans text-[10px] uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>{item.type === 'pdf' ? 'Visualizar PDF' : item.type === 'video' ? 'Assistir Vídeo' : 'Acessar Link'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <section id="biblioteca" className="py-24 bg-aged-beige border-t border-[#0b1d3a]/5">
      <div className="max-w-7xl mx-auto px-6">
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
                    onClick={() => handleItemClick(item)}
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
          
          <div className="lg:w-1/2 relative bg-transparent">
             <div className="aspect-square rounded-full border-2 border-[#c5a059]/10 flex items-center justify-center p-12 bg-[#c5a059]/5">
                <div className="aspect-square w-full rounded-full border border-[#c5a059]/20 bg-white/40 flex items-center justify-center p-8 shadow-inner">
                  <div className="text-center p-12 bg-[#0b1d3a] rounded-[2.5rem] border border-[#c5a059]/30 shadow-2xl relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#c5a059]/10 to-transparent opacity-50" />
                    <div className="relative z-10 transition-all duration-500">
                      <Book className="w-16 h-16 text-[#c5a059] mx-auto mb-6" />
                      <h3 className="font-serif text-2xl font-bold text-white mb-2">Biblioteca Arca 34</h3>
                      <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-black">Acesso Público ao Conhecimento</p>
                      <Link 
                        to="/biblioteca"
                        className="mt-10 block w-full py-4 bg-[#c5a059] text-[#0b1d3a] font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-white hover:text-[#0b1d3a] transition-all text-center shadow-xl font-sans"
                      >
                        Explorar Acervo
                      </Link>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
