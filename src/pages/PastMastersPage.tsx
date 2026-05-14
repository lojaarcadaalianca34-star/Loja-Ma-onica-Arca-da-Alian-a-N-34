import React from 'react';
import { motion } from 'motion/react';
import { User, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useContent } from '../context/ContentContext';

export default function PastMastersPage() {
  const { content } = useContent();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-masonic-dark">
      <Navbar />
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gold-500 hover:text-gold-400 transition-colors uppercase tracking-[0.2em] text-[10px] font-bold mb-6"
            >
              <ChevronLeft className="w-3 h-3" />
              Voltar ao Início
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/50 flex items-center justify-center text-gold-500 mb-6 shadow-[0_0_20px_rgba(230,176,0,0.2)]">
                <User className="w-6 h-6" />
              </div>
              <h1 className="font-serif text-3xl md:text-5xl font-bold text-white uppercase tracking-wider mb-2 leading-tight">
                Galeria de Honra
              </h1>
              <p className="text-gold-500 font-serif text-lg md:text-2xl font-bold tracking-[0.1em] mb-4">
                Past Veneráveis Mestres da Loja Arca da Aliança Nº 34
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.masters.map((master, index) => (
              <motion.div
                key={master.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/veneravel/${master.id}`)}
                className="group relative p-1 bg-gradient-to-b from-gold-100/40 to-transparent rounded-2xl cursor-pointer"
              >
                <div className="bg-masonic-blue p-8 h-full rounded-2xl flex flex-col items-center text-center border border-gold-500/10 group-hover:border-gold-500/40 transition-all shadow-xl">
                  <div className="w-32 h-32 rounded-full border-4 border-gold-500/30 mb-6 flex items-center justify-center bg-white/5 relative overflow-hidden group-hover:border-gold-500 transition-all shadow-[0_0_20px_rgba(230,176,0,0.1)]">
                    {master.photo ? (
                      <img src={master.photo} alt={master.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-gold-500/30" />
                    )}
                  </div>
                  <h3 className="font-serif text-xl font-bold text-white mb-1 group-hover:gold-text transition-colors">{master.name}</h3>
                  <p className="text-gold-500 text-[10px] uppercase tracking-[0.3em] font-bold mb-3">{master.role}</p>
                  <div className="h-[1px] w-12 bg-white/10 mb-3" />
                  <p className="text-gold-50/70 text-xs font-sans italic">{master.period}</p>
                  <div className="mt-6 text-[10px] uppercase tracking-widest text-gold-500 flex items-center gap-2 group-hover:gap-4 transition-all">
                    Ver Jornada Completa <span>→</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
