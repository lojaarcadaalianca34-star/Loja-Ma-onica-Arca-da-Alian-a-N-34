import React from 'react';
import { motion } from 'motion/react';
import { Award, Crown, User } from 'lucide-react';
import { useContent } from '@/src/context/ContentContext';
import { Link } from 'react-router-dom';

export default function PastMasters() {
  const { content } = useContent();

  const management = content.management || [];
  const masters = [...(content.masters || [])].reverse();

  return (
    <section id="galeria" className="py-12 bg-masonic-dark overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Atual Gestão */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/50 flex items-center justify-center">
              <User className="text-gold-500 w-5 h-5" />
            </div>
            <div>
              <span className="uppercase tracking-[0.4em] text-gold-500 text-[10px] font-bold">Liderança</span>
              <h2 className="font-serif text-2xl font-bold text-white uppercase tracking-wider">Atual <span className="gold-text">Gestão</span></h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {management.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-masonic-blue/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center group hover:border-gold-500/40 transition-all font-sans relative overflow-hidden"
              >
                {(item as any).photo && (
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-gold-500/20 group-hover:border-gold-500/80 transition-all overflow-hidden bg-black/20">
                    <img src={(item as any).photo} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
                <p className="text-gold-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-3">{item.role}</p>
                <h3 className="text-white text-base font-bold">{item.name}</h3>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-gold-500/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Galeria de Honra */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Crown className="w-8 h-8 text-gold-500 animate-pulse" />
          </div>
          <Link 
            to="/galeria-honra"
            className="group inline-flex flex-col items-center gap-3"
          >
            <h2 className="font-serif text-3xl font-bold text-white mb-2 uppercase tracking-[0.1em] group-hover:gold-text transition-colors cursor-pointer text-center">
              Galeria de <span className="gold-text underline decoration-gold-500/30 underline-offset-8">Honra</span>
            </h2>
            <p className="text-gold-200/90 font-sans tracking-[0.2em] uppercase text-[10px] group-hover:text-gold-400 transition-colors text-center">
              Clique para ver todos os Past Veneráveis Mestres
            </p>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {masters.slice(0, 6).map((master, index) => (
            <Link
              key={master.id}
              to={`/veneravel/${master.id}`}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group p-1 bg-gradient-to-b from-gold-100/40 to-transparent rounded-2xl cursor-pointer"
              >
                <div className="bg-masonic-blue p-8 rounded-2xl flex flex-col items-center text-center border border-gold-500/10 group-hover:border-gold-500/40 transition-all shadow-xl">
                  <div className="w-32 h-32 rounded-full border-4 border-gold-500/30 mb-6 flex items-center justify-center bg-white/5 relative overflow-hidden group-hover:border-gold-500 transition-all shadow-[0_0_20px_rgba(230,176,0,0.15)]">
                    {master.photo ? (
                      <img src={master.photo} alt={master.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Award className="w-16 h-16 text-gold-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                  <h3 className="font-serif text-xl font-bold text-white mb-1 group-hover:gold-text transition-colors">{master.name}</h3>
                  <p className="text-gold-500 text-[10px] uppercase tracking-[0.3em] font-bold mb-3">{master.role}</p>
                  <div className="h-[1px] w-12 bg-white/10 mb-3" />
                  <p className="text-gold-50/70 text-xs font-sans italic">{master.period}</p>
                  <div className="mt-4 text-[10px] uppercase tracking-widest text-gold-500 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    Ver Jornada →
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

