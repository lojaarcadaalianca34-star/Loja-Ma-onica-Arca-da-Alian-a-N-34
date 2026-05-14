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
      name: content.familyGroups.guardians.title,
      subTitle: "As Cunhadas",
      description: content.familyGroups.guardians.description,
      icon: Heart,
      logo: content.familyGroups.guardians.photo || "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=200&auto=format&fit=crop"
    },
    {
      id: "demolay",
      name: content.familyGroups.demolay.title,
      subTitle: "Ordem DeMolay",
      description: content.familyGroups.demolay.description,
      icon: ShieldCheck,
      logo: content.familyGroups.demolay.photo || "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200&auto=format&fit=crop"
    },
    {
      id: "daughters",
      name: content.familyGroups.daughters.title,
      subTitle: "Filhas de Jó",
      description: content.familyGroups.daughters.description,
      icon: Star,
      logo: content.familyGroups.daughters.photo || "https://images.unsplash.com/photo-1594913785162-e678329b350f?q=80&w=200&auto=format&fit=crop"
    },
  ];

  return (
    <section className="py-24 bg-masonic-dark relative overflow-hidden">
      <div className="absolute inset-0 bg-gold-500/5 mix-blend-color pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
             <div className="w-16 h-16 rounded-3xl border-2 border-gold-500 rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(230,176,0,0.3)]">
               <Users className="w-8 h-8 text-gold-500 -rotate-45" />
             </div>
          </div>
          <h2 className="font-serif text-4xl font-bold text-white mb-4 uppercase tracking-wider">Espaço da <span className="gold-text">Família</span></h2>
          <p className="max-w-xl mx-auto text-gold-100/60 font-sans text-sm">A Maçonaria valoriza a base familiar como o alicerce fundamental da sociedade. Conheça e apoie as ordens patrocinadas e parceiras.</p>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {groups.map((group, index) => (
            <Link key={index} to={`/instituicao/${group.id}`} className="block">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className="flex flex-col items-center text-center group cursor-pointer h-full"
              >
                <div className="mb-8 relative">
                  {/* Outer Ring */}
                  <div className="absolute inset-0 border-2 border-gold-500/10 rounded-full scale-125 group-hover:scale-150 group-hover:opacity-0 transition-all duration-1000" />
                  
                  {/* Logo Container */}
                  <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-gold-500 transition-all duration-500 overflow-hidden relative shadow-2xl">
                    <img 
                      src={group.logo} 
                      alt={group.name} 
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-all duration-500 grayscale group-hover:grayscale-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-masonic-dark/40 group-hover:bg-transparent transition-all" />
                  </div>
                </div>

                <h3 className="text-2xl font-serif font-bold text-white mb-1 group-hover:gold-text transition-all">{group.name}</h3>
                <p className="text-gold-500 text-[10px] uppercase font-black tracking-[0.4em] mb-4">{group.subTitle}</p>
                <p className="text-gold-100/40 text-sm leading-relaxed mb-6 italic px-4">"{group.description}"</p>
                
                <div className="mt-auto pt-4 flex items-center gap-2 group-hover:gap-4 transition-all text-gold-500">
                  <span className="text-[10px] uppercase tracking-widest font-black opacity-40 group-hover:opacity-100">
                    Acessar Memorial
                  </span>
                  <div className="h-px w-8 bg-gold-500/20 group-hover:w-12 group-hover:bg-gold-500 transition-all" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
