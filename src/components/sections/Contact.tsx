import React, { useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Mail, Phone, MapPin, Clock, Instagram, Facebook, Send } from 'lucide-react';
import { motion } from 'motion/react';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section id="contato" className="py-20 bg-masonic-dark relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="font-serif text-2xl font-bold text-white mb-10">
            Onde nos <span className="gold-text">Encontrar</span>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Informações à Esquerda */}
            <div className="space-y-6">
              {/* Endereço */}
              <div className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-gold-500/50 transition-all duration-500">
                  <MapPin className="text-gold-500 w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-gold-500 font-black uppercase tracking-[0.2em] text-[8px] mb-1">Endereço</h4>
                  <p className="text-white text-base font-bold">Guará, Brasília - DF</p>
                  <p className="text-gold-100/40 text-[9px] italic font-serif">Oriente de Brasília</p>
                </div>
              </div>

              {/* Reuniões */}
              <div className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-gold-500/50 transition-all duration-500">
                  <Clock className="text-gold-500 w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-gold-500 font-black uppercase tracking-[0.2em] text-[8px] mb-1">Reuniões</h4>
                  <p className="text-white text-base font-bold">Terças-feiras às 20h00</p>
                  <p className="text-gold-100/40 text-[9px] italic font-serif">Restrita apenas para membros regulares</p>
                </div>
              </div>

              {/* Contato */}
              <div className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-gold-500/50 transition-all duration-500">
                  <Mail className="text-gold-500 w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-gold-500 font-black uppercase tracking-[0.2em] text-[8px] mb-1">Contato</h4>
                  <p className="text-white text-sm font-bold break-all">lojaarcadaalianca34@gmail.com</p>
                  <p className="text-gold-100/40 text-[9px] italic font-serif">Secretaria da Loja</p>
                </div>
              </div>
            </div>

            {/* Mapa Menor e Quadrado à Direita - Centralizado melhor */}
            <div className="flex justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[220px] aspect-square rounded-[1.5rem] overflow-hidden border border-gold-500/20 shadow-2xl relative"
              >
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d678.4843943654762!2d-47.96468114777279!3d-15.852006807419746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935a2f1a883953b9%3A0x5348e0050b629ac8!2sAugusta%20e%20Respeit%C3%A1vel%20Loja%20Simb%C3%B3lica%20Arca%20da%20Alian%C3%A7a%20N%2034!5e0!3m2!1sen!2sbr!4v1778678011777!5m2!1sen!2sbr" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
