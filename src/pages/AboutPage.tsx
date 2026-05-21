import React from 'react';
import { motion } from 'motion/react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useContent } from '../context/ContentContext';
import { Landmark, Target, Eye, Sparkles, History as HistoryIcon, Star } from 'lucide-react';

const getAlignClass = (align: 'left' | 'center' | 'right' | 'justify') => {
  if (align === 'center') return 'text-center';
  if (align === 'right') return 'text-right';
  if (align === 'justify') return 'text-justify';
  return 'text-left';
};

const getFlexAlignClass = (align: 'left' | 'center' | 'right' | 'justify') => {
  if (align === 'center') return 'items-center justify-center';
  if (align === 'right') return 'items-end justify-end';
  return 'items-start justify-start';
};

export default function AboutPage() {
  const { content, aboutContent } = useContent();
  const { history } = content;

  // Fallbacks
  const missionText = aboutContent?.mission?.text || history.mission;
  const missionAlign = aboutContent?.mission?.align || 'left';

  const visionText = aboutContent?.vision?.text || history.vision;
  const visionAlign = aboutContent?.vision?.align || 'left';

  const values = aboutContent?.values && aboutContent.values.length > 0 ? aboutContent.values : history.values || [];

  const milestones = aboutContent?.milestones && aboutContent.milestones.length > 0 
    ? aboutContent.milestones 
    : history.milestones || [];

  return (
    <div className="min-h-screen bg-aged-beige">
      <Navbar />
      
      <main className="pt-32">
        {/* Hero Section */}
        <section className="relative py-20 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gold-900/5 mix-blend-overlay pointer-events-none" />
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#c5a059]/20 bg-[#c5a059]/5 mb-6"
            >
              <Landmark className="w-3 h-3 text-[#c5a059]" />
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[#c5a059]">Institucional</span>
            </motion.div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-[#0b1d3a] mb-6 uppercase tracking-wider">
              Nossa <span className="gold-text">Identidade</span>
            </h1>
            <p className="max-w-3xl mx-auto text-[#0b1d3a]/70 font-sans text-lg leading-relaxed">
              Conheça os pilares que sustentam a Arca da Aliança nº 34 e nossa jornada de busca pela excelência humana.
            </p>
          </div>
        </section>

        {/* Pillars Section: Mission, Vision, Values */}
        <section className="py-20 px-6 bg-navy-blue/5 border-y border-navy-blue/5">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mission */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`p-10 rounded-3xl bg-white/50 border border-[#c5a059]/20 hover:border-[#c5a059]/50 transition-all flex flex-col ${getFlexAlignClass(missionAlign)} group shadow-sm`}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#c5a059]/10 flex items-center justify-center mb-6 group-hover:bg-[#c5a059] transition-all">
                <Target className="w-8 h-8 text-[#c5a059] group-hover:text-white" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#0b1d3a] mb-4 uppercase tracking-widest gold-text text-center">Missão</h3>
              <p className={`text-[#0b1d3a]/80 font-sans text-sm leading-relaxed italic whitespace-pre-wrap w-full ${getAlignClass(missionAlign)}`}>
                "{missionText}"
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className={`p-10 rounded-3xl bg-white/50 border border-[#c5a059]/20 hover:border-[#c5a059]/50 transition-all flex flex-col ${getFlexAlignClass(visionAlign)} group shadow-sm`}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#c5a059]/10 flex items-center justify-center mb-6 group-hover:bg-[#c5a059] transition-all">
                <Eye className="w-8 h-8 text-[#c5a059] group-hover:text-white" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#0b1d3a] mb-4 uppercase tracking-widest gold-text text-center">Visão</h3>
              <p className={`text-[#0b1d3a]/80 font-sans text-sm leading-relaxed whitespace-pre-wrap w-full ${getAlignClass(visionAlign)}`}>
                {visionText}
              </p>
            </motion.div>

            {/* Values */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-10 rounded-3xl bg-white/50 border border-[#c5a059]/20 hover:border-[#c5a059]/50 transition-all flex flex-col items-center justify-center text-center group shadow-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#c5a059]/10 flex items-center justify-center mb-6 group-hover:bg-[#c5a059] transition-all">
                <Sparkles className="w-8 h-8 text-[#c5a059] group-hover:text-white" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#0b1d3a] mb-4 uppercase tracking-widest gold-text">Valores</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {values.map((v, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-navy-blue/10 text-[#c5a059] text-[10px] font-bold uppercase tracking-widest">
                    {v}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Timeline Section (Enhanced from Home) */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="flex items-center justify-center gap-3 mb-3">
                <HistoryIcon className="text-[#c5a059] w-5 h-5" />
                <span className="uppercase tracking-[0.4em] text-[#c5a059] text-[10px] font-bold">Nossa História</span>
              </div>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#0b1d3a] mb-6 uppercase tracking-wider">
                Linha do <span className="gold-text">Tempo</span>
              </h2>
            </div>

            <div className="relative">
              {/* Vertical line for mobile */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[1px] bg-[#c5a059]/20 md:-ml-[0.5px]" />

              <div className="space-y-12 md:space-y-0">
                {milestones.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={`relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}
                  >
                    {/* Content */}
                    <div className={`pl-12 md:pl-0 ${index % 2 === 0 ? 'md:text-right' : 'md:order-2'}`}>
                      <span className="text-4xl font-serif font-black gold-text mb-2 block">{item.year}</span>
                      <h3 className="text-[#0b1d3a] font-bold text-xl uppercase tracking-widest mb-3">{item.title}</h3>
                      <p className="text-[#0b1d3a]/70 font-sans text-sm leading-relaxed max-w-sm ml-auto mr-0 rtl:ml-0 rtl:mr-auto whitespace-pre-wrap">
                        {item.description}
                      </p>
                    </div>

                    {/* Circle on line */}
                    <div className="absolute left-4 md:left-1/2 top-0 w-8 h-8 -ml-4 rounded-full border-2 border-[#c5a059] bg-aged-beige z-10 flex items-center justify-center shadow-[0_0_15px_rgba(197,160,89,0.3)]">
                      <div className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" />
                    </div>

                    {/* Visual spacer for desktop */}
                    <div className={`${index % 2 === 0 ? 'md:order-2' : ''}`} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
