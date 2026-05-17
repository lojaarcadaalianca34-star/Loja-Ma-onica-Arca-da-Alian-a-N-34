import React from 'react';
import { motion } from 'motion/react';
import { Award, Crown, User } from 'lucide-react';
import { useContent } from '@/src/context/ContentContext';
import { Link } from 'react-router-dom';

export default function PastMasters() {
  const { content } = useContent();

  const management = content.management || [];
  const masters = [...(content.masters || []), ...(content.mastersSection?.masters || [])].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).reverse();

  if (masters.length === 0 && !content.mastersSection?.masters) return null;

  return (
    <section id="galeria" className="py-24 bg-aged-beige overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Atual Gestão */}
        <div className="mb-24 px-4 lg:px-0">
          <div className="flex flex-col items-center justify-center text-center gap-6 mb-12">
            <div>
              <div className="flex items-center justify-center gap-3 text-[#c5a059] mb-4 uppercase tracking-[0.4em] text-[10px] font-black">
                <User className="w-4 h-4" />
                {content.managementSection?.smallTitle || 'LIDERANÇA'}
              </div>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#0b1d3a] uppercase tracking-wider leading-tight text-center">
                {content.managementSection?.title || 'Atual Gestão'}
              </h2>
            </div>
            {content.managementSection?.subTitle && (
              <p className="max-w-md text-[#0b1d3a]/60 text-sm font-medium italic border-t-2 border-[#c5a059] pt-4 text-center">
                {content.managementSection.subTitle}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {management.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#f4efe2] border-[2px] border-[#c5a059] text-center group transition-all font-sans relative overflow-hidden flex flex-col h-full shadow-lg"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-black/5">
                  {(item as any).photo ? (
                    <img 
                      src={(item as any).photo} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-[600ms] ease-in-out group-hover:scale-110" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-[#c5a059] opacity-20" />
                    </div>
                  )}
                </div>
                
                <div className="bg-[#0b1d3a] border-t-[2px] border-[#c5a059] p-4 flex-1 flex flex-col justify-center gap-1">
                  <h3 className="font-playfair italic text-[#c5a059] text-base font-bold leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-white text-[10px] uppercase tracking-wider font-sans font-medium">
                    {item.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center mb-16 px-4">
          <div className="flex justify-center mb-10">
            <div className="p-4 rounded-full bg-[#0b1d3a]/5 border border-[#c5a059]/20 shadow-inner">
              <Crown className="w-12 h-12 text-[#c5a059]" />
            </div>
          </div>
          <Link 
            to="/galeria-honra"
            className="group inline-flex flex-col items-center gap-6"
          >
            <span className="uppercase tracking-[0.6em] text-[#c5a059] text-xs font-black">{content.mastersSection?.smallTitle || 'Galeria de Honra'}</span>
            <h2 className="font-serif text-4xl md:text-6xl font-bold text-[#0b1d3a] mb-2 uppercase tracking-[0.1em] transition-all duration-300">
              {content.mastersSection?.title || 'Galeria de Honra'}
            </h2>
            <div className="w-24 h-[3px] bg-[#c5a059] rounded-full mb-6 transform origin-center transition-all duration-500 group-hover:scale-x-150" />
            <p className="text-[#0b1d3a]/60 font-sans tracking-[0.2em] uppercase text-[10px] font-bold group-hover:text-[#c5a059] transition-colors text-center max-w-lg mx-auto">
              {content.mastersSection?.subTitle || 'Clique para ver todos os Past Veneráveis Mestres'}
            </p>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {masters.slice(0, 6).map((master, index) => (
            <Link
              key={master.id}
              to={`/veneravel/${master.id}`}
              className="block h-full"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="relative group bg-[#f4efe2] border-[2px] border-[#c5a059] shadow-2xl overflow-hidden cursor-pointer h-full flex flex-col"
              >
                {/* Imagem com Zoom */}
                <div className="relative aspect-[4/5] overflow-hidden bg-[#0b1d3a]/5">
                  {master.photo ? (
                    <img 
                      src={master.photo} 
                      alt={master.name} 
                      className="w-full h-full object-cover transition-transform duration-[600ms] ease-in-out group-hover:scale-110" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Award className="w-20 h-20 text-[#c5a059] opacity-20 group-hover:opacity-40 transition-opacity" />
                    </div>
                  )}
                  {/* Overlay gradiente suave na foto */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Faixa Inferior Marinho */}
                <div className="bg-[#0b1d3a] border-t-[2px] border-[#c5a059] p-8 relative flex-1 flex flex-col justify-center text-center">
                   <h3 className="font-playfair italic text-2xl font-bold text-[#c5a059] mb-2 drop-shadow-sm">{master.name}</h3>
                   <div className="flex flex-col gap-1 items-center">
                     <p className="text-white/60 text-[9px] uppercase tracking-[0.4em] font-black">{master.role}</p>
                     <p className="text-white text-[11px] font-sans font-medium tracking-widest">{master.period}</p>
                   </div>
                   
                   {/* Botão sutil decorativo */}
                   <div className="mt-5 pt-4 border-t border-white/5 flex justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                     <span className="text-[#c5a059] text-[9px] font-black uppercase tracking-[0.3em]">Conhecer Trajetória</span>
                   </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {masters.length > 6 && (
          <div className="mt-20 text-center">
            <Link 
              to="/galeria-honra"
              className="px-12 py-5 bg-[#0b1d3a] text-[#c5a059] font-black rounded-lg text-xs uppercase tracking-[0.2em] hover:bg-[#c5a059] hover:text-[#0b1d3a] transition-all shadow-2xl inline-flex items-center gap-4 group"
            >
              Ver Galeria Completa de Honra
              <span className="group-hover:translate-x-2 transition-transform">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

