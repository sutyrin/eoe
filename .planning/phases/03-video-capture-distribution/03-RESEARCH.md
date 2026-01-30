# Phase 3: Video Capture & Distribution - Research

**Researched:** 2026-01-30
**Domain:** Canvas video recording, audio capture, video encoding, platform API integration
**Confidence:** MEDIUM (verified with official sources, some areas require validation)

## Summary

Phase 3 involves capturing running p5.js atoms (visual + audio) to video, encoding for multiple platform formats (YouTube 16:9, TikTok 9:16), extracting thumbnails, and publishing via CLI with platform API integration.

The standard approach uses **browser-based MediaRecorder API** to capture canvas visuals with synchronized Web Audio output, then **FFmpeg** for post-processing (encoding, resizing, cropping, thumbnail extraction). Platform publishing uses **googleapis** for YouTube and **TikTok Content Posting API** with OAuth2 authentication.

Key insight: Browser-native capture is simpler than Playwright-based recording for this use case. MediaRecorder API handles canvas.captureStream() + Web Audio synchronization natively, producing WebM files that FFmpeg can transcode to platform-specific formats.

**Primary recommendation:** Use MediaRecorder API for capture (in-browser), FFmpeg for encoding/thumbnails, googleapis for YouTube, and direct TikTok API calls for TikTok publishing.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| MediaRecorder API | Browser native | Capture canvas + audio to video | Built-in browser API, handles synchronization automatically |
| FFmpeg | Latest (6.x+) | Video encoding, format conversion, thumbnail extraction | Industry standard, supports all codecs/formats |
| fluent-ffmpeg | 2.1.3 | Node.js wrapper for FFmpeg | Most popular FFmpeg wrapper for Node.js (10M+ downloads/week) |
| googleapis | Latest | YouTube Data API v3 client | Official Google Node.js client, handles OAuth2 + refresh tokens |
| Tone.Recorder | Built into Tone.js | Alternative Web Audio recording | If Tone.js already used, provides simple recording API |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| commander | 12.x | CLI argument parsing | Simpler API, Git-style subcommands |
| yargs | 17.x | CLI argument parsing | More powerful validation, fluent API |
| exponential-backoff | Latest | API retry logic | Handles network failures with exponential delays |
| keytar | Latest | Secure credential storage | Optional: OS-level encryption for OAuth tokens |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| MediaRecorder | Playwright video recording | Playwright harder to configure, lower quality (hardcoded 1Mbit/s bitrate) |
| MediaRecorder | playwright-screen-recorder | Adds complexity, meant for test recording not animation capture |
| fluent-ffmpeg | Direct FFmpeg CLI calls | Fluent-ffmpeg provides error handling, progress events, simpler API |
| Tone.Recorder | MediaStreamAudioDestinationNode | More control but more complex setup |
| keytar | File-based token storage | Keytar uses OS keychain (more secure) but requires native compilation |

**Installation:**
```bash
# Core dependencies
npm install fluent-ffmpeg googleapis

# CLI framework (choose one)
npm install commander
# OR
npm install yargs

# Optional: retry logic and secure storage
npm install exponential-backoff keytar
```

**System dependency:**
```bash
# FFmpeg must be installed on system
# macOS:
brew install ffmpeg

# Ubuntu/Debian:
sudo apt-get install ffmpeg

# Or use ffmpeg-static npm package (bundles FFmpeg binary):
npm install ffmpeg-static
```

## Architecture Patterns

