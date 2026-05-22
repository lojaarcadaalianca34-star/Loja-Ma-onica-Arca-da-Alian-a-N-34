import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Phone, ChevronRight, Landmark, ShieldCheck, X } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { analyzeCandidate } from '@/src/services/masonicAnalysisService';

interface MasonicQuestProps {
  isOpen: boolean;
  onClose: () => void;
  isStatic?: boolean;
}

const steps = [
  {
    id: 1,
    title: "",
    questions: [
      { id: 'fullName', label: "Nome Completo", type: 'text', icon: User, required: true },
      { id: 'birthDate', label: "Data de Nascimento", type: 'text', required: true },
      { id: 'profession', label: "Profissão", type: 'text', required: true },
      { id: 'education', label: "Escolaridade", type: 'text', required: true },
      { id: 'email', label: "E-mail", type: 'email', icon: Mail, required: true },
      { id: 'phone', label: "Telefone (Whatsapp)", type: 'tel', icon: Phone, required: true },
    ]
  },
  {
    id: 2,
    title: "",
    questions: [
      { id: 'residentialAddress', label: "Endereço Residencial", type: 'text', required: true },
      { id: 'professionalAddress', label: "Endereço Profissional", type: 'text', required: true },
      { id: 'city', label: "Cidade", type: 'text', required: true },
      { id: 'civilStatus', label: "Estado Civil", type: 'select', options: ['Solteiro', 'Casado', 'União Estável', 'Divorciado', 'Viúvo'], required: true },
      { id: 'childrenCount', label: "Filhos (Quantos e idades)", type: 'text', required: true },
      { id: 'faith', label: "Crença / Religião", type: 'text', required: true },
      { id: 'income', label: "Renda Mensal Estimada (Importante para garantir que a Maçonaria não sobrecarregue o sustento da família)", type: 'text', required: true },
    ]
  },
  {
    id: 3,
    title: "",
    questions: [
      { 
        id: 'motivation', 
        label: "O que mais te motivou ou motiva a querer ser maçom?", 
        type: 'textarea', 
        required: true
      }
    ]
  },
  {
    id: 4,
    title: "",
    questions: [
      { 
        id: 'q1', 
        label: "Diante de um colega que agiu de forma desonesta no trabalho:", 
        type: 'select',
        options: [
          'A) Confronto diretamente e de forma reservada, dando a chance de se corrigir.',
          'B) Reporto à liderança imediatamente.',
          'C) Observo em silêncio, evitando conflito.',
          'D) Depende se o prejuízo me atingir.'
        ],
        required: true
      },
      { 
        id: 'q2', 
        label: "Quando você comete um erro que prejudica alguém:", 
        type: 'select',
        options: [
          'A) Assume, pede desculpas e repara o dano imediatamente.',
          'B) Assume, mas espera o momento ideal para falar.',
          'C) Tenta justificar as circunstâncias antes de admitir.',
          'D) Age para corrigir silenciosamente sem admitir o erro.'
        ],
        required: true
      },
      { 
        id: 'q3', 
        label: "Qual frase melhor descreve sua relação com a verdade?", 
        type: 'select',
        options: [
          'A) Digo o que precisa ser dito, mesmo que seja difícil.',
          'B) Escolho as palavras e o momento para não causar danos desnecessários.',
          'C) A diplomacia social é mais importante que a verdade crua.',
          'D) Evito conversas difíceis para manter a harmonia.'
        ],
        required: true
      }
    ]
  },
  {
    id: 5,
    title: "",
    questions: [
      { 
        id: 'q5', 
        label: "Como você gerencia conflitos de agenda entre obrigações e novos compromissos?", 
        type: 'select',
        options: [
          'A) Cumpro rigorosamente o que assumi primeiro.',
          'B) Comunico a ausência com antecedência e compenso depois.',
          'C) Avalio qual compromisso me trará mais benefício no momento.',
          'D) Tenho dificuldade em manter uma agenda fixa.'
        ],
        required: true
      },
      { 
        id: 'q10', 
        label: "Como você se comporta em um novo grupo de trabalho?", 
        type: 'select',
        options: [
          'A) Lidero naturalmente se houver espaço.',
          'B) Prefiro colaborar e fortalecer quem está liderando.',
          'C) Observo e analiso muito antes de dar qualquer opinião.',
          'D) Adapto meu papel conforme a necessidade do grupo.'
        ],
        required: true
      }
    ]
  },
  {
    id: 6,
    title: "",
    questions: [
      { 
        id: 'q4', 
        label: "Como sua família enxerga sua entrada em uma fraternidade discreta?", 
        type: 'select',
        options: [
          'A) Apoiam plenamente e compreendem a importância.',
          'B) Aceitariam após uma explicação detalhada.',
          'C) Teriam reservas iniciais e talvez alguma resistência.',
          'D) Ainda não conversei sobre isso com eles.'
        ],
        required: true
      },
      { 
        id: 'q6', 
        label: "No seu lar, como você descreve seu papel principal?", 
        type: 'select',
        options: [
          'A) Referência e liderança pelo exemplo e provimento.',
          'B) Decisões em parceria equilibrada com a esposa.',
          'C) Busco manter a paz, cedendo na maioria das vezes.',
          'D) Ainda estou estabelecendo meu papel na dinâmica familiar.'
        ],
        required: true
      },
      { 
        id: 'q8', 
        label: "Diante de uma crise financeira ou perda pessoal grande:", 
        type: 'select',
        options: [
          'A) Busco sentido, aprendizado e mantenho a calma.',
          'B) Foco 100% na ação prática para resolver o problema.',
          'C) Preciso de um tempo considerável de isolamento para processar.',
          'D) Apoio-me totalmente em terceiros para conseguir decidir.'
        ],
        required: true
      }
    ]
  },
  {
    id: 7,
    title: "",
    questions: [
      { 
        id: 'q7', 
        label: "O que mais o atraiu na instituição?", 
        type: 'select',
        options: [
          'A) Autoconhecimento e aperfeiçoamento moral.',
          'B) Tradição, história e valores cavaleirescos.',
          'C) Convívio social e rede de relacionamentos de alto nível.',
          'D) Curiosidade sobre os mistérios e rituais.'
        ],
        required: true
      },
      { 
        id: 'q9', 
        label: "Qual princípio é o pilar de uma sociedade justa?", 
        type: 'select',
        options: [
          'A) Fraternidade (O cuidado mútuo).',
          'B) Liberdade (O direito de escolha).',
          'C) Igualdade (Mesmos direitos para todos).',
          'D) Ordem (O cumprimento estrito das leis).'
        ],
        required: true
      },
      { 
        id: 'q11', 
        label: "Sobre a formação do seu lar, como você avalia a importância da figura feminina (esposa) na sua estabilidade?", 
        type: 'select',
        options: [
          'A) É a base essencial de complementaridade para a construção da minha família.',
          'B) É uma parceria importante para a divisão de responsabilidades.',
          'C) Considero que qualquer parceria é válida, independente do gênero.',
          'D) Prefiro não atribuir papéis específicos à figura feminina no meu lar.'
        ],
        required: true
      },
      { 
        id: 'q12', 
        label: "Em qual ambiente social você se sente mais 'em casa' e espelhado em seus valores?", 
        type: 'select',
        options: [
          'A) Entre homens de família, onde o foco é o provimento e o legado dos filhos.',
          'B) Em ambientes profissionais de alta performance e resultados.',
          'C) Em ambientes diversos, com múltiplos estilos de vida e visões de mundo.',
          'D) Em grupos intelectuais ou artísticos, sem distinção de perfil familiar.'
        ],
        required: true
      }
    ]
  }
];

