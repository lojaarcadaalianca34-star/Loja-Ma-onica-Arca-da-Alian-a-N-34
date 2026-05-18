import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, ChevronLeft, Play, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// Array estático para renderização instantânea
const CURIOSIDADES = [
  {
    id: 'fact-1',
    title: 'A Madeira de Acácia',
    description: 'A Arca da Aliança foi construída em madeira de Shittim, que é a Acácia. Na Maçonaria, a Acácia é o símbolo da imortalidade da alma e da inocência, representando a parte espiritual que nunca morre.',
    category: 'Simbolismo Histórico'
  },
  {
    id: 'fact-2',
    title: 'O Santo dos Santos',
    description: 'No Templo de Salomão, a Arca repousava no Sanctum Sanctorum, onde apenas o Sumo Sacerdote podia entrar. Para o Maçom, isso simboliza a busca pela Verdade e a jornada interna ao centro do próprio ser.',
    category: 'Templo de Salomão'
  },
  {
    id: 'fact-3',
    title: 'Vara de Arão e o Maná',
    description: 'Dentro da Arca, além das Tábuas da Lei, guardavam-se a Vara de Arão e um pote de Maná. Estes elementos simbolizam a autoridade espiritual e o sustento celestial necessário para a jornada evolutiva.',
    category: 'Tradição Antiga'
  },
  {
    id: 'fact-4',
    title: 'O Arco Real',
    description: 'O Grau de Maçom do Arco Real foca intensamente na redescoberta dos mistérios associados à Arca da Aliança e à reconstrução do Templo, reforçando a importância da Arca como depositária do Nome Sagrado.',
    category: 'Graus Maçônicos'
  },
  {
    id: 'fact-5',
    title: 'A Arca como Refúgio',
    description: 'Para os obreiros da Arca 34, o nome da loja representa o compromisso de proteger os princípios da Ordem e acolher os irmãos em um ambiente de absoluta fraternidade e segurança moral.',
    category: 'Nossa Oficina'
  },
  {
    id: 'fact-6',
    title: 'Os Querubins de Ouro',
    description: 'Sobre a Arca, dois querubins voltados um para o outro cobriam o Propiciatório. Maçonicamente, isso pode ser interpretado como a união do pensamento e da ação sob a égide da luz divina.',
    category: 'Simbologia'
  }
];

export default function CuriositiesPage() {
  const navigate = useNavigate();
  const [items] = useState(CURIOSIDADES);

  return (
    <div className="min-h-screen bg-masonic-dark">
      <Navbar />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-masonic-gold hover:text-masonic-gold/80 transition-colors uppercase tracking-[0.2em] text-[10px] font-bold mb-8"
            >
              <ChevronLeft className="w-3 h-3" />
              Voltar ao Início
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-masonic-gold/10 border border-masonic-gold/30 flex items-center justify-center text-masonic-gold mb-6 shadow-[0_0_30px_rgba(197,160,89,0.2)]">
                <Star className="w-8 h-8" />
              </div>
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-4 uppercase tracking-wider">
                Curiosidades <span className="gold-text">da Arca</span>
              </h1>
              <p className="text-gold-100 max-w-2xl mx-auto font-sans text-lg italic leading-relaxed">
                Descubra fatos históricos, simbólicos e institucionais sobre a nossa oficina e a Maçonaria Universal.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-[1px] bg-gradient-to-b from-masonic-gold/30 to-transparent rounded-[2.5rem]"
              >
                <div className="bg-masonic-blue/40 p-10 h-full rounded-[2.5rem] flex flex-col border border-white/5 group-hover:border-masonic-gold/30 transition-all shadow-2xl relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-masonic-gold/5 rounded-full blur-3xl" />
                  
                  <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-masonic-gold/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-masonic-gold" />
                      </div>
                      <span className="text-[10px] uppercase font-black text-masonic-gold tracking-[0.2em]">{item.category || 'Curiosidade'}</span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-white mb-4 group-hover:gold-text transition-colors leading-tight">
                    {item.title}
                  </h3>
                  
                  <p className="text-white/60 text-sm leading-relaxed italic mb-8 flex-1">
                    "{item.description}"
                  </p>
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
