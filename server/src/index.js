
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { unlink } from 'node:fs/promises';
import { runAgent } from './agent.js';
import { ingestData } from './ingest.js';

dotenv.config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env'),
});

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.diskStorage({
    destination: os.tmpdir(),
    filename: (_request, file, callback) => {
      const extension = path.extname(file.originalname || '');
      callback(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${extension}`);
    },
  }),
  fileFilter: (_request, file, callback) => {
    const isPdf =
      file.mimetype === 'application/pdf' ||
      (file.originalname || '').toLowerCase().endsWith('.pdf');
    callback(isPdf ? null : new Error('Only PDF files are allowed'), isPdf);
  },
  limits: { fileSize: 25 * 1024 * 1024 },
});

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.post('/api/chat', async (request, response) => {
  try {
    const { message, sessionId } = request.body;
    if (!message) {
      return response.status(400).json({ error: 'Message required' });
    }

    const answer = await runAgent({ message, sessionId });
    const output = answer?.output || answer?.text || '';

    if (!output || output.trim() === '') {
      return response.json({
        answer: "I couldn't generate a proper response. Please rephrase your question.",
      });
    }

    return response.json({ answer: output });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: error.message });
  }
});

app.post('/api/ingest', upload.single('file'), async (request, response) => {
  try {
    if (!request.file?.path) {
      return response.status(400).json({ error: 'Missing PDF file' });
    }

    await ingestData(request.file.path);
    await unlink(request.file.path).catch(() => undefined);
    return response.json({ ok: true });
  } catch (error) {
    if (request.file?.path) {
      await unlink(request.file.path).catch(() => undefined);
    }
    return response.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
