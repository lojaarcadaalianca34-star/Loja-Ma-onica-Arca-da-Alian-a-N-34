import React from 'react';
import { motion } from 'motion/react';
import { Landmark, Calendar, Star, History as HistoryIcon } from 'lucide-react';
import { useContent } from '@/src/context/ContentContext';

export default function History() {
  const { content } = useContent();
  const milestones = content.history.milestones || [];

  return (
    <section id="sobre" className="py-24 bg-aged-beige relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center text-center mb-16 gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-col items-center justify-center gap-3 mb-4">
              <HistoryIcon className="text-[#c5a059] w-5 h-5" />
            <span className="uppercase tracking-[0.4em] text-[#c5a059] text-[10px] font-black">{content.history?.smallTitle || 'Nossa Jornada'}</span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#0b1d3a] mb-6 uppercase tracking-wider leading-tight">
              {content.history?.title || 'A Arca Através do Tempo'}
            </h2>
            <p className="text-[#0b1d3a]/70 font-sans text-lg leading-relaxed text-center mx-auto max-w-xl">
              {content.history?.subTitle || content.history.text}
            </p>
          </div>
          <div className="hidden lg:block text-right">
            <div className="text-9xl font-serif font-black text-[#c5a059]/10 italic tracking-tighter">{milestones[0]?.year || '2009'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {milestones.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative p-10 rounded-2xl bg-white/50 border border-[#c5a059]/20 hover:border-[#c5a059] transition-all group shadow-sm hover:shadow-xl"
            >
              <div className="text-3xl font-serif font-bold text-[#c5a059] mb-4 group-hover:scale-110 transition-transform origin-left">
                {item.year}
              </div>
              <h3 className="text-xl font-bold text-[#0b1d3a] mb-3 uppercase tracking-wider">{item.title}</h3>
              <p className="text-[#0b1d3a]/60 text-sm leading-relaxed text-center">
                {item.description}
              </p>
              
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
          <div className="absolute -top-4 left-0 w-10 h-10 rounded-full border-2 border-[#c5a059] bg-aged-beige flex items-center justify-center shadow-md">
            <span className="text-[10px] font-bold text-[#0b1d3a]">{milestones[0]?.year || '2009'}</span>
          </div>
          <div className="absolute -top-4 right-0 w-10 h-10 rounded-full border-2 border-[#c5a059] bg-aged-beige flex items-center justify-center shadow-md">
             <span className="text-[10px] font-bold text-[#0b1d3a]">{milestones[milestones.length - 1]?.year || '20XX'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
