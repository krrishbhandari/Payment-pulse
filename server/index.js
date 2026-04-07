import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import nodemailer from 'nodemailer';

dotenv.config({ path: '.env.local' });

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
if (!apiKey) {
  console.warn('OPENAI API key not set. Set OPENAI_API_KEY in environment or .env.local');
}

const openai = new OpenAI({ apiKey });

// Configure mail transporter using env vars
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

let transporter = null;
if (smtpHost && smtpPort && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
} else {
  console.warn('SMTP credentials not configured. Email endpoint will fail without SMTP_HOST/USER/PASS.');
}

app.post('/api/openai', async (req, res) => {
  try {
    const { prompt, model = 'gpt-5-nano', max_tokens } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });

    const response = await openai.responses.create({
      model,
      input: prompt,
      ...(max_tokens ? { max_tokens } : {}),
    });

    // Prefer helper text if available
    // eslint-disable-next-line no-underscore-dangle
    const text = response.output_text ?? JSON.stringify(response.output || response, null, 2);
    res.json({ text });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('OpenAI proxy error', err);
    // @ts-ignore
    res.status(500).json({ error: err?.message ?? String(err) });
  }
});

// Send reminder email endpoint
app.post('/api/send-reminder', async (req, res) => {
  try {
    if (!transporter) return res.status(500).json({ error: 'SMTP not configured on server' });

    const { to, subject, text, html, from } = req.body;
    if (!to || !subject || (!text && !html)) return res.status(400).json({ error: 'to, subject and text/html are required' });

    const mailOptions = {
      from: from || process.env.EMAIL_FROM || smtpUser,
      to,
      subject,
      text: text || undefined,
      html: html || undefined,
    };

    const info = await transporter.sendMail(mailOptions);
    res.json({ success: true, info });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Email send error', err);
    // @ts-ignore
    res.status(500).json({ error: err?.message ?? String(err) });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`OpenAI proxy listening on http://localhost:${port}`);
});
