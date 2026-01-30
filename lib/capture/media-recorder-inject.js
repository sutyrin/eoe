/**
 * MediaRecorder injection script for in-browser canvas + audio recording.
 * This function runs inside the Playwright browser page context.
 * It captures the canvas stream, optionally combines with Tone.js audio,
 * and returns the recorded video as a base64-encoded WebM.
 *
 * @param {object} options
 * @param {number} options.duration - Capture duration in milliseconds
 * @param {number} options.fps - Frame rate for canvas capture
 * @param {boolean} options.hasAudio - Whether to capture audio stream
 * @returns {string} Base64-encoded WebM video data
 */
export function getMediaRecorderScript() {
  // Return the function body as a serializable function for page.evaluate
  return async function captureInBrowser({ duration, fps, hasAudio }) {
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

    // Get canvas video stream
    const videoStream = canvas.captureStream(fps);
    let combinedStream;

    if (hasAudio && typeof Tone !== 'undefined') {
      // Access Tone.js audio context and create a destination for recording
      const audioContext = Tone.context.rawContext || Tone.context._context;
      const audioDestination = audioContext.createMediaStreamDestination();

      // Connect Tone.js master output to our recording destination
      // Tone.Destination is the master output node
      Tone.getDestination().connect(audioDestination);

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

      // Request data every second for progress
      mediaRecorder.start(1000);

      setTimeout(() => {
        mediaRecorder.stop();
      }, duration);
    });
  };
}
