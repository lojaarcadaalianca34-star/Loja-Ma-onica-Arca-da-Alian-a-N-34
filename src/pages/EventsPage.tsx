import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { motion } from 'motion/react';
import { Calendar, MapPin, Clock, Info } from 'lucide-react';
import { useContent } from '../context/ContentContext';

export default function EventsPage() {
  const { content } = useContent();
  const events = content.events || [];

  return (
    <div className="min-h-screen bg-masonic-dark">
      <Navbar />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-masonic-gold/10 border border-masonic-gold/30 mb-6">
              <Calendar className="text-masonic-gold w-8 h-8" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 uppercase tracking-[0.2em]">
              Pautas e <span className="gold-text">Eventos</span>
            </h1>
            <p className="text-gold-100 max-w-2xl mx-auto font-sans">
              Acompanhe o calendário de atividades, sessões e eventos sociais de nossa oficina.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-masonic-blue/80 border border-masonic-gold/10 rounded-[2rem] p-8 hover:border-masonic-gold/40 transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="px-4 py-1 rounded-full bg-masonic-gold/10 border border-masonic-gold/30 text-masonic-gold text-[10px] uppercase font-bold tracking-widest">
                    {event.type}
                  </span>
                  <div className="text-masonic-gold">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-serif text-2xl font-bold text-white mb-4 group-hover:gold-text transition-colors">{event.title}</h3>
                <p className="text-white/60 text-sm mb-8 leading-relaxed font-sans">{event.description}</p>
                
                <div className="space-y-3 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3 text-gold-200/70 text-xs">
                    <Clock className="w-4 h-4 text-masonic-gold" />
                    <span>{event.date} às {event.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gold-200/70 text-xs">
                    <MapPin className="w-4 h-4 text-masonic-gold" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <button className="w-full mt-8 py-3 rounded-xl border border-masonic-gold/20 text-masonic-gold text-[10px] uppercase font-bold tracking-widest hover:bg-masonic-gold hover:text-masonic-dark transition-all">
                  Mais Informações
                </button>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-20 p-8 rounded-[2rem] bg-masonic-gold/5 border border-masonic-gold/20 flex flex-col md:flex-row items-center gap-6 justify-between"
          >
            <div className="flex items-center gap-4">
               <Info className="text-masonic-gold w-8 h-8" />
               <p className="text-white font-sans text-sm md:text-base">Sessões restritas a membros da ordem devidamente identificados.</p>
            </div>
            <button className="px-8 py-3 bg-masonic-gold text-masonic-dark rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-masonic-gold/80 transition-all">
               Sincronizar Calendário
            </button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
