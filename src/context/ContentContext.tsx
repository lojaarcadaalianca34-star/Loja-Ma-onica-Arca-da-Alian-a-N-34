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
    smallTitle: string;
    title: string;
    subTitle: string;
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
    smallTitle: string;
    title: string;
    subTitle: string;
    description: string;
    stats: { label: string; value: string }[];
    initiatives: { title: string; impact: string; description: string }[];
  };
  managementSection: {
    smallTitle: string;
    title: string;
    subTitle: string;
    members: { name: string; role: string; photo?: string }[];
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
  gallerySection: {
    smallTitle: string;
    title: string;
    subTitle: string;
    items: {
      url: string;
      title: string;
      category: string;
    }[];
  };
  gallery: {
    url: string;
    title: string;
    category: string;
  }[];
  mastersSection: {
    smallTitle: string;
    title: string;
    subTitle: string;
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
  };
  masters: any[];
  familyGroups: {
    smallTitle: string;
    title: string;
    subTitle: string;
    guardians: {
      name: string;
      title?: string; // Fallback
      subTitle: string;
      description: string;
      mission: string;
      vision: string;
      values: string[];
      history: string;
      image: string;
      photo?: string; // Fallback
      logo?: string; // Fallback
    };
    demolay: {
      name: string;
      title?: string; // Fallback
      subTitle: string;
      description: string;
      mission: string;
      vision: string;
      values: string[];
      history: string;
      image: string;
      photo?: string; // Fallback
      logo?: string; // Fallback
    };
    daughters: {
      name: string;
      title?: string; // Fallback
      subTitle: string;
      description: string;
      mission: string;
      vision: string;
      values: string[];
      history: string;
      image: string;
      photo?: string; // Fallback
      logo?: string; // Fallback
    };
  };
  quest: {
    title: string;
    subTitle: string;
  };
  contact: {
    smallTitle: string;
    title: string;
    subTitle: string;
    address: string;
    subAddress: string;
    meetings: string;
    subMeetings: string;
    email: string;
    subEmail: string;
    mapEmbedUrl: string;
  };
  welcomeBanner?: {
    backgroundImage?: string;
    title?: string;
    subTitle?: string;
  };
}

const defaultContent: SiteContent = {
  hero: {
    title: "A.R.L.S. Arca da Aliança nº 34",
    subTitle: "Augusta e Respeitável Loja Simbólica - GLMDF",
    tagline: "A Arca da Aliança: Um refúgio de Luz, Verdade e Fraternidade"
  },
  history: {
    smallTitle: "Nossa Jornada",
    title: "A Arca Através",
    subTitle: "do Tempo",
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
        description: 'Nossas colunas se fortaleceram com homens que dedicaram suas vidas à busca incessante da verdade.'
      }
    ]
  },
  philanthropy: {
    smallTitle: "Ação Social",
    title: "Solidariedade e",
    subTitle: "Fraternidade",
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
  managementSection: {
    smallTitle: "Liderança",
    title: "Administração",
    subTitle: "Gestão Atual",
    members: [
      { name: "Irmão Fulano de Tal", role: "Venerável Mestre" },
      { name: "Irmão Ciclano de Tal", role: "1º Vigilante" },
      { name: "Irmão Beltrano de Tal", role: "2º Vigilante" },
      { name: "Irmão de Tal", role: "Secretário" },
      { name: "Irmão Outro Tal", role: "Orador" }
    ]
  },
  management: [],
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
  gallerySection: {
    smallTitle: "Nossos Momentos",
    title: "Galeria de",
    subTitle: "Imagens",
    items: []
  },
  gallery: [],
  welcomeBanner: {
    backgroundImage: '',
    title: 'ARCA DA ALIANÇA Nº 34',
    subTitle: 'Bem vindo à Loja Maçônica'
  },
  mastersSection: {
    smallTitle: "Eternos Veneráveis",
    title: "Nossa Galeria de",
    subTitle: "Past Masters",
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
      }
    ]
  },
  masters: [],
  familyGroups: {
    smallTitle: "União",
    title: "Nossa Família",
    subTitle: "e Ordens Auxiliares",
    guardians: {
      name: "As Guardiãs da Aliança",
      subTitle: "As Cunhadas",
      description: "As Guardiãs da Aliança é a ala feminina que reúne as esposas, companheiras e familiares dos obreiros da Loja Arca da Aliança Nº 34.",
      mission: "Promover a integração das famílias, organizar eventos beneficentes e oferecer suporte emocional e social à comunidade maçônica e regional.",
      vision: "Ser reconhecida como um pilar de amor e caridade, fortalecendo a base familiar dos maçons e impactando positivamente a sociedade.",
      values: ["Amor ao Próximo", "Fraternidade", "Dedicação", "Trabalho em Equipe"],
      history: "Fundada junto com a consolidação da oficina, o grupo de cunhadas sempre foi o braço direito nas ações sociais, transformando reuniões em momentos de união familiar.",
      image: ""
    },
    demolay: {
      name: "Ordem DeMolay",
      subTitle: "Capítulo Local",
      description: "A Ordem DeMolay é uma organização juvenil patrocinada pela Maçonaria para jovens do sexo masculino entre 12 e 21 anos.",
      mission: "Construir o caráter dos jovens através das sete virtudes cardeais: Amor Filial, Reverência pelas Coisas Sagradas, Cortesia, Companheirismo, Fidelidade, Pureza e Patriotismo.",
      vision: "Preparar jovens para serem cidadãos de bem e líderes exemplares em suas comunidades.",
      values: ["Liderança", "Honestidade", "Respeito", "Responsabilidade"],
      history: "O Capítulo Arca da Aliança da Ordem DeMolay foi instalado para guiar a juventude masculina do Guará, seguindo os preceitos de Jacques DeMolay.",
      image: ""
    },
    daughters: {
      name: "Garotas do Arco-Íris",
      subTitle: "Assembleia Local",
      description: "A Ordem Internacional das Filhas do Arco-Íris é uma organização para meninas entre 11 e 20 anos, focada no serviço e na liderança.",
      mission: "Ensinar autoconfiança, liderança e serviço à comunidade através de lições baseadas no simbolismo das cores do arco-íris.",
      vision: "Inspirar garotas a serem o melhor de si mesmas, agindo com bondade e coragem no mundo moderno.",
      values: ["Amor", "Religião", "Natureza", "Imortalidade", "Fidelidade", "Patriotismo", "Serviço"],
      history: "Nossa Assembleia acolhe jovens mulheres buscando o aperfeiçoamento pessoal e a criação de laços eternos de amizade e cooperação.",
      image: ""
    }
  },
  quest: {
    title: "Desejo fazer parte da Ordem",
    subTitle: "Clique acima para iniciar sua jornada"
  },
  contact: {
    smallTitle: "Contato",
    title: "Nossa Fraternidade à sua",
    subTitle: "Disposição",
    address: "Guará, Brasília - DF",
    subAddress: "Oriente de Brasília",
    meetings: "Terças-feiras às 20h00",
    subMeetings: "Restrita apenas para membros regulares",
    email: "lojaarcadaalianca34@gmail.com",
    subEmail: "Secretaria da Loja",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d678.4843943654762!2d-47.96468114777279!3d-15.852006807419746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935a2f1a883953b9%3A0x5348e0050b629ac8!2sAugusta%20e%20Respeit%C3%A1vel%20Loja%20Simb%C3%B3lica%20Arca%20da%20Alian%C3%A7a%20N%2034!5e0!3m2!1sen!2sbr!4v1778678011777!5m2!1sen!2sbr"
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
