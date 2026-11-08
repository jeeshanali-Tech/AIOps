import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter, handleOAuthCallback } from './src/server/api.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', apiRouter);
app.get(['/auth/callback', '/auth/callback/', '/auth/github/callback', '/auth/github/callback/'], handleOAuthCallback);


// Serve static assets in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`OpsPilot server running on port ${port}`);
});
