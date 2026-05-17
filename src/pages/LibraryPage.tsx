import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Library from '../components/sections/Library';
import { motion } from 'motion/react';
import { BookMarked } from 'lucide-react';

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-aged-beige">
      <Navbar />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/30 mb-6">
              <BookMarked className="text-[#c5a059] w-8 h-8" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#0b1d3a] mb-4 uppercase tracking-[0.2em]">
              Biblioteca <span className="gold-text">Virtual</span>
            </h1>
            <p className="text-[#0b1d3a]/70 max-w-2xl mx-auto font-sans text-lg">
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