### Recommended Project Structure
```
cli/
├── commands/
│   ├── capture.js       # eoe capture <atom> --duration 10
│   ├── auth.js          # eoe auth youtube|tiktok
│   └── publish.js       # eoe publish video.mp4 --platform youtube
├── lib/
│   ├── capture/
│   │   ├── browser-capture.js    # Launch browser, run MediaRecorder
│   │   ├── audio-sync.js         # Web Audio + canvas stream combination
│   │   └── playwright-runner.js  # Playwright page setup for atom
│   ├── encoding/
│   │   ├── ffmpeg-encoder.js     # FFmpeg encoding profiles
│   │   ├── aspect-ratio.js       # 16:9, 9:16 crop/pad logic
│   │   └── thumbnail.js          # Keyframe extraction
│   ├── platforms/
│   │   ├── youtube-client.js     # YouTube Data API wrapper
│   │   ├── tiktok-client.js      # TikTok Content Posting API wrapper
│   │   └── oauth-manager.js      # Token storage/refresh
│   └── utils/
│       ├── retry.js              # Exponential backoff retry
│       └── credentials.js        # Secure credential storage
└── videos/
    ├── masters/          # Original 800x800 captures (WebM)
    ├── youtube/          # 16:9 H.264 MP4 files
    ├── tiktok/           # 9:16 H.264 MP4 files
    └── thumbnails/       # Extracted thumbnail images
```

### Pattern 1: Browser-Based Canvas + Audio Capture

**What:** Use Playwright to launch browser, navigate to atom, inject MediaRecorder capture script, save WebM output.

**When to use:** Capturing p5.js canvas with Tone.js audio in single workflow.

**Example:**
```javascript
// Source: MDN MediaStream Recording API + AudioContext.createMediaStreamDestination()
// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API
// https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaStreamDestination

async function captureAtom(atomPath, duration = 10000) {
  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`file://${atomPath}/index.html`);

  // Inject capture script into page context
  const videoBlob = await page.evaluate(async (captureDuration) => {
    // Get canvas stream
    const canvas = document.querySelector('canvas');
    const videoStream = canvas.captureStream(30); // 30 FPS

    // Get Web Audio stream (if Tone.js is active)
    const audioContext = Tone.context.rawContext; // Access native AudioContext
    const audioDestination = audioContext.createMediaStreamDestination();

    // Connect Tone.js master output to destination
    Tone.Destination.connect(audioDestination);

    // Combine streams
    const combinedStream = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...audioDestination.stream.getAudioTracks()
    ]);

    // Record combined stream
    const mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: 'video/webm;codecs=vp9,opus'
    });

    const chunks = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

    return new Promise((resolve) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // Base64
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), captureDuration);
    });
  }, duration);

  await browser.close();

  // Convert base64 to buffer and save
  const buffer = Buffer.from(videoBlob.split(',')[1], 'base64');
  return buffer; // Save to videos/masters/
}
```

### Pattern 2: FFmpeg Multi-Format Encoding

**What:** From master 800x800 WebM, generate YouTube 16:9 and TikTok 9:16 versions with proper encoding.

**When to use:** After capture, before publishing.

**Example:**
```javascript
// Source: FFmpeg H.264 encoding best practices (multiple sources)
// https://gist.github.com/mikoim/27e4e0dc64e384adbcb91ff10a2d3678
// https://slhck.info/video/2017/02/24/crf-guide.html

const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegStatic);