export default function MasonicQuest({ isOpen, onClose, isStatic = false }: MasonicQuestProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen || isStatic) {
      setShowIntro(true);
      setCurrentStep(0);
      setIsFinished(false);
      setFormData({});
      setTouched({});
    }
  }, [isOpen, isStatic]);

  const applyBirthDateMask = (value: string) => {
    const selectNums = value.replace(/\D/g, '').slice(0, 8);
    if (selectNums.length <= 2) {
      return selectNums;
    } else if (selectNums.length <= 4) {
      return `${selectNums.slice(0, 2)}/${selectNums.slice(2)}`;
    } else {
      return `${selectNums.slice(0, 2)}/${selectNums.slice(2, 4)}/${selectNums.slice(4)}`;
    }
  };

  const applyCurrencyMask = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const num = parseInt(digits, 10);
    const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    const formatted = (num / 100).toLocaleString('pt-BR', options);
    return `R$ ${formatted}`;
  };

  const applyPhoneMask = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) {
      return digits.length > 0 ? `(${digits}` : '';
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    } else {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
  };

  const isValidEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const isStepValid = (stepIdx: number) => {
    if (stepIdx >= steps.length) return false;
    const currentQuestions = steps[stepIdx].questions;
    for (const q of currentQuestions) {
      const val = formData[q.id];
      if (q.required && (!val || String(val).trim() === '')) {
         return false;
      }
      if (q.id === 'email' && val && !isValidEmail(String(val))) {
         return false;
      }
      if (q.id === 'phone' && val) {
         const decimals = String(val).replace(/\D/g, '');
         if (decimals.length < 10) return false;
      }
      if (q.id === 'birthDate' && val) {
         const decimals = String(val).replace(/\D/g, '');
         if (decimals.length < 8) return false;
      }
      if (q.id === 'civilStatus' && (formData.civilStatus === 'Casado' || formData.civilStatus === 'União Estável')) {
         if (!formData.wifeName || String(formData.wifeName).trim() === '') return false;
         if (!formData.marriageTime || String(formData.marriageTime).trim() === '') return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Analyze with AI
      let analysis = null;
      try {
        analysis = await analyzeCandidate(formData);
      } catch (aiError) {
        console.error("AI Analysis failed:", aiError);
      }

      // 2. Save to Firestore with analysis
      await addDoc(collection(db, 'leads'), {
        ...formData,
        analysis: analysis || null,
        type: 'masonic_quest',
        createdAt: serverTimestamp()
      });

      // 3. Send Email
      try {
        await fetch('/api/send-lead-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formData, analysis })
        });
      } catch (emailError) {
        console.error('Falha ao enviar e-mail:', emailError);
      }

      setIsFinished(true);
    } catch (error) {
      console.error("Submission failed:", error);
      handleFirestoreError(error, OperationType.CREATE, 'leads');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    if (isStatic) {
      window.location.href = '/';
    }
  };

  const renderContent = () => {
    const isValid = isStepValid(currentStep);
    return (
      <div className={`${isStatic ? 'relative w-full h-auto' : 'relative w-full max-w-2xl h-[85vh] md:h-[580px] max-h-[600px] overflow-hidden rounded-[2rem] border-4 border-[#0b1d3a]/10 bg-white flex flex-col md:flex-row'}`}>
        <button 
          id="close-masonic-quest"
          onClick={handleClose}
          tabIndex={0}
          className="absolute top-4 right-4 z-[200] w-8 h-8 p-1.5 text-[#c5a059] hover:opacity-80 transition-opacity bg-[#0b1d3a]/10 backdrop-blur-sm rounded-full cursor-pointer flex items-center justify-center border border-[#c5a059]/20 shadow-lg"
          aria-label="Fechar"
        >
          <X className="w-5 h-5 font-bold" />
        </button>
        <div className={`${isStatic ? 'hidden' : 'md:w-1/3 bg-[#0b1d3a] border-r border-[#c5a059]/20 p-8 relative overflow-hidden flex flex-col'}`}>
          <div 
            className="absolute inset-0 bg-[#c5a059]/10"
          />
          <div className="relative z-10">
            <Landmark className="w-12 h-12 text-[#c5a059] mb-6" />
            <h2 className="font-serif text-3xl font-bold text-white mb-2 uppercase tracking-widest">A Jornada</h2>
            <div className="h-1 w-12 bg-[#c5a059] mb-8" />
            
            {!showIntro && !isFinished && (
              <div className="space-y-6">
                {steps.map((step, i) => (
                  <div key={step.id} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-500 ${i <= currentStep ? 'border-[#c5a059] bg-[#c5a059] text-[#0b1d3a]' : 'border-white/10 text-white/30'}`}>
                      {i + 1}
                    </div>
                    <span className={`uppercase tracking-widest text-[10px] font-bold ${i <= currentStep ? 'text-[#c5a059]' : 'text-white/20'}`}>
                      Passo {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-auto relative z-10 pt-12">
            <ShieldCheck className="w-8 h-8 text-[#c5a059]/20 mb-2" />
            <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] leading-relaxed">
              "Buscai e achareis; batei e abrir-se-vos-á."
            </p>
          </div>
        </div>

        <div className={`flex-1 p-8 md:p-12 relative overflow-y-auto custom-scrollbar flex flex-col min-h-0 ${isStatic ? 'rounded-[2rem]' : ''}`}>
          {/* Background Image for Form */}
          {!isFinished && !showIntro && (
            <div className="absolute inset-0 z-0 bg-[#0b1d3a]/5 pointer-events-none transition-opacity duration-1000">
            <div className="absolute inset-0 bg-masonic-dark/90 bg-gradient-to-t from-masonic-dark via-transparent to-masonic-dark" />
          </div>
          )}

          <AnimatePresence mode="wait">
            {showIntro ? (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative z-10 flex-1 flex flex-col items-center justify-center space-y-6 py-2 px-2"
              >
                <div className="max-w-2xl bg-[#0b1d3a]/5 border border-[#0b1d3a]/10 p-6 md:p-10 rounded-3xl backdrop-blur-sm">
                  <p className="text-base md:text-lg text-[#0b1d3a] font-serif leading-relaxed italic text-justify">
                    O preenchimento deste formulário manifesta apenas o seu interesse em conhecer a nossa Ordem. Ele não gera direito a ingresso, nem obriga a A.R.L.S. Arca da Aliança nº 34 a realizar qualquer contato. Seus dados serão tratados com absoluto sigilo e servirão apenas para uma análise preliminar de perfil. Caso haja compatibilidade, você poderá ser convidado para uma sindicância formal.
                  </p>
                </div>
                <button 
                  onClick={() => setShowIntro(false)}
                  tabIndex={0}
                  className="group relative px-10 py-5 bg-[#0b1d3a] border border-[#c5a059]/30 text-[#f4efe2] font-black uppercase tracking-[0.15em] text-xs md:text-sm rounded-full hover:bg-[#c5a059] transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                >
                  Ciente, estou pronto para bater à porta do Templo
                </button>
              </motion.div>
            ) : isFinished ? (
              <motion.div 
                key="finished"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center py-4 relative z-10"
              >
                {/* Arca da Aliança Brilhante */}
                <motion.div
                  initial={{ scale: 0, rotateY: 90, opacity: 0 }}
                  animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                  transition={{ 
                    duration: 2, 
                    type: "spring", 
                    bounce: 0.3,
                    delay: 0.5 
                  }}
                  className="relative mb-12 p-8"
                >
                  <div className="absolute inset-0 bg-[#c5a059]/10 blur-[120px] rounded-full animate-pulse" />
                  <div className="absolute inset-0 bg-[#c5a059]/5 blur-[60px] rounded-full group-hover:blur-[80px] transition-all" />
                  <div className="w-56 md:w-80 h-40 relative z-10 flex items-center justify-center">
                    <Landmark className="w-32 h-32 text-[#c5a059] drop-shadow-[0_0_50px_rgba(197,160,89,0.5)]" />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-8 bg-[#c5a059]/5 blur-xl rounded-full" />
                </motion.div>

                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="font-serif text-2xl md:text-3xl font-bold text-[#c5a059] mb-4 tracking-tighter shrink-0"
                >
                  A Semente foi Lançada.
                </motion.h2>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                  className="max-w-2xl bg-[#0b1d3a]/5 border border-[#0b1d3a]/10 p-6 md:p-10 rounded-3xl mb-8 backdrop-blur-md"
                >
                  <p className="text-[#0b1d3a]/80 font-serif text-base md:text-lg italic leading-relaxed text-justify">
                    Agradecemos o seu interesse pela A.R.L.S. Arca da Aliança nº 34. Suas respostas e dados foram criptografados e enviados ao nosso Conselho de Mestres. O silêncio que se segue faz parte da nossa tradição de observação e prudência. Se o seu perfil for considerado compatível com nossas colunas, um de nossos membros entrará em contato para os próximos passos.
                  </p>
                </motion.div>

                {!isStatic && (
                  <motion.button 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    onClick={() => onClose()}
                    tabIndex={0}
                    className="px-10 py-5 bg-[#0b1d3a] text-[#f4efe2] border border-[#c5a059]/30 font-black uppercase tracking-[0.3em] text-xs md:text-sm hover:bg-[#c5a059] transition-all rounded-full hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                  >
                    OK
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative z-10 space-y-6"
              >
                <div className="space-y-2 border-b border-[#0b1d3a]/10 pb-4">
                  <span className="text-[#c5a059] text-[10px] uppercase font-black tracking-[0.4em]" style={{ color: '#c5a059' }}>Passo {currentStep + 1} de {steps.length}</span>
                </div>
                <div className="space-y-6">
                  {steps[currentStep].questions.map((q: any) => {
                    const hasEmailError = q.id === 'email' && formData.email && !isValidEmail(formData.email) && touched.email;
                    const hasPhoneError = q.id === 'phone' && formData.phone && formData.phone.replace(/\D/g, '').length < 10 && touched.phone;
                    const hasBirthDateError = q.id === 'birthDate' && formData.birthDate && formData.birthDate.replace(/\D/g, '').length < 8 && touched.birthDate;
                    const hasGeneralError = touched[q.id] && q.required && (!formData[q.id] || String(formData[q.id]).trim() === '');

                    return (
                      <div key={q.id} className="space-y-3">
                        <label className="text-[#c5a059] text-sm md:text-base font-bold block leading-relaxed" style={{ color: '#c5a059' }}>
                          {q.label} {q.required && <span className="text-red-400">*</span>}
                        </label>
                        <div className="relative group">
                          {q.icon && <q.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#c5a059]/50" />}
                          {q.type === 'textarea' ? (
                            <div className="w-full">
                              <textarea 
                                required={q.required}
                                rows={3}
                                tabIndex={0}
                                className={`w-full bg-white/10 border-b ${
                                  hasGeneralError ? 'border-red-500/80' : 'border-[#c5a059]/30 focus:border-[#c5a059]'
                                } p-3 text-[#c5a059] focus:outline-none transition-all font-sans text-sm md:text-base placeholder:text-[#c5a059]/40 resize-none shadow-sm rounded-lg`}
                                style={{ color: '#c5a059' }}
                                onChange={e => setFormData({...formData, [q.id]: e.target.value})}
                                onBlur={() => setTouched(prev => ({...prev, [q.id]: true}))}
                                value={formData[q.id] || ''}
                              />
                              {hasGeneralError && (
                                <span className="text-red-400 text-xs mt-1 block">Este campo é obrigatório.</span>
                              )}
                            </div>
                          ) : q.type === 'select' ? (
                            <div className="space-y-4 w-full">
                              <select 
                                required={q.required}
                                tabIndex={0}
                                className={`w-full bg-white/10 border-b ${
                                  hasGeneralError ? 'border-red-500/80' : 'border-[#c5a059]/30 focus:border-[#c5a059]'
                                } p-3 text-[#c5a059] focus:outline-none transition-all font-sans text-sm md:text-base appearance-none cursor-pointer rounded-lg shadow-sm`}
                                style={{ color: '#c5a059' }}
                                onChange={e => setFormData({...formData, [q.id]: e.target.value})}
                                onBlur={() => setTouched(prev => ({...prev, [q.id]: true}))}
                                value={formData[q.id] || ''}
                              >
                                <option value="" className="bg-[#050c1a] text-[#c5a059]" style={{ color: '#c5a059' }}>Selecione...</option>
                                {q.options.map((opt: string) => (
                                  <option key={opt} value={opt} className="bg-[#050c1a] text-[#c5a059] py-2" style={{ color: '#c5a059' }}>{opt}</option>
                                ))}
                              </select>
                              {hasGeneralError && (
                                <span className="text-red-400 text-xs mt-1 block">Por favor, selecione uma opção.</span>
                              )}
                              
                              {/* Conditional Fields for Civil Status */}
                              {q.id === 'civilStatus' && (formData.civilStatus === 'Casado' || formData.civilStatus === 'União Estável') && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#c5a059]/20"
                                >
                                  <div className="space-y-3">
                                    <label className="text-[#c5a059] text-sm font-bold block" style={{ color: '#c5a059' }}>Nome da Esposa *</label>
                                    <input 
                                      type="text"
                                      required
                                      tabIndex={0}
                                      placeholder="Nome completo da esposa"
                                      className={`w-full bg-white/10 border-b ${
                                        touched.wifeName && (!formData.wifeName || String(formData.wifeName).trim() === '')
                                          ? 'border-red-500/80'
                                          : 'border-[#c5a059]/30 focus:border-[#c5a059]'
                                      } p-3 text-[#c5a059] focus:outline-none transition-all font-sans text-sm rounded-lg shadow-sm placeholder:text-[#c5a059]/40`}
                                      style={{ color: '#c5a059' }}
                                      value={formData.wifeName || ''}
                                      onChange={e => setFormData({...formData, wifeName: e.target.value})}
                                      onBlur={() => setTouched(prev => ({...prev, wifeName: true}))}
                                    />
                                    {touched.wifeName && (!formData.wifeName || String(formData.wifeName).trim() === '') && (
                                      <span className="text-red-400 text-xs mt-1 block">O nome da esposa é obrigatório para o estado civil selecionado.</span>
                                    )}
                                  </div>
                                  <div className="space-y-3">
                                    <label className="text-[#c5a059] text-sm font-bold block" style={{ color: '#c5a059' }}>Tempo de Casado em anos *</label>
                                    <input 
                                      type="text"
                                      required
                                      tabIndex={0}
                                      placeholder="Ex: 10 anos"
                                      className={`w-full bg-white/10 border-b ${
                                        touched.marriageTime && (!formData.marriageTime || String(formData.marriageTime).trim() === '')
                                          ? 'border-red-500/80'
                                          : 'border-[#c5a059]/30 focus:border-[#c5a059]'
                                      } p-3 text-[#c5a059] focus:outline-none transition-all font-sans text-sm rounded-lg shadow-sm placeholder:text-[#c5a059]/40`}
                                      style={{ color: '#c5a059' }}
                                      value={formData.marriageTime || ''}
                                      onChange={e => setFormData({...formData, marriageTime: e.target.value})}
                                      onBlur={() => setTouched(prev => ({...prev, marriageTime: true}))}
                                    />
                                    {touched.marriageTime && (!formData.marriageTime || String(formData.marriageTime).trim() === '') && (
                                      <span className="text-red-400 text-xs mt-1 block">O tempo de casado é obrigatório para o estado civil selecionado.</span>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          ) : q.type === 'file' ? (
                            <div className="relative">
                              <input 
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="file-upload"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => setFormData({...formData, [q.id]: reader.result});
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                              />
                              <label 
                                htmlFor="file-upload"
                                className="flex flex-col items-center justify-center border-2 border-dashed border-[#c5a059]/30 rounded-2xl p-8 hover:border-[#c5a059]/50 hover:bg-[#c5a059]/5 transition-all cursor-pointer"
                              >
                                {formData[q.id] ? (
                                  <img src={formData[q.id]} className="w-32 h-32 object-cover rounded-xl border-2 border-[#c5a059] shadow-2xl" alt="Preview" />
                                ) : (
                                  <>
                                    <Landmark className="w-8 h-8 text-[#c5a059] mb-2" />
                                    <span className="text-[#c5a059] text-sm font-bold uppercase tracking-widest text-center" style={{ color: '#c5a059' }}>{q.label}</span>
                                  </>
                                )}
                              </label>
                            </div>
                          ) : q.id === 'birthDate' ? (
                            <div className="w-full">
                              <input 
                                type="text"
                                required={q.required}
                                tabIndex={0}
                                placeholder="DD/MM/AAAA"
                                className={`w-full bg-white/10 border-b ${
                                  hasBirthDateError || hasGeneralError ? 'border-red-500' : 'border-[#c5a059]/30 focus:border-[#c5a059]'
                                } p-3 text-[#c5a059] focus:outline-none transition-all font-sans text-sm md:text-base rounded-lg shadow-sm placeholder:text-[#c5a059]/40`}
                                style={{ color: '#c5a059' }}
                                onChange={e => {
                                  const masked = applyBirthDateMask(e.target.value);
                                  setFormData({...formData, birthDate: masked});
                                }}
                                onBlur={() => setTouched(prev => ({...prev, birthDate: true}))}
                                value={formData.birthDate || ''}
                              />
                              {hasBirthDateError && (
                                <span className="text-red-400 text-xs mt-1 block">Data de nascimento incompleta ou inválida. Digite o dia, mês e o ano continuamente (DDMMAAAA).</span>
                              )}
                              {!hasBirthDateError && hasGeneralError && (
                                <span className="text-red-400 text-xs mt-1 block">Este campo é obrigatório.</span>
                              )}
                            </div>
                          ) : q.id === 'phone' ? (
                            <div className="w-full">
                              <input 
                                type="text"
                                required={q.required}
                                tabIndex={0}
                                placeholder="(XX) XXXXX-XXXX"
                                className={`w-full bg-white/10 border-b ${
                                  hasPhoneError || hasGeneralError ? 'border-red-500' : 'border-[#c5a059]/30 focus:border-[#c5a059]'
                                } p-3 pl-11 text-[#c5a059] focus:outline-none transition-all font-sans text-sm md:text-base rounded-lg shadow-sm placeholder:text-[#c5a059]/40`}
                                style={{ color: '#c5a059' }}
                                onChange={e => {
                                  const masked = applyPhoneMask(e.target.value);
                                  setFormData({...formData, phone: masked});
                                }}
                                onBlur={() => setTouched(prev => ({...prev, phone: true}))}
                                value={formData.phone || ''}
                              />
                              {hasPhoneError && (
                                <span className="text-red-400 text-xs mt-1 block">Telefone incompleto. Digite o celular com DDD (Ex: (61) 98253-9333).</span>
                              )}
                              {!hasPhoneError && hasGeneralError && (
                                <span className="text-red-400 text-xs mt-1 block">Este campo é obrigatório.</span>
                              )}
                            </div>
                          ) : q.id === 'income' ? (
                            <div className="w-full">
                              <input 
                                type="text"
                                required={q.required}
                                tabIndex={0}
                                placeholder="R$ 0,00"
                                className={`w-full bg-white/10 border-b ${
                                  hasGeneralError ? 'border-red-500/80' : 'border-[#c5a059]/30 focus:border-[#c5a059]'
                                } p-3 text-[#c5a059] focus:outline-none transition-all font-sans text-sm md:text-base rounded-lg shadow-sm placeholder:text-[#c5a059]/40`}
                                style={{ color: '#c5a059' }}
                                onChange={e => {
                                  const masked = applyCurrencyMask(e.target.value);
                                  setFormData({...formData, income: masked});
                                }}
                                onBlur={() => setTouched(prev => ({...prev, income: true}))}
                                value={formData.income || ''}
                              />
                              {hasGeneralError && (
                                <span className="text-red-400 text-xs mt-1 block">Este campo é obrigatório.</span>
                              )}
                            </div>
                          ) : q.id === 'email' ? (
                            <div className="w-full">
                              <input 
                                type="email"
                                required={q.required}
                                tabIndex={0}
                                className={`w-full bg-white/10 border-b ${
                                  hasEmailError || hasGeneralError ? 'border-red-500/80' : 'border-[#c5a059]/30 focus:border-[#c5a059]'
                                } p-3 pl-11 text-[#c5a059] focus:outline-none transition-all font-sans text-sm md:text-base rounded-lg shadow-sm placeholder:text-[#c5a059]/40`}
                                style={{ color: '#c5a059' }}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                onBlur={() => setTouched(prev => ({...prev, email: true}))}
                                value={formData.email || ''}
                              />
                              {hasEmailError && (
                                <span className="text-red-400 text-xs mt-1 block">Insira um endereço de e-mail válido com "@" e um domínio completo (ex: nome@exemplo.com).</span>
                              )}
                              {!hasEmailError && hasGeneralError && (
                                <span className="text-red-400 text-xs mt-1 block">Este campo é obrigatório.</span>
                              )}
                            </div>
                          ) : (
                            <div className="w-full">
                              <input 
                                type={q.type}
                                required={q.required}
                                tabIndex={0}
                                className={`w-full bg-white/10 border-b ${
                                  hasGeneralError ? 'border-red-500/80' : 'border-[#c5a059]/30 focus:border-[#c5a059]'
                                } p-3 ${q.icon ? 'pl-11' : ''} text-[#c5a059] focus:outline-none transition-all font-sans text-sm md:text-base rounded-lg shadow-sm placeholder:text-[#c5a059]/40 [color-scheme:dark]`}
                                style={{ color: '#c5a059' }}
                                onChange={e => setFormData({...formData, [q.id]: e.target.value})}
                                onBlur={() => setTouched(prev => ({...prev, [q.id]: true}))}
                                value={formData[q.id] || ''}
                              />
                              {hasGeneralError && (
                                <span className="text-red-400 text-xs mt-1 block">Este campo é obrigatório.</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-8 flex justify-between items-center">
                  <button 
                    onClick={() => currentStep === 0 ? setShowIntro(true) : setCurrentStep(prev => prev - 1)}
                    tabIndex={0}
                    className="text-[#c5a059]/50 hover:text-[#c5a059] uppercase tracking-[0.3em] text-[10px] font-black transition-colors cursor-pointer"
                  >
                    Retornar
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={!isValid || loading}
                    tabIndex={0}
                    className={`group flex items-center gap-6 px-10 py-5 font-black uppercase tracking-[0.2em] text-xs rounded-full transition-all duration-300 ${
                      isValid && !loading
                        ? 'bg-[#0b1d3a] border border-[#c5a059]/30 text-[#f4efe2] hover:bg-[#c5a059] hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(197,160,89,0.2)]'
                        : 'bg-[#0b1d3a]/30 border border-white/5 text-[#f4efe2]/20 cursor-not-allowed'
                    }`}
                  >
                    {loading ? 'Transmitindo...' : currentStep === steps.length - 1 ? 'Irei aguardar com sabedoria' : 'Próximo Passo'}
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  if (isStatic) return renderContent();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-masonic-dark/95 backdrop-blur-xl"
            onClick={onClose}
          />
          
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="relative w-full max-w-2xl h-[85vh] md:h-[580px] max-h-[600px] overflow-hidden rounded-[2rem] border-4 border-[#0b1d3a]/10 bg-white"
            >
            {renderContent()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
