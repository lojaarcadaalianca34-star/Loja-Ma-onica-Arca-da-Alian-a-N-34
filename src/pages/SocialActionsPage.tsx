import React from 'react';
import { motion } from 'motion/react';
import { Heart, Users, CheckCircle, Trophy, Sparkles, HandHeart, History, Images, Quote } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function SocialActionsPage() {
  const { content, socialContent } = useContent();

  const titleText = socialContent?.title?.text || "Solidariedade e";
  const titleAlign = socialContent?.title?.align || "center";
  const subTitleText = socialContent?.subTitle?.text || "Fraternidade";
  const subTitleAlign = socialContent?.subTitle?.align || "center";
  const descText = socialContent?.description?.text || "A verdadeira Maçonaria se manifesta através do serviço desinteressado. Nossa Loja mantém um compromisso inabalável com o desenvolvimento social e o auxílio aos necessitados.";
  const descAlign = socialContent?.description?.align || "justify";

  const campaigns = socialContent?.campaigns || [];
  const gallery = socialContent?.gallery || [];
  const stats = content.philanthropy?.stats || [];

  const getAlignClass = (align?: 'left' | 'center' | 'right' | 'justify') => {
    if (align === 'left') return 'text-left';
    if (align === 'right') return 'text-right';
    if (align === 'center') return 'text-center';
    if (align === 'justify') return 'text-justify';
    return 'text-justify';
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    const isCompleted = s.includes('concluid') || s.includes('encerrad') || s.includes('meta atingida') || s.includes('finaliz');
    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 border border-slate-300 text-slate-600 text-[9px] font-black uppercase tracking-wider">
          <CheckCircle className="w-3 h-3" /> {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[9px] font-black uppercase tracking-wider">
        <Sparkles className="w-3 h-3 animate-pulse" /> {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-aged-beige overflow-x-hidden">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden border-b border-[#c5a059]/10">
          <div className="absolute inset-0 bg-gold-900/5 mix-blend-overlay pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl blur-[120px] opacity-10 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#c5a059] rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#c5a059]/60 rounded-full" />
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#c5a059]/20 bg-[#c5a059]/5 mb-6"
              >
                <Heart className="w-3 h-3 text-[#c5a059] fill-[#c5a059]/20" />
                <span className="text-[9px] md:text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[#c5a059]">{content.philanthropy?.smallTitle || "Filantropia e Impacto Social"}</span>
              </motion.div>
            </div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`font-serif text-3xl md:text-6xl font-bold text-[#0b1d3a] mb-6 md:mb-8 tracking-wider uppercase leading-tight text-center`}
            >
              <span className={getAlignClass(titleAlign)}>{titleText}</span> <span className={`gold-text ${getAlignClass(subTitleAlign)}`}>{subTitleText}</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`max-w-3xl mx-auto text-[#0b1d3a]/80 font-sans text-base md:text-lg leading-relaxed px-2 ${getAlignClass(descAlign)}`}
            >
              {descText}
            </motion.p>
          </div>
        </section>

        {/* Stats Section */}
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

        {/* Campaigns / Projects Section */}
        <section className="py-16 md:py-24 bg-aged-beige">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12 md:mb-16">
              <div className="max-w-2xl text-left">
                <div className="flex items-center gap-2 text-[#c5a059] mb-3 uppercase tracking-[0.4em] text-[9px] md:text-[10px] font-bold">
                  <HandHeart className="w-4 h-4" /> Impacto Real
                </div>
                <h2 className="font-serif text-2xl md:text-5xl font-bold text-[#0b1d3a] uppercase tracking-wider">
                  Nossas Campanhas <br /> <span className="gold-text">e Projetos Ativos</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {campaigns.map((camp: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative rounded-[2rem] bg-white/50 border border-[#c5a059]/10 hover:border-[#c5a059]/40 transition-all flex flex-col overflow-hidden shadow-sm hover:shadow-xl"
                >
                  {/* Campaign Image */}
                  {camp.image ? (
                    <div className="relative h-56 w-full overflow-hidden shrink-0">
                      <img
                        src={camp.image}
                        alt={camp.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute top-4 right-4 z-10">
                        {getStatusBadge(camp.status)}
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-44 w-full bg-[#0b1d3a]/5 flex items-center justify-center text-[#c5a059] shrink-0 border-b border-[#0b1d3a]/5">
                      <div className="w-16 h-16 rounded-full bg-[#c5a059]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <HandHeart className="w-8 h-8" />
                      </div>
                      <div className="absolute top-4 right-4 z-10">
                        {getStatusBadge(camp.status)}
                      </div>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between items-start text-left">
                    <div className="space-y-3 w-full">
                      <h3 className="text-xl md:text-2xl font-serif font-bold text-[#0b1d3a] group-hover:text-[#c5a059] transition-colors line-clamp-2 leading-tight">
                        {camp.title}
                      </h3>
                      <p className="text-[#0b1d3a]/70 leading-relaxed font-sans text-xs md:text-sm line-clamp-4">
                        {camp.description}
                      </p>
                    </div>

                    {camp.link && (
                      <div className="pt-6 w-full mt-auto">
                        <a
                          href={camp.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0b1d3a] hover:bg-[#c5a059] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-px"
                        >
                          <Heart className="w-4 h-4 fill-white/20" /> Apoiar Iniciativa
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {campaigns.length === 0 && (
                <div className="col-span-full text-center py-12 text-sm text-[#0b1d3a]/50 font-sans font-semibold bg-white/40 border border-[#c5a059]/10 rounded-2xl">
                  Nenhuma campanha cadastrada no momento. Por favor, volte mais tarde ou confira nossas iniciativas passadas.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        {gallery && gallery.length > 0 && (
          <section className="py-16 md:py-24 bg-white/30 border-t border-[#c5a059]/10">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center gap-2 text-[#c5a059] mb-3 uppercase tracking-[0.4em] text-[9px] md:text-[10px] font-bold">
                  <Images className="w-4 h-4" /> Registros Fraternos
                </div>
                <h2 className="font-serif text-2xl md:text-5xl font-bold text-[#0b1d3a] uppercase tracking-wider text-center">
                  Galeria de <span className="gold-text">Ações Realizadas</span>
                </h2>
                <p className="max-w-2xl mx-auto text-[#0b1d3a]/60 font-sans text-xs md:text-sm mt-3 text-center leading-relaxed">
                  Testemunhos visuais de amor fraterno em atos gloriosos, registrando o impacto de nossas obras de solidariedade no plano social.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {gallery.map((imgUrl, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative h-64 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-[#0b1d3a]/5 bg-white/50"
                  >
                    <img
                      src={imgUrl}
                      alt={`Ação Social Realizada ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1d3a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white font-sans text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Ação Realizada
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}