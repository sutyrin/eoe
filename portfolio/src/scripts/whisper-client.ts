/**
 * Client-side Whisper API communication.
 * Sends audio to the standalone transcription server endpoint.
 * Never exposes API key — all transcription goes through server.
 */

// Transcription server URL (configurable via env or default)
const TRANSCRIBE_URL = import.meta.env.PUBLIC_TRANSCRIBE_URL || 'http://localhost:3001/api/transcribe';

export interface TranscriptionResult {
  text: string;
  error: string | null;
}

/**
 * Send audio blob to Whisper API via server endpoint for transcription.
 * @param audioBlob - The recorded audio Blob
 * @param mimeType - MIME type of the audio (e.g., 'audio/webm;codecs=opus')
 * @returns TranscriptionResult with text or error
 */
export async function transcribeAudio(
  audioBlob: Blob,
  mimeType: string
): Promise<TranscriptionResult> {
  // Determine file extension from MIME type
  const extMap: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/webm;codecs=opus': 'webm',
    'audio/mp4': 'm4a',
    'audio/ogg;codecs=opus': 'ogg',
    'audio/wav': 'wav'
  };
  const ext = extMap[mimeType] || 'webm';

  try {
    // Check if we're online
    if (!navigator.onLine) {
      return {
        text: '',
        error: 'offline'
      };
    }

    const formData = new FormData();
    const audioFile = new File([audioBlob], `voice-note.${ext}`, { type: mimeType });
    formData.append('audio', audioFile);

    const response = await fetch(TRANSCRIBE_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        text: '',
        error: errorData.message || `Transcription failed (${response.status})`
      };
    }

    const data = await response.json();
    return {
      text: data.text || '',
      error: null
    };

  } catch (error) {
    console.error('[whisper-client] Transcription error:', error);
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
