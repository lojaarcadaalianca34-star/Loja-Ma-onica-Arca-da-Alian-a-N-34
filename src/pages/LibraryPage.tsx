import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Library from '../components/sections/Library';
import { motion } from 'motion/react';
import { BookMarked } from 'lucide-react';

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-masonic-dark">
      <Navbar />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/30 mb-6">
              <BookMarked className="text-gold-500 w-8 h-8" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 uppercase tracking-[0.2em]">
              Biblioteca <span className="gold-text">Vritual</span>
            </h1>
            <p className="text-gold-100 max-w-2xl mx-auto font-sans text-lg">
              Repositório de conhecimento maçônico, estudos rituais e documentos históricos para o aprimoramento dos obreiros.
            </p>
          </motion.div>

          <Library isFullPage={true} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