async function encodeForYouTube(masterPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(masterPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .audioBitrate('128k')
      .outputOptions([
        '-profile:v high',        // H.264 High profile
        '-level 4.2',             // Compatibility level
        '-preset slow',           // Slower = better quality
        '-crf 23',                // Constant quality (18-28 range)
        '-movflags +faststart',   // Web streaming optimization
        '-pix_fmt yuv420p',       // Maximum compatibility
        '-bf 2',                  // 2 consecutive B-frames
        '-g 48',                  // GOP size (2x framerate for 24fps)
      ])
      .videoFilters([
        'scale=1920:1080:force_original_aspect_ratio=decrease', // Fit within 1920x1080
        'pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black' // Letterbox to 16:9
      ])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

async function encodeForTikTok(masterPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(masterPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .audioBitrate('128k')
      .videoBitrate('6M')         // TikTok recommended: 6-8 Mbps for 1080p
      .outputOptions([
        '-profile:v high',
        '-level 4.2',
        '-preset slow',
        '-crf 23',
        '-movflags +faststart',
        '-pix_fmt yuv420p',
      ])
      .videoFilters([
        'scale=1080:1920:force_original_aspect_ratio=decrease', // Fit within 1080x1920
        'pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black' // Pillarbox to 9:16
      ])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}
```

### Pattern 3: Thumbnail Extraction with Keyframe Detection

**What:** Extract best representative frame from video using FFmpeg's thumbnail filter.

**When to use:** After encoding, to provide thumbnail for platform upload.

**Example:**
```javascript
// Source: FFmpeg thumbnail extraction best practices
// https://www.mux.com/articles/extract-thumbnails-from-a-video-with-ffmpeg
// https://ottverse.com/thumbnails-screenshots-using-ffmpeg/

async function extractThumbnail(videoPath, thumbnailPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        '-vf thumbnail=300',      // Analyze 300 frames, pick best
        '-frames:v 1',            // Extract 1 frame
        '-q:v 2'                  // High quality JPEG (scale 2-31, lower = better)
      ])
      .output(thumbnailPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

// Alternative: Extract keyframes at specific times
async function extractKeyframes(videoPath, outputPattern) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        "-vf select='eq(pict_type,I)'",  // Extract I-frames only
        '-vsync vfr',                     // Variable frame rate
        '-q:v 2'
      ])
      .output(outputPattern) // e.g., 'thumb_%03d.jpg'
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}
```

### Pattern 4: YouTube Upload with Resumable Upload

**What:** Use googleapis with OAuth2 to upload video with resumable protocol (handles large files, network interruptions).

**When to use:** Publishing to YouTube.

**Example:**
```javascript
// Source: Google YouTube Data API documentation
// https://developers.google.com/youtube/v3/quickstart/nodejs
// https://developers.google.com/youtube/v3/guides/using_resumable_upload_protocol

const { google } = require('googleapis');
const fs = require('fs');

async function uploadToYouTube(oauth2Client, videoPath, metadata) {
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const response = await youtube.videos.insert({
    part: 'snippet,status',
    requestBody: {
      snippet: {
        title: metadata.title,
        description: metadata.description || '',
        tags: metadata.tags || [],
        categoryId: '22', // People & Blogs
      },
      status: {
        privacyStatus: 'public', // 'public', 'private', 'unlisted'
      },
    },
    media: {
      body: fs.createReadStream(videoPath),
    },
  });

  return response.data.id; // Video ID
}

// OAuth2 token refresh is automatic with googleapis
// Just load stored credentials:
oauth2Client.setCredentials({
  access_token: storedTokens.access_token,
  refresh_token: storedTokens.refresh_token,
  expiry_date: storedTokens.expiry_date,
});
// googleapis will automatically refresh if expired
```

### Pattern 5: TikTok Two-Step Upload

**What:** TikTok uses two-step process: initialize upload (get URL), then PUT video to URL.

**When to use:** Publishing to TikTok.

**Example:**
```javascript
// Source: TikTok Content Posting API documentation
// https://developers.tiktok.com/doc/content-posting-api-get-started-upload-content

const axios = require('axios');
const fs = require('fs');

async function uploadToTikTok(accessToken, videoPath, metadata) {
  // Step 1: Initialize upload
  const initResponse = await axios.post(
    'https://open.tiktokapis.com/v2/post/publish/video/init/',
    {
      post_info: {
        title: metadata.title,
        privacy_level: 'PUBLIC_TO_EVERYONE', // or 'SELF_ONLY', 'MUTUAL_FOLLOW_FRIENDS'
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000, // Cover frame at 1 second
      },
      source_info: {
        source: 'FILE_UPLOAD',
        video_size: fs.statSync(videoPath).size,
        chunk_size: fs.statSync(videoPath).size, // Single chunk
        total_chunk_count: 1,
      },
    },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
    }
  );

  const { publish_id, upload_url } = initResponse.data.data;

  // Step 2: Upload video to provided URL
  const videoBuffer = fs.readFileSync(videoPath);
  await axios.put(upload_url, videoBuffer, {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Length': videoBuffer.length,
    },
  });

  return publish_id; // Use to check status later
}
```

### Pattern 6: Retry with Exponential Backoff

**What:** Retry failed API calls with increasing delays (0.5s, 1s, 2s, 4s...).

**When to use:** Network/API failures during publishing.

**Example:**
```javascript
// Source: Exponential backoff retry patterns
// https://www.codewithyou.com/blog/how-to-implement-retry-with-exponential-backoff-in-nodejs

