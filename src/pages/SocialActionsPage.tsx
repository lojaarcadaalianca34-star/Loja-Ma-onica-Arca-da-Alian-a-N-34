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

  return (
    <div className="min-h-screen bg-aged-beige">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section Page */}
        <section className="relative py-24 overflow-hidden border-b border-[#c5a059]/10">
          <div className="absolute inset-0 bg-gold-900/5 mix-blend-overlay pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl blur-[120px] opacity-10 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#c5a059] rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#c5a059]/60 rounded-full" />
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#c5a059]/20 bg-[#c5a059]/5 mb-6"
            >
              <Heart className="w-3 h-3 text-[#c5a059] fill-[#c5a059]/20" />
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[#c5a059]">Filantropia e Impacto Social</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-4xl md:text-6xl font-bold text-[#0b1d3a] mb-8 tracking-wider uppercase"
            >
              Nossa Missão de <span className="gold-text">Servir</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-3xl mx-auto text-[#0b1d3a]/80 font-sans text-lg leading-relaxed text-center"
            >
              {content.philanthropy?.description || "A verdadeira Maçonaria se manifesta através do serviço desinteressado. Nossa Loja mantém um compromisso inabalável com o desenvolvimento social e o auxílio aos necessitados."}
            </motion.p>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="py-20 bg-navy-blue/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-10 rounded-2xl bg-white/60 border border-[#c5a059]/20 text-center flex flex-col items-center justify-center group hover:bg-[#c5a059]/10 transition-all shadow-sm"
                >
                  <span className="text-5xl font-serif font-black gold-text mb-2 tracking-tight group-hover:scale-110 transition-transform">
                    {stat.value}
                  </span>
                  <span className="text-xs uppercase tracking-[0.3em] text-[#c5a059] font-bold">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Initiatives */}
        <section className="py-24 bg-aged-beige">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-[#c5a059] mb-4 uppercase tracking-[0.4em] text-[10px] font-bold">
                  <HandHeart className="w-4 h-4" />
                  Impacto Real
                </div>
                <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#0b1d3a] uppercase tracking-wider">
                  Nossas Iniciativas <br /> <span className="gold-text">Permanentes</span>
                </h2>
              </div>
              <p className="max-w-md text-[#0b1d3a]/60 text-sm italic border-l border-[#c5a059]/30 pl-6">
                "Não saiba a tua mão esquerda o que faz a tua direita. O trabalho em silêncio constrói egrégoras de luz."
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {initiatives.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative p-12 rounded-[2.5rem] bg-white/50 border border-[#c5a059]/10 hover:border-[#c5a059]/40 transition-all flex flex-col gap-8 overflow-hidden shadow-sm hover:shadow-xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#c5a059]/20 transition-all" />
                  
                  <div className="w-16 h-16 rounded-2xl bg-[#c5a059]/20 flex items-center justify-center text-[#c5a059] group-hover:bg-[#c5a059] group-hover:text-white transition-all duration-500">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-[#0b1d3a] mb-3 group-hover:text-[#c5a059] transition-colors">{item.title}</h3>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#c5a059]/10 border border-[#c5a059]/20 text-[#c5a059] text-[10px] font-bold uppercase tracking-widest mb-6">
                      <Sparkles className="w-3 h-3" />
                      {item.impact}
                    </div>
                    <p className="text-[#0b1d3a]/80 leading-relaxed font-sans text-sm text-justify">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-[#0b1d3a]/10 mt-auto">
                    <div className="flex items-center gap-2 text-[#c5a059]/60 text-[9px] uppercase tracking-widest font-black">
                      <Trophy className="w-3 h-3" />
                      Iniciativa Verificada
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* History of Actions */}
        <section className="py-24 bg-[#c5a059]/10 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 text-[#c5a059] mb-6 uppercase tracking-[0.4em] text-[10px] font-bold">
                  <History className="w-4 h-4" />
                  Trajetória
                </div>
                <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#0b1d3a] mb-8 uppercase tracking-widest">
                  O Histórico de <span className="gold-text">Fazer o Bem</span>
                </h2>
                <div className="space-y-6 text-[#0b1d3a]/80 font-sans text-base leading-relaxed text-justify">
                  <p>
                    Desde a nossa fundação em 2009, a Filantropia não tem sido apenas um departamento, mas a alma pulsante da Arca da Aliança Nº 34. Entendemos que o progresso moral do maçom está intrinsecamente ligado à sua capacidade de doar-se ao próximo.
                  </p>
                  <p>
                    Ao longo dos anos, expandimos nossas fronteiras para além do auxílio material. Atuamos no fomento à educação, no suporte a instituições de longa permanência para idosos e no acolhimento de famílias em situação de vulnerabilidade extrema no Distrito Federal.
                  </p>
                  <p>
                    Cada cesta básica entregue, cada bolsa de estudo garantida e cada refeição servida representa um elo a mais em nossa corrente fraternal de união e amor pela humanidade.
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-square rounded-[3rem] overflow-hidden border border-gold-500/20 shadow-2xl skew-y-3">
                  <img 
                    src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop" 
                    alt="Ações Sociais" 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#c5a059]/10 backdrop-blur-xl border border-white/20 rounded-full flex flex-col items-center justify-center text-center p-6 -rotate-12 shadow-xl">
                  <span className="text-3xl font-serif font-black text-[#c5a059]">2009</span>
                  <span className="text-[8px] uppercase tracking-widest text-[#0b1d3a]/60 font-bold">Legado Iniciado</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-24 bg-aged-beige">
          <div className="max-w-7xl mx-auto px-6 text-center mb-16">
            <div className="flex justify-center items-center gap-3 text-[#c5a059] mb-6 uppercase tracking-[0.4em] text-[10px] font-bold">
              <Images className="w-4 h-4" />
              Recortes de Luz
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#0b1d3a] uppercase tracking-wider mb-6">Galeria de <span className="gold-text">Obras Sociais</span></h2>
            <p className="max-w-2xl mx-auto text-[#0b1d3a]/60 font-sans">
              Momentos registrados de nossas atividades sociais, preservando a identidade dos assistidos enquanto celebramos o espírito de serviço.
            </p>
          </div>

          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=600&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=600&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=600&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1454165833267-033f235ff27d?q=80&w=600&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?q=80&w=600&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1532629345422-7515f3d16bb8?q=80&w=600&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=600&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=600&auto=format&fit=crop"
            ].map((url, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="aspect-square rounded-3xl overflow-hidden border border-white/10 group relative"
              >
                <img src={url} alt="Ação Social" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gold-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <Sparkles className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials/Quote Section */}
        <section className="py-24 bg-[#c5a059]/5 border-y border-[#c5a059]/10">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Quote className="w-12 h-12 text-[#c5a059]/20 mx-auto mb-8" />
            <h2 className="font-serif text-2xl md:text-3xl text-[#0b1d3a]/80 italic leading-relaxed mb-8">
              "A caridade é o único tesouro que se aumenta ao ser dividido, e o único que realmente levamos conosco após o último suspiro."
            </h2>
            <div className="w-12 h-0.5 bg-[#c5a059]/30 mx-auto mb-6" />
            <span className="uppercase tracking-[0.4em] text-[#c5a059] text-[10px] font-black">Reflexão Maçônica</span>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-aged-beige">
          <div className="max-w-5xl mx-auto px-6">
            <div className="relative p-16 rounded-[4rem] bg-[#0b1d3a] overflow-hidden text-center shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 hidden md:block" />
              <div className="relative z-10">
                <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#c5a059] mb-6 uppercase tracking-wider">Como Você Pode <span className="text-white">Ajudar?</span></h2>
                <p className="max-w-2xl mx-auto text-white/80 font-sans text-lg mb-10">
                  Nossas ações são financiadas por doações voluntárias e pelo trabalho incansável de nossos irmãos e cunhadas. Sua colaboração pode mudar uma vida hoje.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button className="px-10 py-4 bg-[#c5a059] text-[#0b1d3a] font-black uppercase tracking-[0.2em] text-[10px] rounded-full hover:scale-105 transition-all shadow-2xl">
                    Seja um Parceiro
                  </button>
                  <button className="px-10 py-4 bg-transparent border-2 border-[#c5a059] text-[#c5a059] font-black uppercase tracking-[0.2em] text-[10px] rounded-full hover:bg-[#c5a059] hover:text-[#0b1d3a] transition-all">
                    Falar com a Secretaria
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
