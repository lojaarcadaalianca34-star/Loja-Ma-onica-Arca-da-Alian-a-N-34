import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import MasonicQuest from '../components/forms/MasonicQuest';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';

export default function QuestPage() {
  return (
    <div className="min-h-screen bg-masonic-dark selection:bg-gold-500/30">
      <Navbar />
      <main className="pt-20 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="font-serif text-xl md:text-2xl font-bold text-white mb-2 uppercase tracking-widest">
              Desejo Fazer Parte da <span className="gold-text">Ordem</span>
            </h1>
          </motion.div>

          <div className="flex justify-center">
             <div className="w-full max-w-2xl bg-masonic-blue/20 border border-gold-500/10 rounded-[1.5rem] overflow-hidden shadow-xl p-4 md:p-6">
                <MasonicQuest isOpen={true} onClose={() => {}} isStatic={true} />
             </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
