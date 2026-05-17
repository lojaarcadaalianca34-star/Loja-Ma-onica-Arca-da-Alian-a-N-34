import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface LeadFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadForm({ isOpen, onClose }: LeadFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addDoc(collection(db, 'leads'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setFormData({ name: '', email: '', phone: '', message: '' });
      }, 4000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'leads');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-masonic-dark/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white border border-[#0b1d3a]/10 rounded-3xl p-8 shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-[#0b1d3a]/20 hover:text-[#0b1d3a] transition-colors">
              <X />
            </button>

            {success ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-[#c5a059]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Send className="text-[#c5a059] w-10 h-10" />
                </div>
                <h2 className="font-serif text-3xl font-bold text-[#0b1d3a] mb-4">Solicitação Enviada</h2>
                <p className="text-[#0b1d3a]/60">Recebemos seu interesse. Nossos oficiais entrarão em contato em breve.</p>
              </div>
            ) : (
              <>
                <h2 className="font-serif text-3xl font-bold text-[#0b1d3a] mb-2">Desejo Fazer Parte</h2>
                <p className="text-[#0b1d3a]/60 mb-8 border-b border-[#0b1d3a]/10 pb-4">
                  Inicie sua jornada maçônica na Arca da Aliança nº 34.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b1d3a]/20" />
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nome Completo"
                      className="w-full bg-white/40 border border-[#0b1d3a]/10 rounded-xl p-4 pl-12 text-[#0b1d3a] placeholder:text-[#0b1d3a]/20 focus:outline-none focus:border-[#c5a059] transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b1d3a]/20" />
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="E-mail"
                      className="w-full bg-white/40 border border-[#0b1d3a]/10 rounded-xl p-4 pl-12 text-[#0b1d3a] placeholder:text-[#0b1d3a]/20 focus:outline-none focus:border-[#c5a059] transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b1d3a]/20" />
                    <input 
                      type="tel" 
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="WhatsApp / Telefone"
                      className="w-full bg-white/40 border border-[#0b1d3a]/10 rounded-xl p-4 pl-12 text-[#0b1d3a] placeholder:text-[#0b1d3a]/20 focus:outline-none focus:border-[#c5a059] transition-all"
                    />
                  </div>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-[#0b1d3a]/20" />
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Por que deseja ingressar?"
                      rows={4}
                      className="w-full bg-white/40 border border-[#0b1d3a]/10 rounded-xl p-4 pl-12 text-[#0b1d3a] placeholder:text-[#0b1d3a]/20 focus:outline-none focus:border-[#c5a059] transition-all resize-none font-sans"
                    />
                  </div>

                  <button 
                    disabled={loading}
                    className="w-full bg-[#0b1d3a] text-[#f4efe2] border border-[#c5a059]/30 font-sans font-bold py-4 rounded-xl uppercase tracking-widest hover:bg-[#c5a059] transition-all disabled:opacity-50 shadow-lg"
                  >
                    {loading ? 'Processando...' : 'Enviar Solicitação'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