const { backOff } = require('exponential-backoff');

async function publishWithRetry(uploadFn, maxRetries = 3) {
  return backOff(uploadFn, {
    numOfAttempts: maxRetries,
    startingDelay: 500,        // Start with 500ms
    timeMultiple: 2,           // Double each time
    maxDelay: 8000,            // Cap at 8 seconds
    retry: (error, attemptNumber) => {
      console.log(`Attempt ${attemptNumber} failed: ${error.message}`);
      // Only retry on network/API errors, not auth failures
      return error.code === 'ENOTFOUND' ||
             error.code === 'ETIMEDOUT' ||
             (error.response && error.response.status >= 500);
    },
  });
}

// Usage:
const videoId = await publishWithRetry(() => uploadToYouTube(oauth2Client, videoPath, metadata));
```

### Anti-Patterns to Avoid

- **Don't use Playwright's built-in video recording for canvas capture:** Hardcoded 1Mbit/s bitrate, scales down to 800x800 max, meant for test recording not high-quality canvas animations.
- **Don't encode directly to platform formats during capture:** Capture master quality first (WebM VP9), then transcode. Allows re-encoding if requirements change.
- **Don't store OAuth tokens in plain text:** Use keytar (OS keychain) or at minimum encrypt tokens before file storage.
- **Don't retry auth failures:** Only retry network/server errors. 401/403 errors require re-authentication, not retry.
- **Don't ignore aspect ratio handling:** Always use `scale` + `pad` filters to avoid distorted videos. Never stretch.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| FFmpeg command construction | String concatenation of CLI flags | fluent-ffmpeg | Handles escaping, progress events, error handling, cross-platform paths |
| OAuth2 token refresh | Manual expiry checking + refresh requests | googleapis OAuth2Client | Automatic refresh on 401, handles refresh token rotation, manages expiry |
| Video format detection | Parsing codec/container manually | FFmpeg probe (`ffprobe`) | Reliable metadata extraction, handles all formats |
| Retry logic | Custom setTimeout loops | exponential-backoff package | Jitter, max delay caps, conditional retry logic built-in |
| CLI argument parsing | Manual process.argv slicing | commander or yargs | Validation, help generation, subcommands, POSIX compliance |
| Secure token storage | Custom encryption schemes | keytar | OS-level encryption (Keychain/Credential Vault/libsecret), audited |

**Key insight:** Video encoding has many edge cases (codecs, containers, pixel formats, color spaces). FFmpeg handles all of them. Don't parse raw video data or construct CLI commands manually.

## Common Pitfalls

### Pitfall 1: Audio/Video Desynchronization

**What goes wrong:** Canvas frames recorded at different rate than audio samples, causing drift over time.

**Why it happens:** MediaRecorder doesn't guarantee frame-perfect sync. Canvas may skip frames if browser busy, but audio continues at fixed sample rate.

**How to avoid:**
- Use fixed frame rate for canvas.captureStream() (e.g., 30 FPS)
- Keep capture duration short (10s recommended, max 30s to limit drift)
- Test with audio-heavy atoms to verify sync quality

**Warning signs:** Audio finishes before/after video ends, audio plays faster/slower than visual animation.

### Pitfall 2: FFmpeg Aspect Ratio Distortion

**What goes wrong:** Videos appear stretched or squashed on platforms.

**Why it happens:** Using `scale` without `pad` or `crop`, forcing non-native aspect ratios.

**How to avoid:**
- Always use `scale=W:H:force_original_aspect_ratio=decrease` (fits within bounds)
- Follow with `pad=W:H:(ow-iw)/2:(oh-ih)/2:black` (centers with letterbox/pillarbox)
- Never use `scale=W:H` alone (forces aspect ratio, distorts content)

**Warning signs:** Circular elements appear oval, text appears squished.

### Pitfall 3: Platform Upload Validation Failures

**What goes wrong:** Video uploads rejected by YouTube/TikTok APIs due to codec/format issues.

**Why it happens:** Platforms have strict requirements (H.264 High profile, yuv420p pixel format, AAC audio).

**How to avoid:**
- Always use recommended FFmpeg output options (see Pattern 2)
- Include `-pix_fmt yuv420p` (most compatible pixel format)
- Use `-profile:v high -level 4.2` (H.264 High profile, broad compatibility)
- Include `-movflags +faststart` (enables streaming before full download)

**Warning signs:** Upload succeeds but video won't play, "unsupported format" errors.

### Pitfall 4: OAuth Token Expiry During Upload

**What goes wrong:** Large video uploads fail mid-transfer when access token expires.

**Why it happens:** Access tokens typically expire in 1 hour. Large uploads take longer.

**How to avoid:**
- Use googleapis OAuth2Client (handles refresh automatically)
- Store refresh_token persistently (not just access_token)
- Set `access_type: 'offline'` when generating auth URL (ensures refresh token provided)
- googleapis will automatically refresh during upload if needed

**Warning signs:** Upload starts successfully but fails after ~1 hour with 401 error.

### Pitfall 5: Headless Browser Canvas Rendering Issues

**What goes wrong:** Canvas animations render incorrectly in headless mode (missing frames, black screen, visual glitches).

**Why it happens:** Hardware acceleration disabled by default in headless, WebGL/Canvas may not render properly.

**How to avoid:**
- Launch Playwright with hardware acceleration flags:
  ```javascript
  chromium.launch({
    headless: true,
    args: ['--use-angle=gl', '--enable-gpu', '--enable-webgl']
  })
  ```
- Add delay after page load to ensure canvas initializes (500ms typical)
- Test capture with complex atoms to verify rendering quality

**Warning signs:** Captured video is black screen, frame rate lower than expected, visual artifacts.

### Pitfall 6: File Size Limits

**What goes wrong:** Platform API rejects video due to file size exceeding limits.

**Why it happens:**
- TikTok: 72 MB (Android), 287.6 MB (iOS), 500 MB (ads)
- YouTube: 256 GB (unlikely to hit)

**How to avoid:**
- Monitor output file size during encoding
- For TikTok, keep captures short (10-30s) or increase compression (CRF 28 instead of 23)
- Use `fluent-ffmpeg` progress events to estimate final size during encoding

**Warning signs:** Upload fails immediately with size-related error message.

## Code Examples

Verified patterns from official sources:

### Combining Canvas and Web Audio Streams

```javascript
// Source: MDN MediaStream Recording API
// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API

