import React from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Camera } from 'lucide-react';
import { useContent } from '@/src/context/ContentContext';

export default function Gallery() {
  const { content } = useContent();
  const photos = [...(content.gallery || []), ...(content.gallerySection?.items || [])].filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);

  if (photos.length === 0 && !content.gallerySection?.items) return null;

  return (
    <section id="galeria-fotos" className="py-24 bg-aged-beige relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#c5a059]/30 bg-[#c5a059]/5 mb-4">
            <Camera className="w-3 h-3 text-[#c5a059]" />
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[#c5a059]">{content.gallerySection?.smallTitle || 'Registros Fraternais'}</span>
          </div>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#0b1d3a] mb-6 uppercase tracking-wider">{content.gallerySection?.title || 'Nossa Galeria'}</h2>
          <p className="max-w-xl mx-auto text-[#0b1d3a]/60 font-sans text-base">{content.gallerySection?.subTitle || 'Momentos de união, trabalho e fraternidade que marcam a jornada de nossa oficina.'}</p>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {photos.map((photo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group rounded-xl overflow-hidden border border-[#c5a059]/20 break-inside-avoid shadow-lg"
            >
              <img 
                src={photo.url} 
                alt={photo.title}
                className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1d3a] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                <span className="text-[#c5a059] text-[9px] uppercase font-black tracking-widest mb-1">{photo.category}</span>
                <h3 className="text-white font-serif font-bold text-lg">{photo.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
