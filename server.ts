import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for DeepSeek chat
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      
      const systemPrompt = `You are a technical support agent for an educational platform called "Eshrah" (اشرح). 
You help students with technical issues or questions about the courses.
Be polite, helpful, and speak in Arabic by default as the user is likely an Arabic speaker.`;

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const reply = data.choices[0]?.message?.content || 'عذراً، لم أتمكن من الرد. يرجى المحاولة مرة أخرى.';

      res.json({ reply });
    } catch (error: any) {
      console.error('Error calling DeepSeek:', error);
      
      // Fallback message in Arabic for 503 or other errors
      res.json({ 
        reply: 'عذراً، النظام يواجه ضغطاً كبيراً في الوقت الحالي. يرجى المحاولة مرة أخرى بعد قليل، أو سيقوم أحد ممثلي الدعم الفني بالرد عليك قريباً.' 
      });
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
