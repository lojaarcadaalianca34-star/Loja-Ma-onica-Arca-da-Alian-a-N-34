import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

interface SiteContent {
  hero: {
    title: string;
    subTitle: string;
    tagline: string;
  };
  history: {
    text: string;
    mission: string;
    vision: string;
    values: string[];
    milestones: {
      year: string;
      title: string;
      description: string;
    }[];
  };
  philanthropy: {
    description: string;
    stats: { label: string; value: string }[];
    initiatives: { title: string; impact: string; description: string }[];
  };
  management: { name: string; role: string; photo?: string }[];
  events: {
    title: string;
    date: string;
    time: string;
    location: string;
    type: string;
    description: string;
  }[];
  librarySections?: string[];
  gallery: {
    url: string;
    title: string;
    category: string;
  }[];
  masters: {
    id: string;
    name: string;
    period: string;
    role: string;
    degree?: string;
    orderTime?: string;
    ritualLegacy?: string;
    agendaHighlights?: string;
    columnGrowth?: string;
    biography: string;
    photo?: string;
    firstLady?: {
      name: string;
      photo?: string;
      biography: string;
    };
  }[];
  familyGroups?: {
    guardians: {
      title: string;
      description: string;
      photo?: string;
    };
    demolay: {
      title: string;
      description: string;
      photo?: string;
    };
    daughters: {
      title: string;
      description: string;
      photo?: string;
    };
  };
}

