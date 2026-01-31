/**
 * Voice recorder engine using MediaRecorder API.
 * Handles MIME type detection for iOS/Android compatibility,
 * recording lifecycle, and audio Blob generation.
 */

export interface RecordingState {
  isRecording: boolean;
  duration: number;  // seconds
  error: string | null;
}

export type RecordingCallback = (state: RecordingState) => void;

let mediaRecorder: MediaRecorder | null = null;
let chunks: Blob[] = [];
let startTime = 0;
let timerInterval: ReturnType<typeof setInterval> | null = null;
let recordingCallback: RecordingCallback | null = null;

const MAX_DURATION_MS = 5 * 60 * 1000; // 5 minutes safety limit

/**
 * Detect the best supported audio MIME type.
 * iOS Safari requires specific MIME types; Android Chrome is more flexible.
 * Returns the first supported type from the preference list.
 */
export function detectMimeType(): string | null {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/wav'
  ];

  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }

  return null;
}

/**
 * Check if voice recording is available on this device.
 */
export function isRecordingAvailable(): boolean {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    typeof MediaRecorder !== 'undefined' &&
    detectMimeType()
  );
}

/**
 * Start recording audio from the device microphone.
 * @param onStateChange - Callback invoked with recording state updates (duration, errors)
 * @returns Promise that resolves when recording starts
 */
export async function startRecording(onStateChange: RecordingCallback): Promise<void> {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    throw new Error('Already recording');
  }

  recordingCallback = onStateChange;

  // Request microphone access
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100
    }
  });

  // Detect supported MIME type
  const mimeType = detectMimeType();
  if (!mimeType) {
    stream.getTracks().forEach(t => t.stop());
    throw new Error('No supported audio format on this device');
  }

  // Create recorder
  mediaRecorder = new MediaRecorder(stream, { mimeType });
  chunks = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  mediaRecorder.onerror = (e: Event) => {
    const error = (e as any).error;
    recordingCallback?.({
      isRecording: false,
      duration: 0,
      error: error?.message || 'Recording error'
    });
  };

  // Start recording (request data every second for progress)
  mediaRecorder.start(1000);
  startTime = Date.now();

  // Start duration timer
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    recordingCallback?.({
      isRecording: true,
      duration: elapsed,
      error: null
    });
  }, 500);

  // Auto-stop after max duration
  setTimeout(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      stopRecording();
    }
  }, MAX_DURATION_MS);

  recordingCallback?.({
    isRecording: true,
    duration: 0,
    error: null
  });
}

/**
 * Stop recording and return the audio Blob.
 * @returns Promise<{ blob: Blob; mimeType: string; durationSec: number }>
 */
export function stopRecording(): Promise<{ blob: Blob; mimeType: string; durationSec: number }> {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder || mediaRecorder.state !== 'recording') {
      reject(new Error('Not recording'));
      return;
    }

    const mimeType = mediaRecorder.mimeType;
    const durationSec = Math.floor((Date.now() - startTime) / 1000);

    // Clear timer
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    mediaRecorder.onstop = () => {
      // Release microphone
      const stream = mediaRecorder?.stream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const blob = new Blob(chunks, { type: mimeType });
      chunks = [];
      mediaRecorder = null;

      recordingCallback?.({
        isRecording: false,
        duration: durationSec,
        error: null
      });

      resolve({ blob, mimeType, durationSec });
    };

    mediaRecorder.stop();
  });
}

/**
 * Format seconds as MM:SS string.
 */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
