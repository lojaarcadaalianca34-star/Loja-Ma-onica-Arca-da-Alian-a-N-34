import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface CandidateAnalysis {
  synthesis: string;
  performanceTable: {
    category: string;
    score: 'A' | 'B' | 'C' | 'D';
    reason: string;
  }[];
  sindicanciaPoints: string[];
  finalParecer: string;
  profileType: 'A' | 'B' | 'C' | 'D';
}

export async function analyzeCandidate(formData: any): Promise<CandidateAnalysis> {
  const prompt = `
    Como um experiente Mestre Maçom e analista de perfis, analise o seguinte formulário de interesse de ingresso na Maçonaria.
    Sua análise deve ser técnica, discreta e profunda, focando na compatibilidade do candidato com os valores da Ordem (Verdade, Honra, Filantropia, Família, Estabilidade).

    REGRAS DE PERFIL:
    - Perfil A (EXCELENTE): Respostas que demonstram alta integridade, liderança natural, estabilidade familiar total, apoio da esposa, e busca por aperfeiçoamento moral acima de curiosidade ou networking.
    - Perfil B (BOM): Demonstra bons valores, mas pode precisar de mais instrução ou ter pequenas hesitações sobre o tempo de dedicação ou dinâmica familiar.
    - Perfil C (RESERVADO): Respostas evasivas, foco excessivo em curiosidade, ou instabilidade familiar/financeira que pode ser prejudicada pela entrada na Ordem.
    - Perfil D (NÃO RECOMENDADO): Falta de apoio familiar, mentiras detectadas, busca por benefícios financeiros ou networking puro, ou valores morais desalinhados.

    DADOS DO CANDIDATO:
    ${JSON.stringify(formData, null, 2)}

    SAÍDA DA ANÁLISE (Responda APENAS em JSON com esta estrutura):
    {
      "synthesis": "Um parágrafo resumindo quem é o candidato e sua essência.",
      "performanceTable": [
        { "category": "Integridade & Verdade", "score": "A/B/C/D", "reason": "Motivo curto" },
        { "category": "Estabilidade Familiar", "score": "A/B/C/D", "reason": "Motivo curto" },
        { "category": "Motivação Real", "score": "A/B/C/D", "reason": "Motivo curto" },
        { "category": "Disponibilidade & Compromisso", "score": "A/B/C/D", "reason": "Motivo curto" }
      ],
      "sindicanciaPoints": ["Ponto 1 para os sindicantes investigarem", "Ponto 2..."],
      "finalParecer": "Parecer técnico final recomendando ou não o convite para sindicância.",
      "profileType": "A/B/C/D"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Clean JSON if needed
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    throw error;
  }
}
