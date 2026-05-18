import React from 'react';
import { motion } from 'motion/react';
import { Heart, Users, CheckCircle, Trophy, Sparkles, HandHeart, History, Images, Quote } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function SocialActionsPage() {
  const { content } = useContent();
  const initiatives = content.philanthropy?.initiatives || [];
  const stats = content.philanthropy?.stats || [];
  
  // Lendo a ordem de alinhamento do Painel Administrativo
  const alignClass = content.philanthropy?.textAlign === 'left' ? 'text-left' :
                     content.philanthropy?.textAlign === 'right' ? 'text-right' :
                     content.philanthropy?.textAlign === 'center' ? 'text-center' :
                     'text-justify'; // Padrão elegante justificado

  return (
    <div className="min-h-screen bg-aged-beige overflow-x-hidden">
      <Navbar />
      
      <main className="pt-20">
        <section className="relative py-16 md:py-24 overflow-hidden border-b border-[#c5a059]/10">
          <div className="absolute inset-0 bg-gold-900/5 mix-blend-overlay pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl blur-[120px] opacity-10 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#c5a059] rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#c5a059]/60 rounded-full" />
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#c5a059]/20 bg-[#c5a059]/5 mb-6"
            >
              <Heart className="w-3 h-3 text-[#c5a059] fill-[#c5a059]/20" />
              <span className="text-[9px] md:text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[#c5a059]">{content.philanthropy?.smallTitle || "Filantropia e Impacto Social"}</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-3xl md:text-6xl font-bold text-[#0b1d3a] mb-6 md:mb-8 tracking-wider uppercase leading-tight"
            >
              {content.philanthropy?.title || "Nossa Missão de"} <span className="gold-text">{content.philanthropy?.subTitle || "Servir"}</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`max-w-3xl mx-auto text-[#0b1d3a]/80 font-sans text-base md:text-lg leading-relaxed px-2 ${alignClass}`}
            >
              {content.philanthropy?.description || "A verdadeira Maçonaria se manifesta através do serviço desinteressado. Nossa Loja mantém um commitment inabalável com o desenvolvimento social e o auxílio aos necessitados."}
            </motion.p>
          </div>
        </section>

        <section className="py-12 md:py-20 bg-navy-blue/5">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {stats.map((stat: any, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 sm:p-6 md:p-10 rounded-2xl bg-white/60 border border-[#c5a059]/20 text-center flex flex-col items-center justify-center group hover:bg-[#c5a059]/10 transition-all shadow-sm"
                >
                  <span className="text-3xl sm:text-4xl md:text-5xl font-serif font-black gold-text mb-1 md:mb-2 tracking-tight group-hover:scale-110 transition-transform">
                    {stat.value}
                  </span>
                  <span className="text-[9px] sm:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#c5a059] font-bold block">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-aged-beige">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12 md:mb-16">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-[#c5a059] mb-3 uppercase tracking-[0.4em] text-[9px] md:text-[10px] font-bold">
                  <HandHeart className="w-4 h-4" /> Impacto Real
                </div>
                <h2 className="font-serif text-2xl md:text-5xl font-bold text-[#0b1d3a] uppercase tracking-wider">
                  Nossas Iniciativas <br /> <span className="gold-text">Permanentes</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {initiatives.map((item: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative p-6 sm:p-8 md:p-12 rounded-[1.5rem] md:rounded-[2.5rem] bg-white/50 border border-[#c5a059]/10 hover:border-[#c5a059]/40 transition-all flex flex-col gap-6 md:gap-8 overflow-hidden shadow-sm hover:shadow-xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#c5a059]/20 transition-all" />
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-[#c5a059]/20 flex items-center justify-center text-[#c5a059] group-hover:bg-[#c5a059] group-hover:text-white transition-all duration-500 shrink-0">
                    <CheckCircle className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-[#0b1d3a] mb-2 group-hover:text-[#c5a059] transition-colors">{item.title}</h3>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#c5a059]/10 border border-[#c5a059]/20 text-[#c5a059] text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-4">
                      <Sparkles className="w-3 h-3" />
                      {item.impact}
                    </div>
                    <p className={`text-[#0b1d3a]/80 leading-relaxed font-sans text-xs md:text-sm ${alignClass}`}>
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}