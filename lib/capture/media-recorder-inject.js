/**
 * MediaRecorder injection script for in-browser canvas + audio recording.
 * This function runs inside the Playwright browser page context.
 * It captures the canvas stream, optionally combines with Tone.js audio via
 * globally-exposed AudioContext (window.__TONE_CONTEXT__), and returns the
 * recorded video as a base64-encoded WebM.
 *
 * @param {object} options
 * @param {number} options.duration - Capture duration in milliseconds
 * @param {number} options.fps - Frame rate for canvas capture (deprecated, now uses automatic mode)
 * @param {boolean} options.hasAudio - Whether to capture audio stream
 * @param {string} options.playSelector - CSS selector for Play button (clicked after recording starts)
 * @returns {string} Base64-encoded WebM video data
 */
export function getMediaRecorderScript() {
  // Return the function body as a serializable function for page.evaluate
  return async function captureInBrowser({ duration, fps, hasAudio, playSelector }) {
    // Wait for canvas to be ready
    let canvas = document.querySelector('canvas');
    let attempts = 0;
    while (!canvas && attempts < 50) {
      await new Promise(r => setTimeout(r, 100));
      canvas = document.querySelector('canvas');
      attempts++;
    }

    if (!canvas) {
      throw new Error('No canvas element found on page');
    }

    // If audio atom, click Play button to initialize Tone.js context
    // This must happen before MediaRecorder setup because we need audio tracks in the stream
    if (hasAudio && playSelector) {
      const playBtn = document.querySelector(playSelector);
      if (playBtn) {
        playBtn.click();
        // Minimal wait (50ms) for audio context to be initialized and exposed
        // This is unavoidable because ensureAudioContext() is async
        await new Promise(r => setTimeout(r, 50));
      }
    }

    // Get canvas video stream in automatic mode (captures whenever canvas changes)
    // No fps argument means frames are captured at actual draw boundaries, not on independent timer
    const videoStream = canvas.captureStream();
    let combinedStream;

    // Set up audio routing if audio atom
    if (hasAudio && window.__TONE_CONTEXT__ && window.__TONE_DESTINATION__) {
      const audioContext = window.__TONE_CONTEXT__;
      const audioDestination = audioContext.createMediaStreamDestination();

      // Connect Tone.js master output to our recording destination
      window.__TONE_DESTINATION__.connect(audioDestination);

      // Combine video and audio tracks
      combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...audioDestination.stream.getAudioTracks()
      ]);
    } else {
      combinedStream = videoStream;
    }

    // Determine supported MIME type
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
    }

    // Create MediaRecorder
    const mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: 8000000 // 8 Mbps for high quality master
    });

    const chunks = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    // Record
    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        // Convert to base64 for transfer back to Node.js
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read video blob'));
        reader.readAsDataURL(blob);
      };

      mediaRecorder.onerror = (e) => reject(new Error(`MediaRecorder error: ${e.error?.message || 'unknown'}`));

      // Start recording in single-chunk mode (no timeslice) for better timestamp precision
      mediaRecorder.start();

      // Stop recording after duration
      setTimeout(() => {
        mediaRecorder.stop();
      }, duration);
    });
  };
}