const defaultContent: SiteContent = {
  hero: {
    title: "A.R.L.S. Arca da Aliança nº 34",
    subTitle: "Augusta e Respeitável Loja Simbólica - GLMDF",
    tagline: "A Arca da Aliança: Um refúgio de Luz, Verdade e Fraternidade"
  },
  history: {
    text: "Fundada em 2009, a Arca da Aliança nº 34 nasceu com o propósito de ser um repositório de virtudes e um farol de luz no Oriente de Vicente Pires - Brasília. Ao longo das décadas, nossas colunas se fortaleceram com homens que dedicaram suas vidas à busca da verdade.",
    mission: "Tornar feliz a humanidade pelo aperfeiçoamento dos costumes, pela tolerância, pela filantropia e pela busca incessante da verdade.",
    vision: "Ser uma oficina de referência na maçonaria do Distrito Federal, reconhecida pela excelência ritualística e pelo impacto transformador em nossa comunidade.",
    values: ["Fraternidade", "Busca da Verdade", "Filantropia", "Tolerância", "Liberdade de Pensamento"],
    milestones: [
      {
        year: '2009',
        title: 'Fundação',
        description: 'A Arca da Aliança nº 34 nasceu com o propósito de ser um repositório de virtudes e um farol de luz no Oriente de Vicente Pires - DF.'
      },
      {
        year: '20XX',
        title: 'Primeira Sede',
        description: 'Estabelecimento das primeiras colunas físicas, um solo sagrado para o trabalho maçônico.'
      },
      {
        year: '20XX',
        title: 'Crescimento',
        description: 'Celebração da evolução e influência positiva na comunidade do Distrito Federal.'
      },
      {
        year: 'HOJE',
        title: 'Futuro Presente',
        description: 'Nossas colunas se fortalecem com homens que dedicam suas vidas à busca incessante da verdade.'
      }
    ]
  },
  philanthropy: {
    description: "A verdadeira maçonaria se manifesta através do serviço ao próximo. Nossa Loja mantém compromisso constante com o desenvolvimento social do Distrito Federal.",
    stats: [
      { label: "Anos de Ação", value: "17+" },
      { label: "Vidas Impactadas", value: "5k+" },
      { label: "Irmãos Ativos", value: "45" },
      { label: "Instituições", value: "10+" }
    ],
    initiatives: [
      {
        title: "Apoio a Orfanatos",
        impact: "50+ Crianças",
        description: "Doações mensais de alimentos e material escolar."
      },
      {
        title: "Sopa Fraterna",
        impact: "200+ Refeições",
        description: "Distribuição de alimento no Guará."
      },
      {
        title: "Bolsas de Estudo",
        impact: "12 Jovens",
        description: "Fomento à educação de filhos de trabalhadores da região."
      }
    ]
  },
  management: [
    { name: "Irmão Fulano de Tal", role: "Venerável Mestre" },
    { name: "Irmão Ciclano de Tal", role: "1º Vigilante" },
    { name: "Irmão Beltrano de Tal", role: "2º Vigilante" },
    { name: "Irmão de Tal", role: "Secretário" },
    { name: "Irmão Outro Tal", role: "Orador" }
  ],
  events: [
    {
      title: "Sessão Magna de Iniciação",
      date: "15 de Junho, 2024",
      time: "20:00",
      location: "Templo Nobre",
      type: "Magna",
      description: "Recebimento de novos profanos em nossas colunas para o desbaste da pedra bruta."
    },
    {
      title: "Bazar Beneficente das Cunhadas",
      date: "01 de Julho, 2024",
      time: "09:00",
      location: "Salão Social",
      type: "Social",
      description: "Evento organizado pelas Guardiãs da Aliança em prol das instituições carentes da região."
    }
  ],
  librarySections: ["Gestão e Liderança", "Maçonaria", "Trabalhos Maçônicos", "Outros"],
  gallery: [
    {
      url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80",
      title: "Trabalhando na Pedra Bruta",
      category: "Ritualística"
    },
    {
      url: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80",
      title: "Encontro Fraternal",
      category: "Social"
    }
  ],
  masters: [
    {
      id: "1",
      name: "Irmão Nome Sobrenome 1",
      period: "2023 - 2025",
      role: "Venerável Mestre Atual",
      degree: "33º",
      orderTime: "25+",
      ritualLegacy: "O trabalho contínuo no desbaste da pedra bruta é a nossa maior missão. Durante esta gestão, buscamos polir não apenas o templo físico, mas o templo em cada um de nossos corações.",
      agendaHighlights: "Mais de 48 sessões rituais conduzidas com excelência e rigor litúrgico.",
      columnGrowth: "Integração de novos obreiros e fortalecimento da egrégora do oriente.",
      biography: "A gestão atual foca no fortalecimento dos laços fraternais e na expansão das ações sociais no Guará.",
      firstLady: {
        name: "Cunhada Exemplo 1",
        biography: "Dedicada ao apoio das famílias da loja e liderança das ações de caridade feminina."
      }
    },
    {
      id: "2",
      name: "Irmão Nome Sobrenome 2",
      period: "2021 - 2023",
      role: "Past Venerável Mestre",
      biography: "Período marcado pela resiliência e adaptação, mantendo as colunas fortalecidas durante grandes desafios.",
      firstLady: {
        name: "Cunhada Exemplo 2",
        biography: "Liderança exemplar no trabalho com as Cunhadas."
      }
    },
    {
      id: "3",
      name: "Irmão Nome Sobrenome 3",
      period: "2019 - 2021",
      role: "Past Venerável Mestre",
      biography: "Uma gestão dedicada à instrução maçônica profunda e à reforma ritualística primorosa.",
      firstLady: {
        name: "Cunhada Exemplo 3",
        biography: "Apoio constante nas atividades filantrópicas da loja."
      }
    },
    {
      id: "4",
      name: "Irmão Nome Sobrenome 4",
      period: "2017 - 2019",
      role: "Past Venerável Mestre",
      biography: "Foco na modernização administrativa da loja e integração com a comunidade local.",
      firstLady: {
        name: "Cunhada Exemplo 4",
        biography: "Fomentou o crescimento do grupo de apoio familiar."
      }
    },
    {
      id: "5",
      name: "Irmão Nome Sobrenome 5",
      period: "2015 - 2017",
      role: "Past Venerável Mestre",
      biography: "Destaque para o crescimento do quadro de obreiros e fortalecimento da biblioteca da Arca.",
      firstLady: {
        name: "Cunhada Exemplo 5",
        biography: "Idealizadora de projetos literários na comunidade."
      }
    },
    {
      id: "6",
      name: "Irmão Nome Sobrenome 6",
      period: "2013 - 2015",
      role: "Past Venerável Mestre",
      biography: "Consolidação das tradições da loja e estabelecimento de parcerias sociais duradouras.",
      firstLady: {
        name: "Cunhada Exemplo 6",
        biography: "Pioneira nas ações de integração social da loja."
      }
    }
  ],
  familyGroups: {
    guardians: {
      title: "Guardiãs da Aliança",
      description: "Grupo de apoio formado pelas Cunhadas da Arca da Aliança nº 34, dedicado ao fortalecimento familiar e caridade social.",
      photo: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&q=80"
    },
    demolay: {
      title: "Ordem DeMolay",
      description: "Fraternidade juvenil para jovens do sexo masculino de 12 a 21 anos, focada na liderança e valores morais.",
      photo: "https://images.unsplash.com/photo-1523240715181-014b9f514d0d?auto=format&fit=crop&q=80"
    },
    daughters: {
      title: "Filhas de Jó",
      description: "Organização paramaçônica para jovens do sexo feminino, destacando a paciência e a caridade.",
      photo: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80"
    }
  }
};

const ContentContext = createContext<{
  content: SiteContent;
  updateContent: (newContent: SiteContent) => void;
  loading: boolean;
}>({
  content: defaultContent,
  updateContent: () => {},
  loading: true
});

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for real-time updates
    const unsubscribe = onSnapshot(doc(db, 'content', 'main'), (snapshot) => {
      if (snapshot.exists()) {
        setContent(snapshot.data() as SiteContent);
      }
      setLoading(false);
    }, (error) => {
      console.error("Content fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateContent = (newContent: SiteContent) => {
    setContent(newContent);
  };

  return (
    <ContentContext.Provider value={{ content, updateContent, loading }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => useContext(ContentContext);
