import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, Target, History, Heart, Quote, Star } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useContent } from '../context/ContentContext';

export default function AffiliatedOrgPage() {
  const { content } = useContent();
  const { id } = useParams<{ id: string }>();

  // Detecta dinamicamente a paramaçônica correspondente com base na URL
  let groupKey: 'guardians' | 'demolay' | 'daughters' = 'daughters';
  if (id === 'guardias-da-alianca') {
    groupKey = 'guardians';
  } else if (id === 'demolay') {
    groupKey = 'demolay';
  } else if (id === 'rainbow-girls') {
    groupKey = 'daughters';
  }

  const data = content.familyGroups?.[groupKey] || {
    name: 'Garotas do Arco-Íris',
    subTitle: 'Guarás • DF',
    description: '',
    mission: '',
    vision: '',
    history: '',
    image: 'https://cdn.pixabay.com/photo/2016/11/19/18/31/colored-1840004_1280.jpg'
  };

  const groupIcons = {
    guardians: Heart,
    demolay: Shield,
    daughters: Star,
  };
  const GroupIcon = groupIcons[groupKey] || Shield;

  const alignClass = content.familyGroups?.textAlign === 'left' ? 'text-left' :
                     content.familyGroups?.textAlign === 'right' ? 'text-right' :
                     content.familyGroups?.textAlign === 'center' ? 'text-center' :
                     'text-justify';

  return (
    <div className="min-h-screen bg-aged-beige flex flex-col font-sans overflow-x-hidden w-full selection:bg-[#c5a059]/30 selection:text-[#0b1d3a]">
      <Navbar />
      <main className="flex-1 pt-28 pb-20 px-4 md:px-6 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header Banner com Logo Centralizado e Linha Fina Dourada */}
          <div className="relative mb-12 p-1 rounded-[2.5rem] bg-gradient-to-br from-[#c5a059]/20 via-transparent to-[#0b1d3a]/5 overflow-hidden w-full">
            <div className="flex flex-col items-center text-center justify-center gap-6 p-8 md:p-12 bg-white md:bg-white/40 rounded-[2.3rem] border border-white/40 w-full">
              
              {/* Logotipo Redondo com Diâmetro Customizado e Linha Fina Dourada (Baseado na Home, de tamanho robusto) */}
              <div className="relative mb-4">
                {/* Linha fina dourada externa */}
                <div className="absolute inset-0 border border-[#c5a059]/40 rounded-full scale-115 pointer-events-none" />
                
                {/* Container do Logo */}
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-white border-2 border-[#c5a059]/50 flex items-center justify-center overflow-hidden relative shadow-xl">
                  {data.image || data.logo || data.photo ? (
                    <img 
                      src={data.image || data.logo || data.photo} 
                      alt={data.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <GroupIcon className="w-16 h-16 text-[#c5a059]" />
                  )}
                </div>
              </div>

              {/* Título e Subtítulo Centralizados */}
              <div className="text-center min-w-0 w-full max-w-2xl">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c5a059] mb-2 block">Nossa Família</span>
                 <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#0b1d3a] uppercase tracking-wider leading-tight">
                    {data.name}
                 </h1>
                 <span className="gold-text font-serif text-sm md:text-lg block mt-2 tracking-widest">{data.subTitle}</span>
              </div>
            </div>
          </div>

          {/* Seção Sobre Nós: Mantido 100% Congelado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full mb-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-left space-y-6">
                <span className="inline-block px-3 py-1 bg-[#c5a059]/10 text-[#c5a059] text-[9px] font-black uppercase tracking-widest rounded-full border border-[#c5a059]/20 shadow-inner">Organização Paramaçônica</span>
                <h2 className="font-serif text-2xl md:text-5xl font-black text-[#0b1d3a] uppercase tracking-widest break-words leading-[1.15]">
                  Sobre <br /><span className="gold-text">Nós</span>
                </h2>
                <p className={`text-[#0b1d3a]/70 text-xs md:text-base leading-relaxed italic max-w-xl ${alignClass}`}>
                  {data.description || "Descrição ainda não cadastrada."}
                </p>
                {data.website && (
                  <div className="pt-4">
                    <a 
                      href={data.website.startsWith('http') ? data.website : `https://${data.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#0b1d3a] hover:bg-[#c5a059] text-[#f4efe2] hover:text-[#0b1d3a] rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-300"
                    >
                      Acessar Portal Oficial
                    </a>
                  </div>
                )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="aspect-square bg-white rounded-[2.5rem] p-4 shadow-xl border border-[#0b1d3a]/5 overflow-hidden max-w-[400px] w-full mx-auto"
            >
               <img 
                 src={data.image || data.photo || data.logo} 
                 alt="Família" 
                 className="w-full h-full object-contain rounded-[2rem] shadow-inner" 
                 referrerPolicy="no-referrer"
               />
            </motion.div>
          </div>

          {/* Seções de Missão, Visão e História dispostas de forma Vertical, adaptando sua altura organicamente (h-auto) */}
          <div className="flex flex-col gap-8 w-full mb-12">
              {[
                { type: 'mission', icon: Target, title: 'Nossa Missão', text: data.mission },
                { type: 'vision', icon: Target, title: 'Nossa Visão', text: data.vision },
                { type: 'history', icon: History, title: 'História', text: data.history },
                ...(data.historyWithLodge ? [{ type: 'lodgeHistory', icon: Shield, title: 'Nossa História com a Loja', text: data.historyWithLodge }] : [])
              ].map((card) => {
                  const CardIcon = card.icon;
                  return (
                      <div key={card.type} className="h-auto bg-white p-6 md:p-8 rounded-[2.5rem] border border-[#0b1d3a]/10 hover:border-[#c5a059]/30 transition-all shadow-md group relative overflow-hidden text-left w-full flex flex-col gap-4">
                          <div className="flex items-center gap-4 border-b border-[#0b1d3a]/5 pb-4">
                             <div className="w-12 h-12 rounded-xl bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059] shrink-0">
                                <CardIcon className="w-6 h-6" />
                             </div>
                             <h4 className="font-cinzel text-base md:text-xl font-bold text-[#0b1d3a]">{card.title}</h4>
                          </div>
                          <div className="relative">
                             <p className={`text-[#0b1d3a]/80 text-xs md:text-sm font-medium leading-relaxed font-sans ${alignClass}`}>{card.text}</p>
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
