import React from 'react';
import { motion } from 'motion/react';
import { 
  Mail, Link as LinkIcon, UserPlus, LogIn, ChevronRight, 
  HelpCircle, ShieldCheck, Smartphone, MousePointer2 
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function InstructionsPage() {
  const steps = [
    {
      title: 'Passo 1: Receba o Convite',
      description: 'Você receberá um e-mail ou uma mensagem do Secretário informando que seu e-mail foi autorizado no sistema. Sem esta autorização prévia, não é possível criar uma conta.',
      icon: <Mail className="w-8 h-8" />,
    },
    {
      title: 'Passo 2: Acesse a Área de Cadastro',
      description: 'Acesse o site pelo link oficial e clique em "ÁREA RESTRITA" e depois em "CRIAR CONTA". Ou use o link direto de cadastro enviado pelo Administrador.',
      icon: <LinkIcon className="w-8 h-8" />,
    },
    {
      title: 'Passo 3: Escolha como se Cadastrar',
      description: 'Você pode usar o botão "ENTRAR COM GOOGLE" (mais simples e rápido) ou digitar manualmente seu e-mail autorizado, nome de Obreiro e criar uma senha de 6 dígitos.',
      icon: <MousePointer2 className="w-8 h-8" />,
    },
    {
      title: 'Passo 4: Finalize e Explore',
      description: 'Após o cadastro, você entrará automaticamente no Oriente. Lá você poderá editar seu perfil, acessar a biblioteca de estudos e anunciar produtos ou serviços.',
      icon: <LogIn className="w-8 h-8" />,
    }
  ];

  return (
    <div className="min-h-screen bg-masonic-dark">
      <Navbar />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="font-serif text-4xl md:text-5xl gold-text uppercase tracking-widest">
              Manual de <span className="text-white">Acesso</span>
            </h1>
            <p className="text-gold-200/60 uppercase tracking-[0.2em] text-xs font-bold">
              Instruções simples para nossos Irmãos e Família
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-sm">
             <div className="space-y-12">
               {steps.map((step, index) => (
                 <motion.div 
                   key={index}
                   initial={{ opacity: 0, x: -20 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   transition={{ delay: index * 0.1 }}
                   className="flex flex-col md:flex-row gap-8 items-start relative"
                 >
                   {index !== steps.length - 1 && (
                     <div className="hidden md:block absolute left-8 top-16 bottom-0 w-px bg-gold-500/20" />
                   )}
                   <div className="w-16 h-16 rounded-2xl bg-gold-500 flex items-center justify-center text-masonic-dark shadow-[0_0_20px_rgba(230,176,0,0.3)] shrink-0">
                     {step.icon}
                   </div>
                   <div className="space-y-4">
                     <h2 className="font-serif text-2xl text-white font-bold">{step.title}</h2>
                     <p className="text-white/60 leading-relaxed text-lg italic">"{step.description}"</p>
                     <div className="h-px w-24 bg-gold-500/30" />
                   </div>
                 </motion.div>
               ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gold-500/10 border border-gold-500/20 p-8 rounded-3xl flex gap-6 items-center">
              <ShieldCheck className="w-12 h-12 text-gold-500 shrink-0" />
              <div>
                <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-1">Segurança</h4>
                <p className="text-white/40 text-[10px]">Seu acesso é criptografado e exclusivo para membros da A.R.L.S. Arca da Aliança nº 34.</p>
              </div>
            </div>
            <div className="bg-gold-500/10 border border-gold-500/20 p-8 rounded-3xl flex gap-6 items-center">
              <HelpCircle className="w-12 h-12 text-gold-500 shrink-0" />
              <div>
                <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-1">Suporte</h4>
                <p className="text-white/40 text-[10px]">Em caso de dúvida, procure o Secretário da Loja ou envie uma mensagem no grupo da Arca.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
