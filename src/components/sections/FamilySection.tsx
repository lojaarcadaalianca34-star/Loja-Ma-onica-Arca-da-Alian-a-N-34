import React from 'react';
import { motion } from 'motion/react';
import { Users, Heart, ShieldCheck, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContent } from '../../context/ContentContext';

export default function FamilySection() {
  const { content } = useContent();
  
  if (!content.familyGroups) return null;

  const groups = [
    {
      id: "guardias-da-alianca",
      name: content.familyGroups.guardians.name || content.familyGroups.guardians.title || "As Guardiãs da Aliança",
      subTitle: content.familyGroups.guardians.subTitle,
      description: content.familyGroups.guardians.description,
      icon: Heart,
      logo: content.familyGroups.guardians.image || content.familyGroups.guardians.photo || content.familyGroups.guardians.logo || ""
    },
    {
      id: "demolay",
      name: content.familyGroups.demolay.name || content.familyGroups.demolay.title || "Ordem DeMolay",
      subTitle: content.familyGroups.demolay.subTitle,
      description: content.familyGroups.demolay.description,
      icon: ShieldCheck,
      logo: content.familyGroups.demolay.image || content.familyGroups.demolay.photo || content.familyGroups.demolay.logo || ""
    },
    {
      id: "rainbow-girls",
      name: content.familyGroups.daughters.name || content.familyGroups.daughters.title || "Garotas do Arco-Íris",
      subTitle: content.familyGroups.daughters.subTitle,
      description: content.familyGroups.daughters.description,
      icon: Star,
      logo: content.familyGroups.daughters.image || content.familyGroups.daughters.photo || content.familyGroups.daughters.logo || ""
    },
  ];

  return (
    <section id="espaco-familia" className="py-24 bg-aged-beige relative overflow-hidden">
      <div className="absolute inset-0 bg-[#c5a059]/5 mix-blend-color pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-10">
             <div className="w-16 h-16 rounded-3xl border-2 border-[#c5a059] rotate-45 flex items-center justify-center shadow-lg bg-white/60">
               <Users className="w-8 h-8 text-[#c5a059] -rotate-45" />
             </div>
          </div>
          <span className="uppercase tracking-[0.4em] text-[#c5a059] text-[10px] font-black block mb-2">{content.familyGroups?.smallTitle || 'Espaço da Família'}</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#0b1d3a] mb-6 uppercase tracking-wider">{content.familyGroups?.title || 'Espaço da Família'}</h2>
          <p className="max-w-xl mx-auto text-[#0b1d3a]/60 font-sans text-base leading-relaxed">{content.familyGroups?.subTitle || 'A Maçonaria valoriza a base familiar como o alicerce fundamental da sociedade. Conheça e apoie as ordens patrocinadas e parceiras.'}</p>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {groups.map((group, index) => (
            <Link key={index} to={`/instituicao/${group.id}`} className="block">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className="flex flex-col items-center text-center group cursor-pointer h-full p-8 rounded-[2rem] hover:bg-white/40 transition-all border border-transparent hover:border-[#c5a059]/20 shadow-sm hover:shadow-xl"
              >
                <div className="mb-8 relative">
                  {/* Outer Ring */}
                  <div className="absolute inset-0 border-2 border-[#c5a059]/30 rounded-full scale-125 group-hover:scale-150 transition-all duration-1000" />
                  
                  {/* Logo Container */}
                    <div className="w-24 h-24 rounded-full bg-white border-2 border-[#c5a059]/40 flex items-center justify-center group-hover:border-[#c5a059] transition-all duration-500 overflow-hidden relative shadow-md">
                    {group.logo ? (
                      <img 
                        src={group.logo} 
                        alt={group.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <group.icon className="w-10 h-10 text-[#c5a059]/40" />
                    )}
                  </div>
                </div>

                <h3 className="text-2xl font-serif font-bold text-[#0b1d3a] mb-2 group-hover:text-[#c5a059] transition-all">{group.name}</h3>
                <p className="text-[#c5a059] text-[10px] uppercase font-black tracking-[0.4em] mb-4">{group.subTitle}</p>
                <p className="text-[#0b1d3a]/50 text-sm leading-relaxed mb-6 italic px-4">"{group.description}"</p>
                
                <div className="mt-auto pt-4 flex items-center gap-3 group-hover:gap-5 transition-all text-[#c5a059]">
                  <span className="text-[10px] uppercase tracking-widest font-black opacity-60 group-hover:opacity-100">
                    Acessar Memorial
                  </span>
                  <div className="h-px w-8 bg-[#c5a059]/40 group-hover:w-12 group-hover:bg-[#c5a059] transition-all" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
