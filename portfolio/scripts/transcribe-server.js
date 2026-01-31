/**
 * Standalone Whisper transcription server.
 * Runs alongside the portfolio dev/preview server.
 * Listens on port 3001 (configurable via TRANSCRIBE_PORT env var).
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node portfolio/scripts/transcribe-server.js
 *
 * The client-side code sends audio to this endpoint.
 */
import { createServer } from 'http';
import { OpenAI } from 'openai';

const PORT = process.env.TRANSCRIBE_PORT || 3001;
const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
  console.error('[transcribe-server] OPENAI_API_KEY environment variable required');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: API_KEY });

const server = createServer(async (req, res) => {
  // CORS headers for cross-origin requests from portfolio
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/api/transcribe') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  try {
    // Read request body as buffer
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);

    // Parse multipart form data manually (simple implementation)
    // The client sends a FormData with 'audio' field
    const contentType = req.headers['content-type'] || '';

    if (!contentType.includes('multipart/form-data')) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Expected multipart/form-data' }));
      return;
    }

    // Extract boundary
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    if (!boundaryMatch) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing boundary' }));
      return;
    }

    const boundary = boundaryMatch[1];
    const parts = parseMultipart(body, boundary);
    const audioPart = parts.find(p => p.name === 'audio');

    if (!audioPart) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No audio file in request' }));
      return;
    }

    // Create a File-like object for the OpenAI SDK
    const audioFile = new File(
      [audioPart.data],
      audioPart.filename || 'voice-note.webm',
      { type: audioPart.contentType || 'audio/webm' }
    );

    console.log(`[transcribe-server] Transcribing ${audioFile.name} (${audioFile.size} bytes)`);

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'text'
    });

    console.log(`[transcribe-server] Transcription: "${transcription.substring(0, 80)}..."`);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ text: transcription }));

  } catch (error) {
    console.error('[transcribe-server] Error:', error.message);

    const statusCode = error.status || 500;
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Transcription failed',
      message: error.message
    }));
  }
});

/**
 * Simple multipart form data parser.
 */
function parseMultipart(body, boundary) {
  const parts = [];
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const endBoundaryBuffer = Buffer.from(`--${boundary}--`);

  let start = body.indexOf(boundaryBuffer) + boundaryBuffer.length + 2; // Skip \r\n

  while (start < body.length) {
    const nextBoundary = body.indexOf(boundaryBuffer, start);
    if (nextBoundary === -1) break;

    const partData = body.slice(start, nextBoundary - 2); // Trim trailing \r\n
    const headerEnd = partData.indexOf('\r\n\r\n');
    if (headerEnd === -1) break;

    const headers = partData.slice(0, headerEnd).toString();
    const data = partData.slice(headerEnd + 4);

    const nameMatch = headers.match(/name="([^"]+)"/);
    const filenameMatch = headers.match(/filename="([^"]+)"/);
    const contentTypeMatch = headers.match(/Content-Type:\s*(.+)/i);

    if (nameMatch) {
      parts.push({
        name: nameMatch[1],
        filename: filenameMatch ? filenameMatch[1] : null,
        contentType: contentTypeMatch ? contentTypeMatch[1].trim() : null,
        data
      });
    }

    start = nextBoundary + boundaryBuffer.length + 2;
  }

  return parts;
}

server.listen(PORT, () => {
  console.log(`[transcribe-server] Listening on http://localhost:${PORT}/api/transcribe`);
  console.log('[transcribe-server] Ready for voice note transcription');
});
