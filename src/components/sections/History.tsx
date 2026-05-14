import React from 'react';
import { motion } from 'motion/react';
import { Landmark, Calendar, Star, History as HistoryIcon } from 'lucide-react';
import { useContent } from '@/src/context/ContentContext';

export default function History() {
  const { content } = useContent();
  const milestones = content.history.milestones || [];

  return (
    <section id="sobre" className="py-12 bg-masonic-dark relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <HistoryIcon className="text-gold-500 w-5 h-5" />
              <span className="uppercase tracking-[0.4em] text-gold-500 text-[10px] font-bold">Nossa Jornada</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
              A Arca Através <br/><span className="gold-text">do Tempo</span>
            </h2>
            <p className="text-gold-50/70 font-sans text-base leading-relaxed text-justify max-w-xl">
              {content.history.text}
            </p>
          </div>
          <div className="hidden lg:block text-right">
            <div className="text-8xl font-serif font-black text-gold-500/20 italic">{milestones[0]?.year || '2009'}</div>
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
              className="relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-gold-500/30 transition-all group"
            >
              <div className="text-3xl font-serif font-bold text-gold-500 mb-4 group-hover:scale-110 transition-transform origin-left">
                {item.year}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wider">{item.title}</h3>
              <p className="text-gold-100 text-sm leading-relaxed">
                {item.description}
              </p>
              
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                <Star className="text-gold-500 w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Interactive Timeline Bar */}
        <div className="mt-20 relative h-[2px] bg-white/10 w-full rounded-full hidden md:block">
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            transition={{ duration: 2 }}
            className="absolute inset-0 bg-gradient-to-r from-gold-600 to-gold-400 shadow-[0_0_15px_rgba(230,176,0,0.5)]" 
          />
          <div className="absolute -top-3 left-0 w-8 h-8 rounded-full border-2 border-gold-500 bg-masonic-dark shadow-[0_0_10px_rgba(230,176,0,0.5)] flex items-center justify-center">
            <span className="text-[10px] font-bold text-gold-400">{milestones[0]?.year || '2009'}</span>
          </div>
          <div className="absolute -top-3 right-0 w-8 h-8 rounded-full border-2 border-gold-500 bg-masonic-dark shadow-[0_0_10px_rgba(230,176,0,0.5)] flex items-center justify-center">
             <span className="text-[10px] font-bold text-gold-400">{milestones[milestones.length - 1]?.year || '20XX'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
