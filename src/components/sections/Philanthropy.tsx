import React from 'react';
import { motion } from 'motion/react';
import { Heart, Users, CheckCircle, Trophy } from 'lucide-react';
import { useContent } from '@/src/context/ContentContext';
import { Link } from 'react-router-dom';

export default function Philanthropy() {
  const { content } = useContent();
  const initiatives = content.philanthropy.initiatives || [];
  const stats = content.philanthropy.stats || [];

  return (
    <section id="social" className="py-12 bg-masonic-dark relative">
      <div className="absolute inset-0 bg-gold-900/5 mix-blend-overlay pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold-500/20 bg-gold-500/5 mb-4">
            <Heart className="w-3 h-3 text-gold-500" />
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-gold-400">Filantropia e Caridade</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">Nossas <span className="gold-text">Obras Sociais</span></h2>
          <p className="max-w-2xl mx-auto text-gold-100 font-sans text-base">
            {content.philanthropy.description}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-xl bg-white/5 border border-white/10 text-center flex flex-col items-center justify-center group hover:bg-gold-500/10 transition-colors"
            >
              <span className="text-4xl font-serif font-black gold-text mb-2 tracking-tight group-hover:scale-110 transition-transform">
                {stat.value}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold-400 font-bold">{stat.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {initiatives.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              className="group p-10 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 hover:border-gold-500/40 transition-all flex flex-col gap-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-gold-500/20 flex items-center justify-center">
                <CheckCircle className="text-gold-400 w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-white mb-2">{item.title}</h3>
                <div className="inline-block px-3 py-1 rounded bg-gold-500 text-masonic-dark text-[10px] font-bold uppercase mb-4">
                  {item.impact}
                </div>
                <p className="text-gold-50/90 leading-relaxed font-sans text-sm">
                  {item.description}
                </p>
              </div>
              <button className="mt-auto flex items-center gap-2 text-gold-400 font-bold uppercase tracking-widest text-xs group-hover:gap-4 transition-all">
                Saiba Mais <Trophy className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
