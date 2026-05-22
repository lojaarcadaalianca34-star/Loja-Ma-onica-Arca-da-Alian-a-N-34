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
    <section id="acoes-sociais" className="py-24 bg-aged-beige relative overflow-hidden">
      <div className="absolute inset-0 bg-[#c5a059]/5 mix-blend-overlay pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#c5a059]/30 bg-[#c5a059]/5 mb-6">
            <Heart className="w-3 h-3 text-[#c5a059]" />
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[#c5a059]">{content.philanthropy?.smallTitle || 'Filantropia e Caridade'}</span>
          </div>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#0b1d3a] mb-6 uppercase tracking-wider">{content.philanthropy?.title || 'Nossas Obras Sociais'}</h2>
          <p className="max-w-2xl mx-auto text-[#0b1d3a]/70 font-sans text-lg text-center leading-relaxed">
            {content.philanthropy?.subTitle || content.philanthropy.description}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-10 rounded-2xl bg-white/60 border border-[#c5a059]/20 text-center flex flex-col items-center justify-center group hover:bg-[#c5a059]/10 transition-all shadow-sm"
            >
              <span className="text-4xl font-serif font-black text-[#0b1d3a] mb-2 tracking-tight group-hover:scale-110 transition-transform">
                {stat.value}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a059] font-bold">{stat.label}</span>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {initiatives.map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              className="group p-10 rounded-3xl bg-white/50 border border-[#c5a059]/10 hover:border-[#c5a059]/40 transition-all flex flex-col gap-8 shadow-sm hover:shadow-xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059]">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-[#0b1d3a] mb-3 group-hover:text-[#c5a059] transition-colors">{item.title}</h3>
                <div className="inline-block px-3 py-1 rounded bg-[#c5a059]/10 border border-[#c5a059]/20 text-[#c5a059] text-[10px] font-bold uppercase tracking-widest mb-6">
                  {item.impact}
                </div>
                <p className="text-[#0b1d3a]/70 leading-relaxed font-sans text-sm text-center">
                  {item.description}
                </p>
              </div>
              <Link to="/acoes-sociais" className="mt-auto flex items-center gap-3 text-[#c5a059] font-black uppercase tracking-[0.2em] text-[10px] group-hover:gap-5 transition-all">
                Saiba Mais <Trophy className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
