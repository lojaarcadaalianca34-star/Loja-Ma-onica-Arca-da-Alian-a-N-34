import React from 'react';
import { motion } from 'motion/react';
import { Compass, Shield, Landmark, ChevronDown } from 'lucide-react';
import { useContent } from '@/src/context/ContentContext';

import Logo from '@/src/components/ui/Logo';

export default function Hero() {
  const { content } = useContent();

  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#000a1a]">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-masonic-blue/30 via-masonic-dark to-masonic-dark" />
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(circle, #e6b000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        
        {/* Architectural Pillars (Stylized) */}
        <div className="absolute left-6 lg:left-12 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 hidden lg:flex">
          <div className="w-px h-64 bg-gradient-to-b from-transparent via-gold-500/60 to-transparent" />
          <div className="font-serif text-8xl text-gold-500/80 select-none">J</div>
          <div className="w-px h-64 bg-gradient-to-b from-transparent via-gold-500/60 to-transparent" />
        </div>
        <div className="absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 hidden lg:flex">
          <div className="w-px h-64 bg-gradient-to-b from-transparent via-gold-500/60 to-transparent" />
          <div className="font-serif text-8xl text-gold-500/80 select-none">B</div>
          <div className="w-px h-64 bg-gradient-to-b from-transparent via-gold-500/60 to-transparent" />
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col items-center text-center pt-24 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="font-serif text-xl md:text-3xl lg:text-4xl font-bold gold-text mb-1 tracking-[0.15em] uppercase">
            {content.hero.title}
          </h1>
          <h2 className="font-sans text-[10px] md:text-xs tracking-[0.4em] text-gold-300 mb-8 uppercase font-medium">
            {content.hero.subTitle}
          </h2>
        </motion.div>

        {/* Central Logo Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          className="relative mt-6 mb-10 group"
        >
          {/* Subtle glow behind the logo */}
          <div className="absolute inset-0 bg-gold-500/5 blur-[80px] rounded-full animate-pulse" />
          
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Logo rendered directly, smaller than before */}
            <Logo className="w-24 h-24 md:w-36 md:h-36" />
            
            {/* Divine Rays (CSS) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
              <div className="absolute inset-0 bg-gradient-radial from-gold-400/5 to-transparent opacity-40 animate-pulse" />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="max-w-lg text-center"
        >
          <p className="font-serif text-xs md:text-sm text-gold-100/80 tracking-[0.15em] uppercase mb-8 leading-loose text-justify px-4">
            {content.hero.tagline}
          </p>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-10 hidden xl:flex gap-8 text-[10px] uppercase font-bold tracking-widest text-gold-500/70">
        <span>Justiça</span>
        <span>Fraternidade</span>
        <span>Verdade</span>
      </div>

      <div className="absolute bottom-6 right-10 hidden xl:flex gap-8 text-[10px] uppercase font-bold tracking-widest text-gold-500/70">
        <span>S.F.U.</span>
        <span>G.A.D.U.</span>
      </div>

      <motion.button 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        onClick={() => document.getElementById('biblioteca')?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gold-500/60 hover:text-gold-500 transition-colors z-20 cursor-pointer p-4"
        aria-label="Rolar para Biblioteca"
      >
        <ChevronDown className="w-8 h-8" />
      </motion.button>
    </section>
  );
}
