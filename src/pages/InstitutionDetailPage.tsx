import React from 'react';
import { motion } from 'motion/react';
import { Shield, Target, History, Heart, Quote } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useContent } from '../context/ContentContext';

// Este componente servirá de base (você pode carregar 'demolay', 'guardians' via rotas depois)
export default function AffiliatedOrgPage() {
  const { content } = useContent();
  const groupKey = 'daughters'; // Mudará para ser dinâmico por rota depois
  const data = content.familyGroups?.[groupKey] || {
    name: 'Garotas do Arco-Íris',
    subTitle: 'Guarás • DF',
    description: '',
    mission: '',
    vision: '',
    history: '',
    image: 'https://cdn.pixabay.com/photo/2016/11/19/18/31/colored-1840004_1280.jpg'
  };

  const alignClass = content.familyGroups?.textAlign === 'left' ? 'text-left' :
                     content.familyGroups?.textAlign === 'right' ? 'text-right' :
                     content.familyGroups?.textAlign === 'center' ? 'text-center' :
                     'text-justify';

  return (
    <div className="min-h-screen bg-aged-beige flex flex-col font-sans overflow-x-hidden w-full selection:bg-[#c5a059]/30 selection:text-[#0b1d3a]">
      <Navbar />
      <main className="flex-1 pt-28 pb-20 px-4 md:px-6 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          <div className="relative mb-8 p-1 rounded-[2.5rem] bg-gradient-to-br from-[#c5a059]/20 via-transparent to-[#0b1d3a]/5 overflow-hidden w-full">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-8 bg-white md:bg-white/40 rounded-[2.3rem] border border-white/40 w-full">
              <div className="flex flex-col sm:flex-row items-center gap-6 min-w-0 w-full md:w-auto">
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#0b1d3a] border-4 border-[#c5a059]/20 flex items-center justify-center text-[#c5a059] shadow-2xl relative overflow-hidden shrink-0">
                    <Shield className="w-8 h-8 md:w-10 md:h-10 relative z-10" />
                 </div>
                 <div className="text-center sm:text-left min-w-0 w-full">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c5a059] mb-1 block truncate">Nossa Família</span>
                    <h1 className="font-serif text-xl md:text-3xl font-bold text-[#0b1d3a] uppercase tracking-wider leading-none break-words max-w-full">
                       {data.name} <span className="gold-text block sm:inline">{data.subTitle}</span>
                    </h1>
                 </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full mb-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-left space-y-6">
                <span className="inline-block px-3 py-1 bg-[#c5a059]/10 text-[#c5a059] text-[9px] font-black uppercase tracking-widest rounded-full border border-[#c5a059]/20 shadow-inner">Organização Paramaçônica</span>
                <h2 className="font-serif text-2xl md:text-5xl font-black text-[#0b1d3a] uppercase tracking-widest break-words leading-[1.15]">
                  Sobre <br /><span className="gold-text">Nós</span>
                </h2>
                <p className={`text-[#0b1d3a]/70 text-xs md:text-base leading-relaxed italic max-w-xl ${alignClass}`}>
                  {data.description || "Descrição ainda não cadastrada."}
                </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="aspect-[4/5] bg-white rounded-[2.5rem] p-4 shadow-xl border border-[#0b1d3a]/5 overflow-hidden">
               <img src={data.image || data.photo || data.logo} alt="Família" className="w-full h-full object-cover rounded-[2rem] shadow-inner" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-12">
              {[
                { type: 'mission', icon: Target, title: 'Nossa Missão', text: data.mission },
                { type: 'vision', icon: Target, title: 'Nossa Visão', text: data.vision },
                { type: 'history', icon: History, title: 'História', text: data.history }
              ].map((card) => {
                  const CardIcon = card.icon;
                  return (
                      <div key={card.type} className="aspect-[3/2] bg-white p-6 md:p-8 rounded-[2.5rem] border border-[#0b1d3a]/10 hover:border-[#c5a059]/30 transition-all shadow-md group relative overflow-hidden text-left w-full flex flex-col justify-between">
                          <div className="flex items-center gap-4 border-b border-[#0b1d3a]/5 pb-4">
                             <div className="w-12 h-12 rounded-xl bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059] shrink-0">
                                <CardIcon className="w-6 h-6" />
                             </div>
                             <h4 className="font-cinzel text-base md:text-xl font-bold text-[#0b1d3a]">{card.title}</h4>
                          </div>
                          <div className="relative pt-4 flex-1">
                             <p className={`text-[#0b1d3a]/80 text-[11px] font-medium leading-relaxed font-sans line-clamp-4 ${alignClass}`}>{card.text}</p>
                             <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent" />
                          </div>
                      </div>
                  );
              })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}