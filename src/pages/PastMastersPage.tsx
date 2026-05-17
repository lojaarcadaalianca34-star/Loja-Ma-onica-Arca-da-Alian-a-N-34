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
    <div className="min-h-screen bg-aged-beige">
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
              className="flex items-center gap-2 text-[#c5a059] hover:text-[#0b1d3a] transition-colors uppercase tracking-[0.2em] text-[10px] font-bold mb-6"
            >
              <ChevronLeft className="w-3 h-3" />
              Voltar ao Início
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/50 flex items-center justify-center text-[#c5a059] mb-6 shadow-sm">
                <User className="w-6 h-6" />
              </div>
              <h1 className="font-cinzel text-3xl md:text-5xl font-bold text-[#0b1d3a] uppercase tracking-wider mb-2 leading-tight">
                Galeria de Honra
              </h1>
              <p className="text-[#c5a059] font-playfair text-lg md:text-2xl font-bold tracking-[0.1em] mb-4">
                Past Veneráveis Mestres da Loja Arca da Aliança Nº 34
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(() => {
              const mastersData = [...(content.masters || []), ...(content.mastersSection?.masters || [])];
              // Map by ID but prioritize the one that has a photo
              const map = new Map();
              mastersData.forEach(m => {
                if (!map.has(m.id) || (!map.get(m.id).photo && m.photo)) {
                  map.set(m.id, m);
                }
              });
              return Array.from(map.values()).reverse();
            })().map((master: any, index: number) => (
              <motion.div
                key={master.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/veneravel/${master.id}`)}
                className="group relative bg-[#f4efe2] border-[2px] border-[#c5a059] overflow-hidden rounded-sm cursor-pointer shadow-lg flex flex-col h-full"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-black/5">
                  {master.photo ? (
                    <img src={master.photo} alt={master.name} className="w-full h-full object-cover transition-transform duration-[600ms] group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-[#c5a059] opacity-20" />
                    </div>
                  )}
                </div>
                
                <div className="bg-[#0b1d3a] border-t-[2px] border-[#c5a059] p-6 flex-1 flex flex-col items-center text-center">
                  <h3 className="font-playfair italic text-[#c5a059] text-xl font-bold mb-2 group-hover:text-white transition-colors">
                    {master.name}
                  </h3>
                  <p className="text-white text-[10px] uppercase tracking-[0.2em] font-bold mb-3">{master.role}</p>
                  <div className="h-[2px] w-8 bg-[#c5a059] mb-4" />
                  <p className="text-white/70 text-xs font-sans italic">{master.period}</p>
                  <div className="mt-6 text-[10px] uppercase tracking-widest text-[#c5a059] flex items-center gap-2 group-hover:gap-4 transition-all font-black">
                    Ver Jornada <span>→</span>
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
