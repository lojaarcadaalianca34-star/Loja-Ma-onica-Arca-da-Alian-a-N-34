import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Phone, ChevronRight, Landmark, ShieldCheck } from 'lucide-react';
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
      { id: 'birthDate', label: "Data de Nascimento", type: 'date', required: true },
      { id: 'profession', label: "Profissão", type: 'text', required: true },
      { id: 'education', label: "Escolaridade", type: 'text', required: true },
      { id: 'income', label: "Renda Mensal Estimada (Importante para garantir que a Maçonaria não sobrecarregue o sustento da família)", type: 'text', required: true },
      { id: 'residentialAddress', label: "Endereço Residencial", type: 'text', required: true },
      { id: 'professionalAddress', label: "Endereço Profissional", type: 'text', required: true },
      { id: 'civilStatus', label: "Estado Civil", type: 'select', options: ['Solteiro', 'Casado', 'União Estável', 'Divorciado', 'Viúvo'], required: true },
      { id: 'childrenCount', label: "Filhos (Quantos e idades)", type: 'text' },
      { id: 'city', label: "Cidade", type: 'text', required: true },
      { id: 'faith', label: "Crença / Religião", type: 'text', required: true },
      { id: 'email', label: "E-mail", type: 'email', icon: Mail, required: true },
      { id: 'phone', label: "Telefone", type: 'tel', icon: Phone, required: true },
    ]
  },
  {
    id: 2,
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
    id: 3,
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
    id: 4,
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
    id: 5,
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
    id: 6,
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

  useEffect(() => {
    if (isOpen || isStatic) {
      setShowIntro(true);
      setCurrentStep(0);
      setIsFinished(false);
      setFormData({});
    }
  }, [isOpen, isStatic]);

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

  const renderContent = () => (
    <div className={`${isStatic ? 'w-full h-auto' : 'relative w-full max-w-3xl h-[85vh] md:h-[650px] overflow-hidden rounded-[2rem] border-4 border-[#0b1d3a]/10 bg-white flex flex-col md:flex-row'}`}>
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
                className="group relative px-10 py-5 bg-[#0b1d3a] border border-[#c5a059]/30 text-[#f4efe2] font-black uppercase tracking-[0.15em] text-xs md:text-sm rounded-full hover:bg-[#c5a059] transition-all hover:scale-105 active:scale-95 shrink-0"
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
                  className="px-10 py-5 bg-[#0b1d3a] text-[#f4efe2] border border-[#c5a059]/30 font-black uppercase tracking-[0.3em] text-xs md:text-sm hover:bg-[#c5a059] transition-all rounded-full hover:scale-105 active:scale-95 shrink-0"
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
              className="space-y-6"
            >
              <div className="space-y-2 border-b border-[#0b1d3a]/10 pb-4">
                <span className="text-[#c5a059] text-[10px] uppercase font-black tracking-[0.4em]">Passo {currentStep + 1} de {steps.length}</span>
              </div>
              <div className="space-y-6">
                {steps[currentStep].questions.map((q: any) => (
                  <div key={q.id} className="space-y-3">
                    <label className="text-[#0b1d3a] text-sm md:text-base font-bold block leading-relaxed">
                      {q.label}
                    </label>
                    <div className="relative group">
                      {q.icon && <q.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0b1d3a]/20" />}
                      {q.type === 'textarea' ? (
                        <textarea 
                          required={q.required}
                          rows={3}
                          className="w-full bg-white/40 border-b border-[#0b1d3a]/10 p-3 text-[#0b1d3a] focus:outline-none focus:border-[#c5a059] transition-all font-sans text-sm md:text-base placeholder:text-[#0b1d3a]/20 resize-none shadow-sm rounded-lg"
                          onChange={e => setFormData({...formData, [q.id]: e.target.value})}
                          value={formData[q.id] || ''}
                        />
                      ) : q.type === 'select' ? (
                        <div className="space-y-4">
                          <select 
                            required={q.required}
                            className="w-full bg-white/40 border-b border-[#0b1d3a]/10 p-3 text-[#0b1d3a] focus:outline-none focus:border-[#c5a059] transition-all font-sans text-sm md:text-base appearance-none cursor-pointer rounded-lg shadow-sm"
                            onChange={e => setFormData({...formData, [q.id]: e.target.value})}
                            value={formData[q.id] || ''}
                          >
                            <option value="" className="bg-white">Selecione...</option>
                            {q.options.map((opt: string) => (
                              <option key={opt} value={opt} className="bg-white py-2">{opt}</option>
                            ))}
                          </select>
                          
                          {/* Conditional Fields for Civil Status */}
                          {q.id === 'civilStatus' && (formData.civilStatus === 'Casado' || formData.civilStatus === 'União Estável') && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#0b1d3a]/10"
                            >
                              <div className="space-y-3">
                                <label className="text-[#0b1d3a] text-sm font-bold block">Nome da Esposa</label>
                                <input 
                                  type="text"
                                  placeholder="Nome completo da esposa"
                                  className="w-full bg-white/40 border-b border-[#0b1d3a]/10 p-3 text-[#0b1d3a] focus:outline-none focus:border-[#c5a059] transition-all font-sans text-sm rounded-lg shadow-sm"
                                  value={formData.wifeName || ''}
                                  onChange={e => setFormData({...formData, wifeName: e.target.value})}
                                />
                              </div>
                              <div className="space-y-3">
                                <label className="text-[#0b1d3a] text-sm font-bold block">Tempo de Casado em anos</label>
                                <input 
                                  type="text"
                                  placeholder="Ex: 10 anos"
                                  className="w-full bg-white/40 border-b border-[#0b1d3a]/10 p-3 text-[#0b1d3a] focus:outline-none focus:border-[#c5a059] transition-all font-sans text-sm rounded-lg shadow-sm"
                                  value={formData.marriageTime || ''}
                                  onChange={e => setFormData({...formData, marriageTime: e.target.value})}
                                />
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
                            className="flex flex-col items-center justify-center border-2 border-dashed border-[#0b1d3a]/10 rounded-2xl p-8 hover:border-[#c5a059]/50 hover:bg-[#c5a059]/5 transition-all cursor-pointer"
                          >
                            {formData[q.id] ? (
                              <img src={formData[q.id]} className="w-32 h-32 object-cover rounded-xl border-2 border-[#c5a059] shadow-2xl" alt="Preview" />
                            ) : (
                              <>
                                <Landmark className="w-8 h-8 text-[#c5a059] mb-2" />
                                <span className="text-[#0b1d3a] text-sm font-bold uppercase tracking-widest text-center">{q.label}</span>
                              </>
                            )}
                          </label>
                        </div>
                      ) : (
                        <input 
                          type={q.type}
                          required={q.required}
                          className={`w-full bg-white/40 border-b border-[#0b1d3a]/10 p-3 ${q.icon ? 'pl-11' : ''} text-[#0b1d3a] focus:outline-none focus:border-[#c5a059] transition-all font-sans text-sm md:text-base rounded-lg shadow-sm`}
                          onChange={e => setFormData({...formData, [q.id]: e.target.value})}
                          value={formData[q.id] || ''}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-8 flex justify-between items-center">
                <button 
                  onClick={() => currentStep === 0 ? setShowIntro(true) : setCurrentStep(prev => prev - 1)}
                  className="text-[#0b1d3a]/40 hover:text-[#0b1d3a] uppercase tracking-[0.3em] text-[10px] font-black transition-colors"
                >
                  Retornar
                </button>
                <button 
                  onClick={handleNext}
                  disabled={loading}
                  className="group flex items-center gap-6 px-10 py-5 bg-[#0b1d3a] border border-[#c5a059]/30 text-[#f4efe2] font-black uppercase tracking-[0.2em] text-xs rounded-full hover:bg-[#c5a059] transition-all hover:scale-105 active:scale-95"
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
              className="relative w-full max-w-3xl h-[85vh] md:h-[650px] overflow-hidden rounded-[2rem] border-4 border-[#0b1d3a]/10 bg-white"
            >
            {renderContent()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
