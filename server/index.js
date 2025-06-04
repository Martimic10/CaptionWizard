const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './.env' });

const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
  const { prompt, type } = req.body;

  let promptInstruction;

  if (type === 'caption') {
    promptInstruction = `Give me 3 short, engaging Instagram captions with hashtags and a CTA for: "${prompt}". Number each one.`;
  } else if (type === 'hashtags') {
    promptInstruction = `Generate 3 sets of 5-7 relevant hashtags for this topic: "${prompt}". Number each set.`;
  } else if (type === 'cta') {
    promptInstruction = `Write 3 short call-to-action (CTA) lines for a social media post about: "${prompt}". Number them.`;
  } else {
    return res.status(400).json({ error: 'Invalid type selected.' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: promptInstruction }],
      temperature: 0.8,
      max_tokens: 300,
    });

    const rawText = response.choices[0].message.content.trim();

    const captions = rawText
      .split(/\n(?=\d\.)/)
      .map(c => c.replace(/^\d\.\s*/, '').trim())
      .filter(Boolean);

    console.log('Generated captions:', captions);

    res.json({ captions });
  } catch (error) {
    console.error('OpenAI error:', error.response?.data || error.message || error);
    res.status(500).json({ error: 'Failed to generate captions' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));