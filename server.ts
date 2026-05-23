import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const app = express();

app.use(express.json());

  // API Routes
  app.post("/api/analyze-candidate", async (req, res) => {
    // 3. VALIDAÇÃO DA CHAVE NO CÓDIGO
    if (!process.env.GEMINI_API_KEY) {
      console.error("Critial Error: GEMINI_API_KEY is not defined in the environment variables!");
      return res.status(400).json({ error: "A chave da API não foi carregada no servidor" });
    }

    // 1. REVISÃO DO PARSER E PAYLOAD
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e: any) {
        console.error("Falha ao fazer o parse manual do corpo como JSON string:", e);
      }
    }

    const formData = body?.formData;
    if (!formData) {
      console.error("Payload vazio ou ausente recebido:", body);
      return res.status(400).json({
        error: "Erro de Payload: O corpo da requisição ou o campo 'formData' está ausente ou vazio no servidor.",
        receivedBody: req.body
      });
    }

    // Calculate age deterministically based on the reference year 2026
    const birthDateStr = formData?.birthDate || "";
    let calculatedAgeFact = "";
    if (birthDateStr) {
      const yearMatch = birthDateStr.match(/\d{4}/);
      if (yearMatch) {
         const birthYear = parseInt(yearMatch[0], 10);
         const age = 2026 - birthYear;
         calculatedAgeFact = `DADOS REAIS DO CANDIDATO PARA REFERÊNCIA:\n- Ano de nascimento: ${birthYear}\n- Idade calculada para 2026: ${age} anos completos (esteja atento a esta idade exata de ${age} anos na redação do seu parecer e na síntese, nunca recomende ou afirme uma idade incorreta!)`;
      }
    }

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

      ANO ATUAL DE REFERÊNCIA: 2026
      ${calculatedAgeFact}
      Ao redigir a síntese do candidato, certifique-se de calcular a idade dele CORRETAMENTE baseando-se no ano atual de 2026 (por exemplo, se o candidato nasceu em 1985, ele tem exatamente 41 anos em 2026, nunca escreva 38 anos).

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

    // 2. LOG DE ERRO FORÇADO (CONSOLE & FRONTEND)
    try {
      const ai = getAi();
      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const text = result.text || "";
      
      // Safe JSON extraction
      let jsonStr = text.trim();
      const firstCurly = jsonStr.indexOf("{");
      const lastCurly = jsonStr.lastIndexOf("}");
      if (firstCurly !== -1 && lastCurly !== -1 && lastCurly > firstCurly) {
        jsonStr = jsonStr.substring(firstCurly, lastCurly + 1);
      }
      
      res.status(200).json(JSON.parse(jsonStr));
    } catch (error: any) {
      console.error("🛑 CRITICAL BACKEND ERROR: AI Analysis failed with details:", error);
      res.status(500).json({
        error: error?.message || String(error),
        stack: error?.stack || null
      });
    }
  });

  app.post("/api/send-lead-email", async (req, res) => {
    const { formData, analysis } = req.body;
    
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Email not sent.");
      return res.status(200).json({ status: "skipped", message: "API Key missing" });
    }

    try {
      const { data, error } = await resend.emails.send({
        from: "Maçonaria Arca da Aliança <onboarding@resend.dev>",
        to: ["lojaarcadaalianca34@gmail.com"],
        subject: `Nova Candidatura: ${formData.fullName} (Perfil ${analysis?.profileType || 'N/A'})`,
        html: `
          <div style="font-family: serif; padding: 20px; color: #1a1a1a;">
            <h1 style="color: #0c1445; border-bottom: 2px solid #e6b000; padding-bottom: 10px;">REQUISITO DE INGRESSO</h1>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
              <p><strong>Candidato:</strong> ${formData.fullName}</p>
              <p><strong>E-mail:</strong> ${formData.email}</p>
              <p><strong>Cidade:</strong> ${formData.city}</p>
              <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            ${analysis ? `
              <div style="border: 2px solid #e6b000; border-radius: 15px; padding: 20px; margin-bottom: 25px;">
                <h2 style="color: #e6b000; margin-top: 0;">Parecer Técnico (IA)</h2>
                <p><strong>Síntese:</strong> ${analysis.synthesis}</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                  <thead>
                    <tr style="background-color: #0c1445; color: white;">
                      <th style="padding: 10px; text-align: left;">Categoria</th>
                      <th style="padding: 10px; text-align: center;">Score</th>
                      <th style="padding: 10px; text-align: left;">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${analysis.performanceTable.map((row: any) => `
                      <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 10px;">${row.category}</td>
                        <td style="padding: 10px; text-align: center; font-weight: bold;">${row.score}</td>
                        <td style="padding: 10px;">${row.reason}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>

                <p><strong>Paredes para Sindicância:</strong></p>
                <ul>
                  ${analysis.sindicanciaPoints.map((p: string) => `<li>${p}</li>`).join('')}
                </ul>

                <div style="background-color: #0c1445; color: white; padding: 15px; border-radius: 10px; margin-top: 15px;">
                  <p style="margin: 0;"><strong>Parecer Final:</strong> ${analysis.finalParecer}</p>
                  <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #e6b000;">Classificação: Perfil ${analysis.profileType}</p>
                </div>
              </div>
            ` : ''}

            <h3 style="color: #666;">Respostas Detalhadas</h3>
            <p><strong>Motivação:</strong> ${formData.motivation}</p>
            <p><strong>Profissão:</strong> ${formData.profession}</p>
            <p><strong>Renda:</strong> ${formData.income}</p>
            <p><strong>Religião:</strong> ${formData.faith}</p>
            <p><strong>Estado Civil:</strong> ${formData.civilStatus} ${formData.wifeName ? `(Cunhada: ${formData.wifeName} - ${formData.marriageTime})` : ''}</p>
            
            <h4 style="color: #666;">Questões de Perfil</h4>
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 10px;">
              ${[1,2,3,4,6,7,8,9,10,11,12].map(n => formData[`q${n}`] ? `<p><strong>Q${n}:</strong> ${formData[`q${n}`]}</p>` : '').join('')}
            </div>
            
            <div style="margin-top: 30px; font-size: 10px; color: #999; text-align: center;">
              Documento de uso exclusivo da Secretaria e Conselho de Mestres da A.R.L.S. Arca da Aliança nº 34.
            </div>
          </div>
        `,
      });

      if (error) {
        return res.status(400).json(error);
      }

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  // Send Invitation Email
  app.post("/api/send-invitation-email", async (req, res) => {
    const { email, personalMessage, invitedByEmail } = req.body;
    
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Email not sent.");
      return res.status(200).json({ status: "skipped", message: "API Key missing" });
    }

    try {
      const { data, error } = await resend.emails.send({
        from: "A.R.L.S. Arca da Aliança <onboarding@resend.dev>",
        to: [email],
        subject: `Convite para o Templo Virtual - Arca da Aliança nº 34`,
        html: `
          <div style="font-family: serif; padding: 40px; color: #1a1a1a; background-color: #fdf6e3; border: 2px solid #e6b000; border-radius: 20px; max-width: 600px; margin: auto;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0c1445; font-size: 24px; margin: 0;">A.R.L.S. ARCA DA ALIANÇA Nº 34</h1>
              <p style="color: #e6b000; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 5px;">Mestre, Luz e Verdade</p>
            </div>

            <div style="background-color: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: justify;">
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Saudações Fraternais, meu Irmão.
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Você foi convidado pelo Irmão <strong>${invitedByEmail}</strong> para adentrar ao nosso <strong>Templo Virtual</strong>. Este é um espaço restrito para o estudo, troca de conhecimentos e polimento da Pedra Bruta.
              </p>

              ${personalMessage ? `
                <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #e6b000; background-color: #fff9e6; font-style: italic;">
                  "${personalMessage}"
                </div>
              ` : ''}

              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Para completar seu ingresso, clique no botão abaixo e realize seu cadastro utilizando este e-mail:
              </p>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${req.headers.origin}/cadastro" style="background-color: #e6b000; color: #0c1445; padding: 18px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                  Realizar Cadastro no Templo
                </a>
              </div>

              <p style="font-size: 12px; color: #666; text-align: center;">
                Caso o botão não funcione, acesse: ${req.headers.origin}/cadastro
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; color: #8b5e34; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">
              Liberdade • Igualdade • Fraternidade
            </div>
          </div>
        `,
      });

      if (error) {
        return res.status(400).json(error);
      }

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    (async () => {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    })();
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  export default app;
