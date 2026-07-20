import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for Gemini chat
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      
      const prompt = `You are a technical support agent for an educational platform called "Eshrah" (اشرح). 
You help students with technical issues or questions about the courses.
Be polite, helpful, and speak in Arabic by default as the user is likely an Arabic speaker.
User message: ${message}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error('Error calling Gemini:', error);
      
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