// Get canvas stream
const canvas = document.querySelector('canvas');
const videoStream = canvas.captureStream(30); // 30 FPS

// Get Web Audio stream
const audioContext = new AudioContext();
const audioDestination = audioContext.createMediaStreamDestination();

// Connect audio sources to destination
// (Tone.js example: Tone.Destination.connect(audioDestination))

// Combine streams
const combinedStream = new MediaStream([
  ...videoStream.getVideoTracks(),
  ...audioDestination.stream.getAudioTracks()
]);

// Record
const mediaRecorder = new MediaRecorder(combinedStream, {
  mimeType: 'video/webm;codecs=vp9,opus'
});
```

### FFmpeg Aspect Ratio Conversion (16:9 Letterbox)

```bash
# Source: FFmpeg aspect ratio best practices
# https://linux.goeszen.com/converting-any-video-with-ffmpeg-letterboxingpillarboxing.html

ffmpeg -i input.mp4 \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
  -c:v libx264 -crf 23 -preset slow \
  -c:a aac -b:a 128k \
  output.mp4
```

### FFmpeg Thumbnail Extraction

```bash
# Source: FFmpeg thumbnail filter documentation
# https://www.mux.com/articles/extract-thumbnails-from-a-video-with-ffmpeg

# Extract best frame using thumbnail filter
ffmpeg -i video.mp4 -vf "thumbnail=300" -frames:v 1 -q:v 2 thumbnail.jpg

