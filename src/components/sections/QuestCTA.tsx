import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useContent } from '@/src/context/ContentContext';

export default function QuestCTA() {
  const { content } = useContent();
  
  return (
    <section className="py-24 bg-aged-beige relative overflow-hidden">
      <div className="absolute inset-0 bg-[#c5a059]/5 mix-blend-color pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center"
        >
          <span className="uppercase tracking-[0.4em] text-[#c5a059] text-[10px] font-black mb-8 block">{content.quest?.smallTitle || 'O Convite'}</span>
          <Link 
            to="/quero-participar"
            className="group relative px-12 py-10 overflow-hidden rounded-lg transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            <div className="absolute inset-0 bg-[#c5a059]/10 blur-xl opacity-30 group-hover:opacity-60 transition-opacity" />
            <div className="absolute inset-0 border-[3px] border-[#c5a059] bg-[#0b1d3a] rounded-lg" />
            <span className="relative z-10 font-serif text-2xl md:text-3xl font-bold tracking-[0.2em] uppercase text-[#c5a059] group-hover:text-white transition-colors">
              {content.quest?.title || 'Desejo fazer parte da Ordem'}
            </span>
          </Link>
          <p className="mt-8 text-[#0b1d3a]/40 text-[10px] uppercase tracking-[0.4em] font-black px-4 max-w-xl text-center">
            {content.quest?.subTitle || 'Clique acima para iniciar sua jornada'}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
