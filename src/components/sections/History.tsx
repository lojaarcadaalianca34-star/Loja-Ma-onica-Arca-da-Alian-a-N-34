import React from 'react';
import { motion } from 'motion/react';
import { Landmark, Calendar, Star, History as HistoryIcon } from 'lucide-react';
import { useContent } from '@/src/context/ContentContext';

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

export default function History() {
  const { content, aboutContent } = useContent();
  const history = content.history;

  // Fallbacks
  const smallTitle = aboutContent?.smallTitle || { text: 'Nossa Jornada', align: 'center' };
  const title = aboutContent?.title || { text: 'A Arca Através', align: 'center' };
  const subTitle = aboutContent?.subTitle || { text: 'do Tempo', align: 'center' };
  const text = aboutContent?.text || { text: history?.text || '', align: 'left' };
  const images = aboutContent?.images || [];
  const milestones = aboutContent?.milestones && aboutContent.milestones.length > 0 
    ? aboutContent.milestones 
    : history?.milestones || [];

  const validImages = images.filter(img => img && img.trim() !== "");

  return (
    <section id="sobre" className="py-24 bg-aged-beige relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Upper Grid: Description + Dynamic Images */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          
          {/* Text Content Block */}
          <div className={`space-y-6 lg:col-span-7 flex flex-col ${getFlexAlignClass(text.align)}`}>
            <div className={`flex flex-col gap-3 ${getFlexAlignClass(smallTitle.align)} w-full`}>
              <div className="flex items-center gap-3">
                <HistoryIcon className="text-[#c5a059] w-5 h-5 animate-pulse" />
                <span className={`uppercase tracking-[0.4em] text-[#c5a059] text-[10px] font-black ${getAlignClass(smallTitle.align)}`}>
                  {smallTitle.text}
                </span>
              </div>
            </div>

            <h2 className={`font-serif text-3xl md:text-5xl font-bold text-[#0b1d3a] uppercase tracking-wider leading-tight w-full ${getAlignClass(title.align)}`}>
              {title.text} <span className="gold-text">{subTitle.text}</span>
            </h2>

            <p className={`text-[#0b1d3a]/75 font-sans text-sm md:text-base leading-relaxed whitespace-pre-wrap w-full ${getAlignClass(text.align)}`}>
              {text.text}
            </p>
          </div>

          {/* Image Gallery Column - Only visible if valid images exist */}
          <div className="lg:col-span-5 w-full">
            {validImages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {validImages.map((img, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    className="aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border-2 border-[#c5a059]/20 hover:border-[#c5a059]/60 transition-all group bg-[#0b1d3a]/5"
                  >
                    <img 
                      src={img} 
                      alt={`Imagem Histórica #${index + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Beautiful original dynamic big-year background fallback */
              <div className="hidden lg:flex items-center justify-center h-full w-full">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="text-center select-none"
                >
                  <div className="text-[12rem] font-serif font-black text-[#c5a059]/10 italic tracking-tighter leading-none">
                    {milestones[0]?.year || '2009'}
                  </div>
                  <p className="text-[#0b1d3a]/25 text-xs font-serif uppercase tracking-[0.3em] -mt-4">Fundação Consagrada</p>
                </motion.div>
              </div>
            )}
          </div>
        </div>

        {/* Timeline Event Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {milestones.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative p-10 rounded-2xl bg-white/50 border border-[#c5a059]/20 hover:border-[#c5a059] transition-all group shadow-sm hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="text-3xl font-serif font-bold text-[#c5a059] mb-4 group-hover:scale-110 transition-transform origin-left">
                  {item.year}
                </div>
                <h3 className="text-xl font-bold text-[#0b1d3a] mb-3 uppercase tracking-wider">{item.title}</h3>
                <p className="text-[#0b1d3a]/65 text-xs md:text-sm leading-relaxed text-center whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>
              
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                <Star className="text-[#c5a059] w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Interactive Timeline Bar */}
        <div className="mt-24 relative h-[3px] bg-[#0b1d3a]/10 w-full rounded-full hidden md:block">
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            transition={{ duration: 2 }}
            className="absolute inset-0 bg-[#c5a059] shadow-sm" 
          />
          <div className="absolute -top-4 left-0 w-10 h-10 rounded-full border-2 border-[#c5a059] bg-[#f4efe2] flex items-center justify-center shadow-md">
            <span className="text-[10px] font-bold text-[#0b1d3a]">{milestones[0]?.year || '2009'}</span>
          </div>
          <div className="absolute -top-4 right-0 w-10 h-10 rounded-full border-2 border-[#c5a059] bg-[#f4efe2] flex items-center justify-center shadow-md">
             <span className="text-[10px] font-bold text-[#0b1d3a]">{milestones[milestones.length - 1]?.year || '20XX'}</span>
          </div>
        </div>

      </div>
    </section>
  );
}
