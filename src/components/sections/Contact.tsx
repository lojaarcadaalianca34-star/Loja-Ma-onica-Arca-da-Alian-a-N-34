import React, { useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Mail, Phone, MapPin, Clock, Instagram, Facebook, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { useContent } from '@/src/context/ContentContext';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { content } = useContent();
  const { contact } = content;

  return (
    <section id="contato" className="py-24 bg-aged-beige relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-5 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col mb-12">
            <span className="uppercase tracking-[0.4em] text-[#c5a059] text-[10px] font-black mb-3">{contact?.smallTitle || 'Contato'}</span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#0b1d3a] uppercase tracking-wider leading-none">
              {contact?.title || 'Onde nos Encontrar'}
            </h2>
            {contact?.subTitle && <p className="text-[#0b1d3a]/60 text-base mt-6 max-w-xl leading-relaxed">{contact.subTitle}</p>}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Informações à Esquerda */}
            <div className="space-y-8">
              {/* Endereço */}
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/60 border border-[#c5a059]/30 flex items-center justify-center shrink-0 group-hover:border-[#c5a059] transition-all duration-500 shadow-sm">
                  <MapPin className="text-[#c5a059] w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[#c5a059] font-black uppercase tracking-[0.2em] text-[9px] mb-1">Endereço</h4>
                  <p className="text-[#0b1d3a] text-lg font-bold">{contact?.address || "Guará, Brasília - DF"}</p>
                  <p className="text-[#0b1d3a]/50 text-[10px] italic font-serif tracking-widest uppercase">{contact?.subAddress || "Oriente de Brasília"}</p>
                </div>
              </div>

              {/* Reuniões */}
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/60 border border-[#c5a059]/30 flex items-center justify-center shrink-0 group-hover:border-[#c5a059] transition-all duration-500 shadow-sm">
                  <Clock className="text-[#c5a059] w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[#c5a059] font-black uppercase tracking-[0.2em] text-[9px] mb-1">Reuniões</h4>
                  <p className="text-[#0b1d3a] text-lg font-bold">{contact?.meetings || "Terças-feiras às 20h00"}</p>
                  <p className="text-[#0b1d3a]/50 text-[10px] italic font-serif tracking-widest uppercase">{contact?.subMeetings || "Restrita apenas para membros regulares"}</p>
                </div>
              </div>

              {/* Contato */}
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/60 border border-[#c5a059]/30 flex items-center justify-center shrink-0 group-hover:border-[#c5a059] transition-all duration-500 shadow-sm">
                  <Mail className="text-[#c5a059] w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[#c5a059] font-black uppercase tracking-[0.2em] text-[9px] mb-1">Contato</h4>
                  <p className="text-[#0b1d3a] text-base font-bold break-all">{contact?.email || "lojaarcadaalianca34@gmail.com"}</p>
                  <p className="text-[#0b1d3a]/50 text-[10px] italic font-serif tracking-widest uppercase">{contact?.subEmail || "Secretaria da Loja"}</p>
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
                  src={contact?.mapEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d678.4843943654762!2d-47.96468114777279!3d-15.852006807419746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935a2f1a883953b9%3A0x5348e0050b629ac8!2sAugusta%20e%20Respeit%C3%A1vel%20Loja%20Simb%C3%B3lica%20Arca%20da%20Alian%C3%A7a%20N%2034!5e0!3m2!1sen!2sbr!4v1778678011777!5m2!1sen!2sbr"} 
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
