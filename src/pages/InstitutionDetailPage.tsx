import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, ShieldCheck, Star, ChevronLeft, Users, Landmark, ScrollText } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useContent } from '../context/ContentContext';

export default function InstitutionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { content } = useContent();

  const familyGroupsMap: any = {
    'guardias-da-alianca': {
      data: content.familyGroups?.guardians,
      icon: Heart,
      color: "text-[#c5a059]",
      quote: "A mão que balança o berço é a mesma que governa o mundo."
    },
    'demolay': {
      data: content.familyGroups?.demolay,
      icon: ShieldCheck,
      color: "text-[#c5a059]",
      quote: "Investir na juventude é garantir o futuro da humanidade."
    },
    'rainbow-girls': {
      data: content.familyGroups?.daughters,
      icon: Star,
      color: "text-[#c5a059]",
      quote: "Investir na juventude é garantir o futuro da humanidade."
    }
  };

  const selectedGroupId = id === 'guardias-da-alianca' ? 'guardias-da-alianca' : id === 'demolay' ? 'demolay' : 'rainbow-girls';
  const groupConfig = familyGroupsMap[id || ''];
  const institution = groupConfig?.data;

  if (!institution) return null;

  const Icon = groupConfig.icon;

  return (
    <div className="min-h-screen bg-masonic-dark">
      <Navbar />
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-masonic-gold hover:text-masonic-gold/80 transition-colors uppercase tracking-[0.2em] text-[10px] font-bold mb-8"
          >
            <ChevronLeft className="w-3 h-3" />
            Voltar ao Início
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-masonic-gold/10 border border-masonic-gold/30 flex items-center justify-center text-masonic-gold">
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <span className="uppercase tracking-[0.4em] text-masonic-gold text-[10px] font-bold">{institution.subTitle}</span>
                  <h1 className="font-serif text-3xl md:text-5xl font-bold text-white uppercase tracking-wider">{institution.name || institution.title}</h1>
                </div>
              </div>
              <p className="text-gold-100 text-lg leading-relaxed mb-8 font-sans">
                {institution.description}
              </p>
              
              <div className="flex flex-wrap gap-3">
                {institution.values?.map((v: string, i: number) => (
                  <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase font-black tracking-widest text-masonic-gold">
                    {v}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-masonic-gold/20"
            >
              <img src={institution.image || institution.photo || institution.logo} alt={institution.name || institution.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
             <div className="p-10 rounded-[2rem] bg-white/5 border border-white/10 hover:border-masonic-gold/30 transition-all group">
                <Users className="w-10 h-10 text-masonic-gold mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-serif font-bold text-white mb-4 uppercase tracking-wider">Missão</h3>
                <p className="text-gold-50/70 text-sm leading-relaxed">{institution.mission}</p>
             </div>
             <div className="p-10 rounded-[2rem] bg-white/5 border border-white/10 hover:border-masonic-gold/30 transition-all group">
                <Landmark className="w-10 h-10 text-masonic-gold mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-serif font-bold text-white mb-4 uppercase tracking-wider">Visão</h3>
                <p className="text-gold-50/70 text-sm leading-relaxed">{institution.vision}</p>
             </div>
             <div className="p-10 rounded-[2rem] bg-white/5 border border-white/10 hover:border-masonic-gold/30 transition-all group">
                <ScrollText className="w-10 h-10 text-masonic-gold mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-serif font-bold text-white mb-4 uppercase tracking-wider">Breve História</h3>
                <p className="text-gold-50/70 text-sm leading-relaxed">{institution.history}</p>
             </div>
          </div>

          <div className="text-center p-16 rounded-[3rem] bg-masonic-gold/5 border border-masonic-gold/10">
             <h2 className="font-serif text-2xl md:text-3xl text-white mb-8 uppercase tracking-widest leading-relaxed italic opacity-80">
                "{groupConfig.quote}"
             </h2>
             <button 
               onClick={() => navigate('/quero-participar')}
               className="px-10 py-4 bg-masonic-gold text-masonic-dark font-black uppercase tracking-[0.2em] text-[10px] rounded-full hover:bg-masonic-gold/80 transition-all shadow-xl"
             >
                Solicitar Mais Informações
             </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
