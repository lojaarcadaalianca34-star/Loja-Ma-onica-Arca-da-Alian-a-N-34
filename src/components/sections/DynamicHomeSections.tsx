import React from 'react';
import { motion } from 'motion/react';
import { useContent } from '@/src/context/ContentContext';

export default function DynamicHomeSections() {
  const { homeContent } = useContent();
  const sections = homeContent.dynamicSections || [];

  if (sections.length === 0) return null;

  return (
    <div className="bg-aged-beige py-12 border-b border-[#c5a059]/10">
      <div className="max-w-5xl mx-auto px-6 space-y-16">
        {sections.map((section, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <motion.div
              key={section.id || idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center bg-white/40 p-8 rounded-[2.5rem] border border-[#0b1d3a]/5 shadow-sm`}
            >
              {/* Optional Image */}
              {section.image && (
                <div className="w-full md:w-1/3 max-w-[300px] h-48 rounded-2xl overflow-hidden border border-[#0b1d3a]/10 bg-black/5 shadow-inner">
                  <img src={section.image} alt={section.title?.text || 'Seção Dinâmica'} className="w-full h-full object-cover" />
                </div>
              )}
              
              {/* Content text */}
              <div className="flex-1 w-full space-y-4">
                {section.title?.text && (
                  <h3 className={`font-serif text-2xl font-bold text-[#0b1d3a] tracking-wider w-full ${
                    section.title.align === 'center' ? 'text-center' :
                    section.title.align === 'right' ? 'text-right' :
                    section.title.align === 'justify' ? 'text-justify' : 'text-left'
                  }`}>
                    {section.title.text}
                  </h3>
                )}
                {section.description?.text && (
                  <p className={`font-sans text-sm text-[#0b1d3a]/70 leading-relaxed w-full whitespace-pre-wrap ${
                    section.description.align === 'center' ? 'text-center' :
                    section.description.align === 'right' ? 'text-right' :
                    section.description.align === 'justify' ? 'text-justify' : 'text-left'
                  }`}>
                    {section.description.text}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
