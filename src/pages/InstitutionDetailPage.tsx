import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, ShieldCheck, Star, ChevronLeft, Users, Landmark, ScrollText } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const institutions = {
  'guardias-da-alianca': {
    name: "As Guardiãs da Aliança",
    subTitle: "As Cunhadas",
    icon: Heart,
    color: "text-red-500",
    description: "As Guardiãs da Aliança é a ala feminina que reúne as esposas, companheiras e familiares dos obreiros da Loja Arca da Aliança Nº 34.",
    mission: "Promover a integração das famílias, organizar eventos beneficentes e oferecer suporte emocional e social à comunidade maçônica e regional.",
    vision: "Ser reconhecida como um pilar de amor e caridade, fortalecendo a base familiar dos maçons e impactando positivamente a sociedade.",
    values: ["Amor ao Próximo", "Fraternidade", "Dedicação", "Trabalho em Equipe"],
    history: "Fundada junto com a consolidação da oficina, o grupo de cunhadas sempre foi o braço direito nas ações sociais, transformando reuniões em momentos de união familiar.",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop"
  },
  'demolay': {
    name: "Ordem DeMolay",
    subTitle: "Capítulo Local",
    icon: ShieldCheck,
    color: "text-blue-500",
    description: "A Ordem DeMolay é uma organização juvenil patrocinada pela Maçonaria para jovens do sexo masculino entre 12 e 21 anos.",
    mission: "Construir o caráter dos jovens através das sete virtudes cardeais: Amor Filial, Reverência pelas Coisas Sagradas, Cortesia, Companheirismo, Fidelidade, Pureza e Patriotismo.",
    vision: "Preparar jovens para serem cidadãos de bem e líderes exemplares em suas comunidades.",
    values: ["Liderança", "Honestidade", "Respeito", "Responsabilidade"],
    history: "O Capítulo Arca da Aliança da Ordem DeMolay foi instalado para guiar a juventude masculina do Guará, seguindo os preceitos de Jacques DeMolay.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop"
  },
  'rainbow-girls': {
    name: "Garotas do Arco-Íris",
    subTitle: "Assembleia Local",
    icon: Star,
    color: "text-purple-500",
    description: "A Ordem Internacional das Filhas do Arco-Íris é uma organização para meninas entre 11 e 20 anos, focada no serviço e na liderança.",
    mission: "Ensinar autoconfiança, liderança e serviço à comunidade através de lições baseadas no simbolismo das cores do arco-íris.",
    vision: "Inspirar garotas a serem o melhor de si mesmas, agindo com bondade e coragem no mundo moderno.",
    values: ["Amor", "Religião", "Natureza", "Imortalidade", "Fidelidade", "Patriotismo", "Serviço"],
    history: "Nossa Assembleia acolhe jovens mulheres buscando o aperfeiçoamento pessoal e a criação de laços eternos de amizade e cooperação.",
    image: "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=1200&auto=format&fit=crop"
  }
};

export default function InstitutionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const institution = institutions[id as keyof typeof institutions];

  if (!institution) return null;

  const Icon = institution.icon;

  return (
    <div className="min-h-screen bg-masonic-dark">
      <Navbar />
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gold-500 hover:text-gold-400 transition-colors uppercase tracking-[0.2em] text-[10px] font-bold mb-8"
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
                <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-500">
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <span className="uppercase tracking-[0.4em] text-gold-500 text-[10px] font-bold">{institution.subTitle}</span>
                  <h1 className="font-serif text-3xl md:text-5xl font-bold text-white uppercase tracking-wider">{institution.name}</h1>
                </div>
              </div>
              <p className="text-gold-100 text-lg leading-relaxed mb-8 font-sans">
                {institution.description}
              </p>
              
              <div className="flex flex-wrap gap-3">
                {institution.values.map((v, i) => (
                  <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase font-black tracking-widest text-gold-400">
                    {v}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-gold-500/20 shadow-2xl"
            >
              <img src={institution.image} alt={institution.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-masonic-dark via-transparent to-transparent opacity-60" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
             <div className="p-10 rounded-[2rem] bg-white/5 border border-white/10 hover:border-gold-500/30 transition-all group">
                <Users className="w-10 h-10 text-gold-500 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-serif font-bold text-white mb-4 uppercase tracking-wider">Missão</h3>
                <p className="text-gold-50/70 text-sm leading-relaxed">{institution.mission}</p>
             </div>
             <div className="p-10 rounded-[2rem] bg-white/5 border border-white/10 hover:border-gold-500/30 transition-all group">
                <Landmark className="w-10 h-10 text-gold-500 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-serif font-bold text-white mb-4 uppercase tracking-wider">Visão</h3>
                <p className="text-gold-50/70 text-sm leading-relaxed">{institution.vision}</p>
             </div>
             <div className="p-10 rounded-[2rem] bg-white/5 border border-white/10 hover:border-gold-500/30 transition-all group">
                <ScrollText className="w-10 h-10 text-gold-500 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-serif font-bold text-white mb-4 uppercase tracking-wider">Breve História</h3>
                <p className="text-gold-50/70 text-sm leading-relaxed">{institution.history}</p>
             </div>
          </div>

          <div className="text-center p-16 rounded-[3rem] bg-gold-500/5 border border-gold-500/10">
             <h2 className="font-serif text-2xl md:text-3xl text-white mb-8 uppercase tracking-widest leading-relaxed italic opacity-80">
                "{institution.subTitle === 'As Cunhadas' ? 'A mão que balança o berço é a mesma que governa o mundo.' : 'Investir na juventude é garantir o futuro da humanidade.'}"
             </h2>
             <button 
               onClick={() => navigate('/quero-participar')}
               className="px-10 py-4 bg-gold-500 text-masonic-dark font-black uppercase tracking-[0.2em] text-[10px] rounded-full hover:bg-gold-400 transition-all shadow-xl"
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