# Extract keyframes only
ffmpeg -i video.mp4 -vf "select='eq(pict_type,I)'" -vsync vfr -q:v 2 thumb_%03d.jpg
```

### YouTube OAuth2 Setup

```javascript
// Source: Google YouTube Data API Node.js Quickstart
// https://developers.google.com/youtube/v3/quickstart/nodejs

const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Generate auth URL (first time)
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // CRITICAL: ensures refresh_token provided
  scope: ['https://www.googleapis.com/auth/youtube.upload'],
});

// After user authorizes, exchange code for tokens
const { tokens } = await oauth2Client.getToken(authorizationCode);
oauth2Client.setCredentials(tokens);

// Save tokens.refresh_token for future use
// googleapis will automatically refresh access_token when expired
```

### Retry with Exponential Backoff

```javascript
// Source: exponential-backoff npm package
// https://www.npmjs.com/package/exponential-backoff

const { backOff } = require('exponential-backoff');

async function uploadWithRetry(uploadFunction) {
  return backOff(uploadFunction, {
    numOfAttempts: 3,
    startingDelay: 500,      // 0.5s initial delay
    timeMultiple: 2,         // Double each retry (1s, 2s, 4s)
    maxDelay: 8000,          // Cap at 8s
    retry: (error, attemptNumber) => {
      // Only retry network errors, not auth failures
      if (error.response?.status === 401 || error.response?.status === 403) {
        return false; // Don't retry auth errors
      }
      return error.code === 'ENOTFOUND' ||
             error.code === 'ETIMEDOUT' ||
             error.response?.status >= 500;
    },
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Puppeteer for browser automation | Playwright for browser automation | 2020 | Better API, built-in video, cross-browser |
| CCapture.js for p5.js recording | Native MediaRecorder API | 2018-2020 | Browser-native, no external library needed |
| Manual OAuth token refresh | googleapis auto-refresh | Always available | Eliminates manual token management code |
| FFmpeg CLI string commands | fluent-ffmpeg wrapper | Library stable since 2014 | Cleaner code, better error handling |
| H.264 Main profile | H.264 High profile | YouTube recommendation since ~2016 | Better compression at same quality |
| Fixed quality encoding | CRF (Constant Rate Factor) | FFmpeg standard since ~2010 | Consistent quality across different content types |

**Deprecated/outdated:**
- **CCapture.js**: Old library for p5.js canvas recording. Use MediaRecorder API instead.
- **Puppeteer for this use case**: Playwright has better video support and modern API.
- **Storing only access_token**: Must store refresh_token for long-term CLI tool usage.
- **Manual aspect ratio math**: Use FFmpeg's `force_original_aspect_ratio=decrease` instead of manual calculations.

## Open Questions

Things that couldn't be fully resolved:

1. **TikTok API Audit Requirement**
   - What we know: Unverified API clients can upload, but videos are private-only until audit
   - What's unclear: How long audit takes, exact requirements, whether manual publishing is alternative
   - Recommendation: Implement API, test with private uploads, document audit process as encountered

2. **Audio Sync Quality Guarantees**
   - What we know: MediaRecorder handles sync, but no frame-perfect guarantee for long captures
   - What's unclear: Acceptable drift tolerance, whether 10s captures have measurable drift
   - Recommendation: Test captures with audio-visual sync markers (metronome + visual beat), measure drift

3. **Optimal Canvas Capture Frame Rate**
   - What we know: canvas.captureStream() accepts FPS parameter, platforms typically use 24-60 FPS
   - What's unclear: Whether 30 FPS captures from 60 FPS p5.js sketch maintains visual smoothness
   - Recommendation: Start with 30 FPS (standard web), test with 60 FPS for fast animations, compare file sizes

4. **Playwright Headless Performance with Complex Atoms**
   - What we know: Hardware acceleration can be enabled with flags, WebGL/Canvas may render differently
   - What's unclear: Whether all p5.js features work correctly in headless mode (especially WebGL, shaders)
   - Recommendation: Test capture with most complex existing atoms, compare headless vs headed output

5. **Credential Storage Security Trade-offs**
   - What we know: keytar uses OS keychain (most secure), file-based storage simpler but less secure
   - What's unclear: Whether keytar native compilation causes issues on all platforms, whether file-based acceptable for personal CLI
   - Recommendation: Start with file-based (~/.eoe/credentials.json with restricted permissions), add keytar as enhancement

## Sources

### Primary (HIGH confidence)

- [Playwright Videos Documentation](https://playwright.dev/docs/videos) - Official Playwright video recording API
- [MDN MediaStream Recording API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API) - Browser canvas/audio capture
- [MDN AudioContext.createMediaStreamDestination()](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaStreamDestination) - Web Audio output capture
- [Tone.js Recorder Documentation](https://tonejs.github.io/docs/14.7.77/Recorder) - Tone.Recorder API reference
- [YouTube Data API Node.js Quickstart](https://developers.google.com/youtube/v3/quickstart/nodejs) - Official googleapis OAuth2 setup
- [YouTube Resumable Upload Protocol](https://developers.google.com/youtube/v3/guides/using_resumable_upload_protocol) - Large file upload handling
- [TikTok Content Posting API Overview](https://developers.tiktok.com/doc/content-posting-api-get-started-upload-content) - TikTok video upload flow
- [TikTok Content Posting API Reference](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post) - API endpoints and parameters

### Secondary (MEDIUM confidence)

- [FFmpeg H.264 Encoding Guide (CRF)](https://slhck.info/video/2017/02/24/crf-guide.html) - CRF quality settings explained
- [YouTube Recommended FFmpeg Settings (GitHub Gist)](https://gist.github.com/mikoim/27e4e0dc64e384adbcb91ff10a2d3678) - Community-verified encoding profiles
- [Mux: Extract Thumbnails from Video with FFmpeg](https://www.mux.com/articles/extract-thumbnails-from-a-video-with-ffmpeg) - Thumbnail filter usage
- [fluent-ffmpeg npm package](https://www.npmjs.com/package/fluent-ffmpeg) - Official package documentation
- [googleapis npm package](https://www.npmjs.com/package/googleapis) - Official Google APIs client
- [exponential-backoff npm package](https://www.npmjs.com/package/exponential-backoff) - Retry logic library
- [Cameron Nokes: Secure Storage with node-keytar](https://cameronnokes.com/blog/how-to-securely-store-sensitive-information-in-electron-with-node-keytar/) - Credential encryption patterns
- [YouTube Video Requirements 2026](https://support.google.com/youtube/answer/1722171?hl=en) - Official YouTube encoding specifications
- [How to Use FFmpeg in Node.js (Creatomate)](https://creatomate.com/blog/how-to-use-ffmpeg-in-nodejs) - FFmpeg Node.js integration patterns

### Tertiary (LOW confidence - WebSearch only, marked for validation)

- [playwright-screen-recorder GitHub](https://github.com/raymelon/playwright-screen-recorder/) - Third-party Playwright recording library (not needed for this use case)
- [TikTok Video Size Specs 2026](https://www.aiarty.com/knowledge-base/tiktok-video-size.htm) - Community-documented TikTok requirements (should verify with official API docs)
- [Node.js CLI Best Practices (DEV Community)](https://dev.to/boudydegeer/mastering-nodejs-cli-best-practices-and-tips-7j5) - General CLI patterns
- [FFmpeg Aspect Ratio Conversion (goesZen)](https://linux.goeszen.com/converting-any-video-with-ffmpeg-letterboxingpillarboxing.html) - Community tutorial on aspect ratio handling

## Implementation Risks

### HIGH Risk

**1. Audio/Video Sync Drift for Long Captures**
- **Risk:** MediaRecorder may accumulate sync drift over time, especially >30s captures
- **Mitigation:** Limit default to 10s, test with sync markers, document acceptable drift tolerance
- **Validation:** Capture 10s, 30s, 60s test videos with metronome audio + visual beats, measure offset

**2. TikTok API Private-Only Restriction**
- **Risk:** Videos uploaded via unverified API are private-only until audit approval
- **Mitigation:** Document limitation clearly, provide manual upload alternative, pursue audit if needed
- **Validation:** Test upload with dev account, verify privacy restriction, document workaround

### MEDIUM Risk

**3. Headless Canvas Rendering Differences**
- **Risk:** Some p5.js features (WebGL, shaders, filters) may render incorrectly in headless browser
- **Mitigation:** Test with complex atoms, compare headless vs headed output, document incompatibilities
- **Validation:** Capture 5-10 diverse atoms, visual comparison of outputs

**4. Platform Upload Size/Duration Limits**
- **Risk:** Encoded videos exceed TikTok size limits (72-287 MB depending on platform)
- **Mitigation:** Monitor file sizes during encoding, adjust CRF for smaller files, warn user before upload
- **Validation:** Test encoding 10s, 30s, 60s videos, measure output sizes with different CRF values

**5. OAuth Token Refresh Edge Cases**
- **Risk:** googleapis auto-refresh might fail in edge cases (network timeout during refresh, revoked token)
- **Mitigation:** Wrap API calls in retry logic, catch refresh failures, prompt re-authentication
- **Validation:** Test with expired token, test with revoked token, test with network interruption during upload

### LOW Risk

**6. FFmpeg Native Dependency Installation**
- **Risk:** Users must have FFmpeg installed, or rely on ffmpeg-static (large download)
- **Mitigation:** Document installation instructions, optionally bundle ffmpeg-static, detect missing FFmpeg at runtime
- **Validation:** Test on clean system without FFmpeg, verify error message quality

**7. Cross-Platform Credential Storage**
- **Risk:** keytar requires native compilation, may fail on some platforms (ARM, older Node versions)
- **Mitigation:** Start with file-based storage (good enough for personal CLI), add keytar as optional enhancement
- **Validation:** Test file-based storage with restricted permissions (chmod 600), document security trade-offs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified with official documentation and authoritative sources
- Architecture: MEDIUM - Patterns verified, but integration not tested in this specific context
- Pitfalls: MEDIUM - Common issues documented in community sources, should test with actual atoms
- Platform APIs: MEDIUM - Official docs reviewed, but TikTok audit process unclear
- Audio sync: LOW - Browser API documented, but real-world quality guarantees unclear

**Research date:** 2026-01-30
**Valid until:** 2026-03-30 (60 days - relatively stable domain, but platform APIs may change)

---

**Next Steps for Planner:**
1. Use MediaRecorder API for capture (not Playwright video recording)
2. Use fluent-ffmpeg for all encoding/thumbnails
3. Use googleapis for YouTube (handles OAuth refresh automatically)
4. Implement TikTok API but document private-only limitation
5. Start with file-based credential storage, defer keytar to later phase
6. Build retry logic with exponential-backoff package
7. Test audio sync quality with 10s captures before extending to longer durations
