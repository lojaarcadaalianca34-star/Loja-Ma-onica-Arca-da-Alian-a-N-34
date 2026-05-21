import React from 'react';
import { motion } from 'motion/react';
import { useContent } from '@/src/context/ContentContext';

export default function WelcomeBanner() {
  const { homeContent } = useContent();
  const { welcomeBanner } = homeContent;

  return (
    <section className="relative h-[80vh] min-h-[600px] flex flex-col items-center justify-center overflow-hidden border-b border-[#c5a059]/20 bg-masonic-dark">
      {/* Background with Animation */}
      <div className="absolute inset-0 z-0">
        {welcomeBanner.backgroundImage && (
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 1, 0]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url("${welcomeBanner.backgroundImage}")`,
              filter: 'brightness(0.9) contrast(1.1)'
            }}
          />
        )}
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/10 to-black/30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="flex flex-col items-center w-full"
        >
          <motion.h2 
  initial={{ opacity: 0, letterSpacing: '0.1em' }}
  animate={{ opacity: 1, letterSpacing: '0.3em' }}
  transition={{ duration: 2, delay: 0.5 }}
  className={`font-serif text-[#f4efe2] text-sm md:text-xl font-medium mb-6 uppercase tracking-[0.3em] w-full ${
    welcomeBanner.subTitle.align === 'center' ? 'text-center' :
    welcomeBanner.subTitle.align === 'right' ? 'text-right' :
    welcomeBanner.subTitle.align === 'justify' ? 'text-justify' : 'text-left'
  }`}
  style={{
    // Névoa escura e suave atrás do texto para desgrudar ele da foto clara de fundo
    textShadow: '0 4px 10px rgba(0, 0, 0, 0.5)'
  }}
>
  {welcomeBanner.subTitle.text}
</motion.h2>
          
          <h1 className={`font-cinzel text-4xl md:text-6xl lg:text-8xl font-bold gold-text tracking-normal uppercase drop-shadow-2xl leading-none w-full [-webkit-text-stroke:0.6px_#0b1d3a] [text-stroke:0.6px_#0b1d3a] ${
  welcomeBanner.title.align === 'center' ? 'text-center' :
  welcomeBanner.title.align === 'right' ? 'text-right' :
  welcomeBanner.title.align === 'justify' ? 'text-justify' : 'text-left'
}`}>
  {welcomeBanner.title.text}
</h1>

          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 1 }}
            className="w-24 h-px bg-[#c5a059] mt-8 mb-4 shadow-[0_0_10px_#c5a059]"
          />
        </motion.div>
      </div>

      {/* Decorative corners or elements if needed, but keeping it clean for now */}
    </section>
  );
}

