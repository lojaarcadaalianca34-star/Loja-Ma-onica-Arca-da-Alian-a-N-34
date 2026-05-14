import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function QuestCTA() {
  return (
    <section className="py-20 bg-masonic-dark relative overflow-hidden">
      <div className="absolute inset-0 bg-gold-500/5 mix-blend-color pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center"
        >
          <Link 
            to="/quero-participar"
            className="group relative px-12 py-10 overflow-hidden rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(230,176,0,0.2)]"
          >
            <div className="absolute inset-0 bg-gold-500/20 blur-xl opacity-30 group-hover:opacity-60 transition-opacity" />
            <div className="absolute inset-0 border-2 border-gold-500 bg-masonic-blue/90 rounded-xl" />
            <span className="relative z-10 font-serif text-2xl md:text-3xl font-bold tracking-[0.2em] uppercase text-white group-hover:text-gold-500 transition-colors">
              Desejo fazer parte da Ordem
            </span>
          </Link>
          <p className="mt-8 text-gold-200/40 text-[10px] uppercase tracking-[0.4em] font-bold">
            Clique acima para iniciar sua jornada
          </p>
        </motion.div>
      </div>
    </section>
  );
}
