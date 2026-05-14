import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/send-lead-email", async (req, res) => {
    const { formData } = req.body;
    
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Email not sent.");
      return res.status(200).json({ status: "skipped", message: "API Key missing" });
    }

    try {
      const { data, error } = await resend.emails.send({
        from: "Maçonaria Arca da Aliança <onboarding@resend.dev>",
        to: ["lojaarcadaalianca34@gmail.com"],
        subject: `Nova Candidatura: ${formData.fullName}`,
        html: `
          <div style="font-family: serif; padding: 20px; color: #1a1a1a;">
            <h1 style="color: #e6b000;">Nova Candidatura de Ingresso</h1>
            <p><strong>Nome:</strong> ${formData.fullName}</p>
            <p><strong>E-mail:</strong> ${formData.email}</p>
            <p><strong>Telefone:</strong> ${formData.phone}</p>
            <p><strong>Profissão:</strong> ${formData.profession}</p>
            <p><strong>Renda:</strong> ${formData.income}</p>
            <hr />
            <h3>Respostas do Formulário</h3>
            <p><strong>Motivação:</strong> ${formData.motivation}</p>
            <p><strong>Endereço Residencial:</strong> ${formData.residentialAddress}</p>
            <p><strong>Endereço Profissional:</strong> ${formData.professionalAddress}</p>
            <p><strong>Estado Civil:</strong> ${formData.civilStatus}</p>
            <p><strong>Filhos:</strong> ${formData.childrenCount}</p>
            
            <h4 style="color: #666;">Questões de Perfil</h4>
            <ul>
              ${[1,2,3,4,5,6,7,8,9,10,11,12].map(n => formData[`q${n}`] ? `<li><strong>P${n}:</strong> ${formData[`q${n}`]}</li>` : '').join('')}
            </ul>
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
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
