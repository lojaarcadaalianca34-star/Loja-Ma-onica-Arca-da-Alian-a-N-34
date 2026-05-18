import React from 'react';
import { motion } from 'motion/react';
import { Shield, BookOpen, Target, History, CalendarDays, ExternalLink, Quote, TargetCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useContent } from '../context/ContentContext';
import { useNavigate, useParams } from 'react-router-dom';

// DADOS FICTÍCIOS PARA O EXEMPLO - ESTES DADOS SERÃO LIDOS DO CONTEXTO OU API
const institutionData = {
  id: 'arc-iris',
  name: 'Garotas do Arco-Íris',
  subtitle: 'Guarás • DF',
  hero: {
    description: 'Assembleia Flores do Cerrado nº 1',
    image: 'https://cdn.pixabay.com/photo/2016/11/19/18/31/colored-1840004_1280.jpg', // IMAGEM DE EXEMPLO PORTRAIT
  },
  mission: {
    icon: Target,
    text: 'Formar líderes do futuro através do desenvolvimento do caráter, do serviço ao próximo e do amor fraternal.'
  },
  vision: {
    icon: TargetCircle,
    text: 'Ser referência na formação moral e cívica, impactando positivamente a sociedade através de nossas ações.'
  },
  history: {
    icon: History,
    title: 'Breve História',
    text: 'A ordem foi fundada em 1922 em Oklahoma, EUA, e chegou ao Brasil na década de 1970. No Distrito Federal, a Assembleia Flores do Cerrado nº 1 foi instalada em 2005, fruto do esforço conjunto de maçons e da sociedade local, buscando oferecer às jovens um ambiente de crescimento e união.'
  },
  cta: {
    title: 'Investir na juventude é garantir o futuro da humanidade.',
    buttonText: 'Apoiar nossa causa'
  }
};

export default function AffiliatedOrgPage() {
  const navigate = useNavigate();
  // const { institutionId } = useParams(); // Para carregar dinamicamente os dados
  const { content } = useContent();
  const data = institutionData; // USANDO DADOS DE EXEMPLO

  return (
    <div className="min-h-screen bg-aged-beige flex flex-col font-sans overflow-x-hidden w-full selection:bg-[#c5a059]/30 selection:text-[#0b1d3a]">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 md:px-6 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header Section */}
          <div className="relative mb-8 p-1 rounded-[2.5rem] bg-gradient-to-br from-[#c5a059]/20 via-transparent to-[#0b1d3a]/5 overflow-hidden w-full">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-8 bg-white md:bg-white/40 rounded-[2.3rem] border border-white/40 w-full">
              <div className="flex flex-col sm:flex-row items-center gap-6 min-w-0 w-full md:w-auto">
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#0b1d3a] border-4 border-[#c5a059]/20 flex items-center justify-center text-[#c5a059] shadow-2xl relative overflow-hidden shrink-0">
                    <Shield className="w-8 h-8 md:w-10 md:h-10 relative z-10" />
                 </div>
                 <div className="text-center sm:text-left min-w-0 w-full">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c5a059] mb-1 block truncate">Nossa Família</span>
                    <h1 className="font-serif text-xl md:text-3xl font-bold text-[#0b1d3a] uppercase tracking-wider leading-none break-words max-w-full">
                       {data.name} <span className="gold-text block sm:inline">{data.subtitle}</span>
                    </h1>
                 </div>
              </div>
            </div>
          </div>

          {/* Top Section - Título e Imagem Portrait */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full mb-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-left space-y-6">
                <span className="inline-block px-3 py-1 bg-[#c5a059]/10 text-[#c5a059] text-[9px] font-black uppercase tracking-widest rounded-full border border-[#c5a059]/20 shadow-inner">Organização Paramaçônica</span>
                <h2 className="font-serif text-2xl md:text-5xl font-black text-[#0b1d3a] uppercase tracking-widest break-words leading-[1.15]">
                  Garotas <br /> do <span className="gold-text">Arco-Íris</span>
                </h2>
                <p className="text-[#0b1d3a]/70 text-xs md:text-base leading-relaxed italic max-w-xl">“Nossa missão é formar líderes do futuro, através do desenvolvimento do caráter, do serviço ao próximo e do amor fraternal. Cultivando a união para colher a sabedoria.”</p>
                
                <div className="flex flex-wrap gap-2 pt-2">
                   {['Liderança', 'Serviço', 'Amizade', 'Sabedoria', 'União'].map(t => (
                      <span key={t} className="px-3 py-1 border border-[#0b1d3a]/10 rounded-xl text-[#0b1d3a]/60 text-[9px] font-bold uppercase tracking-widest bg-white shadow-sm">{t}</span>
                   ))}
                </div>
            </motion.div>

            {/* 🔥 NOVO CONTAINER PORTRAIT PARA A IMAGEM PRINCIPAL (MAIS ALTA DO QUE LARGA) */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="aspect-[4/5] bg-white rounded-[2.5rem] p-4 shadow-xl border border-[#0b1d3a]/5 overflow-hidden">
               <img src={data.hero.image} alt={data.hero.description} className="w-full h-full object-cover rounded-[2rem] shadow-inner" />
            </motion.div>
          </div>

          {/* Cards Section - REFORMULADO PARA FORMATO PAISAGEM (MAIS COMPRIDOS DO QUE ALTOS) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-12">
              {[
                { type: 'mission', icon: Target, title: 'Nossa Missão', text: data.mission.text },
                { type: 'vision', icon: TargetCircle, title: 'Nossa Visão', text: data.vision.text },
                { type: 'history', icon: History, title: data.history.title, text: data.history.text }
              ].map((card) => {
                  const CardIcon = card.icon;
                  return (
                      <div key={card.type} className="aspect-[3/2] bg-white p-6 md:p-8 rounded-[2.5rem] border border-[#0b1d3a]/10 hover:border-[#c5a059]/30 transition-all shadow-md group relative overflow-hidden text-left w-full flex flex-col justify-between">
                          
                          <div className="flex items-center gap-4 border-b border-[#0b1d3a]/5 pb-4">
                             <div className="w-12 h-12 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center text-[#c5a059] shrink-0">
                                <CardIcon className="w-6 h-6" />
                             </div>
                             <h4 className="font-cinzel text-base md:text-xl font-bold text-[#0b1d3a] group-hover:text-[#c5a059] transition-colors">{card.title}</h4>
                          </div>

                          <div className="relative pt-4 flex-1">
                             <p className="text-[#0b1d3a]/80 text-[11px] font-medium leading-relaxed font-sans line-clamp-4">{card.text}</p>
                             <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent" />
                          </div>
                          
                          <button className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] flex items-center gap-2 group-hover:gap-4 transition-all mt-auto pt-4 border-t border-[#0b1d3a]/5">Ler mais <span>→</span></button>
                      </div>
                  );
              })}
          </div>

          {/* Bottom CTA Section */}
          <div className="p-10 md:p-14 bg-[#0b1d3a] rounded-[3.5rem] border-4 border-[#c5a059]/20 text-center relative overflow-hidden w-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none">
              <Quote className="w-[300px] h-[300px] text-[#c5a059]" />
            </div>
            <p className="font-serif text-[#f4efe2] text-xl md:text-4xl font-bold italic tracking-tight mb-8 relative z-10 leading-snug">
               "{data.cta.title}"
            </p>
            <button className="relative z-10 px-8 py-3.5 bg-[#c5a059] text-[#0b1d3a] border border-[#c5a059]/30 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2 mx-auto">
               <Heart className="w-4 h-4" /> {data.cta.buttonText}
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}