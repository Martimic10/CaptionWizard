const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './.env' });

const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Give me 3 short, engaging Instagram captions with hashtags and a CTA for: "${prompt}". Number them.`
        }
      ],
      temperature: 0.8,
      max_tokens: 300
    });

    const rawText = response.choices[0].message.content.trim();

    const captions = rawText
      .split(/\n(?=\d\.)/) 
      .map(c => c.replace(/^\d\.\s*/, '').trim())
      .filter(Boolean);

    res.json({ captions });
  } catch (error) {
    console.error('OpenAI error:', error);
    res.status(500).json({ error: 'Failed to generate captions' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));