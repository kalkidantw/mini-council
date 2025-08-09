let sharedAudio: HTMLAudioElement | null = null;
let currentUrl: string | null = null;
let currentAbort: AbortController | null = null;

export async function playBase64Mp3(
  b64: string,
  opts: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<void> {
  const { timeoutMs = 2000, signal } = opts;
  if (!b64) {
    console.warn('[AUDIO] playBase64Mp3 called with empty base64');
    await new Promise((r) => setTimeout(r, timeoutMs));
    return;
  }

  if (!sharedAudio) {
    sharedAudio = new Audio();
  }

  // Abort any existing playback
  if (!signal && currentAbort) {
    try {
      currentAbort.abort();
    } catch {}
  }

  const localAbort = new AbortController();
  currentAbort = localAbort;
  if (signal) {
    signal.addEventListener('abort', () => {
      try { localAbort.abort(); } catch {}
    }, { once: true });
  }

  // Prepare src
  try {
    const byteStr = atob(b64);
    const len = byteStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = byteStr.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'audio/mpeg' });
    if (blob.type !== 'audio/mpeg') {
      console.warn('[AUDIO] Blob type is not audio/mpeg:', blob.type);
    }
    if (currentUrl) URL.revokeObjectURL(currentUrl);
    currentUrl = URL.createObjectURL(blob);
    sharedAudio.src = currentUrl;
  } catch (err) {
    console.error('[AUDIO] Failed to decode base64 mp3', err);
    await new Promise((r) => setTimeout(r, timeoutMs));
    return;
  }

  return new Promise<void>((resolve) => {
    let finished = false;
    const cleanup = () => {
      if (!finished) {
        finished = true;
        // do not revoke currentUrl immediately; it is current src
        // cleanup will occur when next play sets a new URL.
      }
    };

    const onEnded = () => {
      cleanup();
      sharedAudio?.removeEventListener('ended', onEnded);
      sharedAudio?.removeEventListener('error', onError);
      resolve();
    };
    const onError = (e: any) => {
      console.error('[AUDIO] Playback error', e);
      cleanup();
      sharedAudio?.removeEventListener('ended', onEnded);
      sharedAudio?.removeEventListener('error', onError);
      resolve();
    };

    const onAbort = () => {
      if (sharedAudio) {
        try { sharedAudio.pause(); } catch {}
      }
      console.log('[ABORT] previous audio cancelled');
      cleanup();
      sharedAudio?.removeEventListener('ended', onEnded);
      sharedAudio?.removeEventListener('error', onError);
      resolve();
    };

    sharedAudio!.addEventListener('ended', onEnded);
    sharedAudio!.addEventListener('error', onError);
    localAbort.signal.addEventListener('abort', onAbort, { once: true });

    // Timeout fallback
    const timeout = setTimeout(() => {
      console.warn('[WARN] audio timeout (silent)');
      onAbort();
    }, timeoutMs);

    sharedAudio!.play().then(() => {
      // success path; ended handler will resolve
      clearTimeout(timeout);
    }).catch((err) => {
      clearTimeout(timeout);
      if (err && (err.name === 'NotAllowedError' || err.name === 'AbortError')) {
        // Let caller handle unlock/abort. Resolve to allow pipeline to proceed.
        console.warn('[AUDIO] play() blocked or aborted', err.name);
        onAbort();
      } else {
        onError(err);
      }
    });
  });
}

export function abortCurrentAudio() {
  if (currentAbort) {
    try { currentAbort.abort(); } catch {}
  }
} 