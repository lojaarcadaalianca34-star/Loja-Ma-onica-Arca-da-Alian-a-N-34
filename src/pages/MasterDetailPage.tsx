import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { User, ChevronLeft, Heart, Calendar, GraduationCap, Award, BookOpen, Clock, Activity } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useContent } from '../context/ContentContext';

export default function MasterDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { content } = useContent();

  const master = content.masters.find(m => m.id === id);

  if (!master) {
    return (
      <div className="min-h-screen bg-masonic-dark flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-white text-3xl font-serif mb-4">Mestre não encontrado</h1>
        <button onClick={() => navigate('/galeria-honra')} className="text-gold-500 underline uppercase tracking-widest text-sm">Voltar à Galeria</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-masonic-dark">
      <Navbar />
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={() => navigate('/galeria-honra')}
            className="flex items-center gap-2 text-gold-500 hover:text-gold-400 transition-colors uppercase tracking-[0.2em] text-[10px] font-bold mb-8"
          >
            <ChevronLeft className="w-3 h-3" />
            Voltar para Galeria
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Base Sidebar-like container */}
            <div className="lg:col-span-4 space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-masonic-blue rounded-[2rem] p-8 border border-gold-500/10 text-center shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-10">
                   <User className="w-24 h-24 text-gold-500" />
                </div>
                <div className="w-40 h-56 mx-auto rounded-2xl border-4 border-gold-500/20 mb-6 flex items-center justify-center bg-white/5 relative overflow-hidden shadow-2xl">
                  {master.photo ? (
                    <img src={master.photo} alt={master.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-16 h-16 text-gold-500/30" />
                  )}
                </div>
                <h1 className="font-serif text-2xl font-bold text-white mb-2 uppercase tracking-tight leading-tight">{master.name}</h1>
                <p className="text-gold-500 font-bold uppercase tracking-[0.4em] text-xs mb-4">{master.role}</p>
                <div className="inline-block px-6 py-2 bg-white/5 border border-white/10 rounded-full text-white/90 text-xs font-bold tracking-[0.2em] uppercase mb-4">
                  Gestão {master.period}
                </div>
              </motion.div>

              {/* Badges/Stats */}
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { icon: Award, label: "Grau", value: master.degree || "33º" },
                   { icon: Clock, label: "Anos de Ordem", value: master.orderTime || "25+" }
                 ].map((stat, i) => (
                   <div key={i} className="bg-masonic-blue p-6 rounded-3xl border border-white/5 text-center">
                     <stat.icon className="w-5 h-5 text-gold-500 mx-auto mb-2" />
                     <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">{stat.label}</p>
                     <p className="text-white font-bold">{stat.value}</p>
                   </div>
                 ))}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-12">
               <motion.section 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.1 }}
                 className="space-y-6"
               >
                 <div className="flex items-center gap-3 mb-2">
                    <GraduationCap className="text-gold-500 w-6 h-6" />
                    <h2 className="text-gold-500 font-serif text-2xl uppercase tracking-widest font-bold">Biografia Maçônica</h2>
                 </div>
                 <div className="p-8 bg-masonic-blue border border-white/5 rounded-[2rem] shadow-xl">
                   <p className="text-white/80 leading-relaxed text-lg font-sans italic">
                     "{master.biography}"
                   </p>
                 </div>
               </motion.section>

               {master.firstLady && (
                 <motion.section 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full bg-masonic-blue/80 border border-gold-500/10 rounded-[2.5rem] p-10 text-left shadow-2xl relative overflow-hidden"
                 >
                    <div className="absolute -right-12 -top-12 opacity-5">
                       <Heart className="w-64 h-64 text-pink-500" />
                    </div>
                    <div className="flex items-center gap-4 mb-8">
                       <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                          <Heart className="text-pink-500 w-6 h-6 fill-pink-500/20" />
                       </div>
                       <span className="text-pink-500 text-xs md:text-sm uppercase font-black tracking-[0.3em] font-sans">Cunhada / Primeira Dama</span>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                       <div className="w-32 h-44 flex-shrink-0 rounded-2xl border-2 border-pink-500/20 overflow-hidden bg-white/5">
                          {master.firstLady.photo ? (
                             <img src={master.firstLady.photo} alt={master.firstLady.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center text-pink-500/20">
                                <User className="w-12 h-12" />
                             </div>
                          )}
                       </div>
                       <div>
                          <h3 className="font-serif text-3xl text-white font-bold mb-4">{master.firstLady.name}</h3>
                          <p className="text-white/80 text-lg leading-relaxed font-sans italic border-l-2 border-pink-500/30 pl-6 py-2">
                             "{master.firstLady.biography}"
                          </p>
                       </div>
                    </div>
                 </motion.section>
               )}

               <motion.section
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.3 }}
                 className="p-12 bg-gradient-to-br from-gold-500/10 to-transparent rounded-[2.5rem] border border-gold-500/20 relative group"
               >
                  <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-gold-500/40 rounded-tl-[2.5rem]" />
                  <div className="flex items-center gap-4 mb-8">
                    <Calendar className="text-gold-500 w-8 h-8" />
                    <h4 className="text-white font-serif text-3xl font-bold uppercase tracking-tight">Legado Ritualístico</h4>
                  </div>
                  <p className="text-white/90 text-xl leading-relaxed italic font-serif">
                    "{master.ritualLegacy || "O trabalho contínuo no desbaste da pedra bruta é a nossa maior missão. Durante esta gestão, buscamos polir não apenas o templo físico, mas o templo em cada um de nossos corações."}"
                  </p>
               </motion.section>

               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.4 }}
                 className="grid grid-cols-1 md:grid-cols-2 gap-8"
               >
                 <div className="p-8 bg-masonic-blue rounded-3xl border border-white/5 hover:border-gold-500/30 transition-all group">
                    <BookOpen className="text-gold-500 mb-4 group-hover:scale-110 transition-transform" />
                    <h5 className="text-white font-bold mb-2">Pautas Atendidas</h5>
                    <p className="text-white/60 text-sm">{master.agendaHighlights || "Mais de 48 sessões rituais conduzidas com excelência e rigor litúrgico."}</p>
                 </div>
                 <div className="p-8 bg-masonic-blue rounded-3xl border border-white/5 hover:border-gold-500/30 transition-all group">
                    <Activity className="text-gold-500 mb-4 group-hover:scale-110 transition-transform" />
                    <h5 className="text-white font-bold mb-2">Crescimento das Colunas</h5>
                    <p className="text-white/60 text-sm">{master.columnGrowth || "Integração de novos obreiros e fortalecimento da egrégora do oriente."}</p>
                 </div>
               </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
