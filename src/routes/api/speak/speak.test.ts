import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock $env/dynamic/private before importing the handler. The object is mutable
// so individual tests can toggle config (e.g. unset TTS_URL, configure Docker).
vi.mock('$env/dynamic/private', () => ({
  env: {
    TTS_URL: 'http://kokoro.test/dev/captioned_speech',
    TTS_VOICES_URL: 'http://kokoro.test/v1/audio/voices',
    TTS_API_KEY: '',
  } as Record<string, string | undefined>,
}));

const env = (await import('$env/dynamic/private')).env as Record<string, string | undefined>;
const { POST } = await import('./+server.js');

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeAuthedEvent(body: unknown) {
  return {
    request: new Request('http://localhost/api/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    locals: {
      user: {
        id: 1,
        username: 'Iona',
        cover_id: 'meadow',
        font_size: 3.4,
        journal_font: 'eb-garamond',
        diary_title: 'Diary',
      },
    },
  } as Parameters<typeof POST>[0];
}

function makeUnauthEvent(body: unknown) {
  return {
    request: new Request('http://localhost/api/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    locals: {},
  } as Parameters<typeof POST>[0];
}

/** Minimal valid upstream response from /dev/captioned_speech. */
function makeCaptionedSpeechResponse() {
  return {
    audio: btoa('fake-mp3-bytes'),
    audio_format: 'mp3',
    timestamps: [
      { word: 'Hello', start_time: 0.0, end_time: 0.3 },
      { word: 'world', start_time: 0.3, end_time: 0.6 },
    ],
  };
}

const originalFetch = globalThis.fetch;

describe('POST /api/speak', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns 401 for unauthenticated requests', async () => {
    await expect(
      POST(makeUnauthEvent({ text: 'hello', voice: 'af_bella', speed: 1.0 }))
    ).rejects.toMatchObject({ status: 401 });
  });

  it('returns 400 when text is missing', async () => {
    await expect(POST(makeAuthedEvent({ voice: 'af_bella', speed: 1.0 }))).rejects.toMatchObject({
      status: 400,
    });
  });

  it('returns 400 when voice is missing', async () => {
    await expect(POST(makeAuthedEvent({ text: 'hello', speed: 1.0 }))).rejects.toMatchObject({
      status: 400,
    });
  });

  it('returns normalised JSON on success', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify(makeCaptionedSpeechResponse()), { status: 200 })
    );

    const response = await POST(
      makeAuthedEvent({ text: 'Hello world', voice: 'af_bella', speed: 1.0 })
    );
    const body = await response.json();

    expect(body.audio).toBe(btoa('fake-mp3-bytes'));
    expect(body.format).toBe('audio/mpeg');
    expect(Array.isArray(body.words)).toBe(true);
    expect(body.words).toHaveLength(2);
    expect(body.words[0]).toMatchObject({
      word: 'Hello',
      start: 0.0,
      end: 0.3,
      char_start: 0,
      char_end: 5,
    });
    expect(body.words[1]).toMatchObject({
      word: 'world',
      start: 0.3,
      end: 0.6,
      char_start: 6,
      char_end: 11,
    });
  });

  it('returns 502 when upstream responds with non-2xx', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response('upstream error', { status: 500 })
    );

    await expect(
      POST(makeAuthedEvent({ text: 'hello', voice: 'af_bella', speed: 1.0 }))
    ).rejects.toMatchObject({ status: 502 });
  });

  it('returns 503 when upstream is unreachable', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new TypeError('fetch failed')
    );

    await expect(
      POST(makeAuthedEvent({ text: 'hello', voice: 'af_bella', speed: 1.0 }))
    ).rejects.toMatchObject({ status: 503 });
  });

  it('returns 502 when upstream returns non-JSON', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response('not json', { status: 200 })
    );

    await expect(
      POST(makeAuthedEvent({ text: 'hello', voice: 'af_bella', speed: 1.0 }))
    ).rejects.toMatchObject({ status: 502 });
  });

  it('hits the captioned_speech endpoint, not /v1/audio/speech', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify(makeCaptionedSpeechResponse()), { status: 200 })
    );

    await POST(makeAuthedEvent({ text: 'Hello world', voice: 'af_bella', speed: 1.0 }));
    const calledUrl = String((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]);
    expect(calledUrl).toContain('captioned_speech');
  });

  it('maps audio_format mp3 to audio/mpeg MIME type', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify({ ...makeCaptionedSpeechResponse(), audio_format: 'mp3' }), {
        status: 200,
      })
    );

    const response = await POST(makeAuthedEvent({ text: 'hello', voice: 'af_bella', speed: 1.0 }));
    const body = await response.json();
    expect(body.format).toBe('audio/mpeg');
  });

  it('maps audio_format wav to audio/wav MIME type', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify({ ...makeCaptionedSpeechResponse(), audio_format: 'wav' }), {
        status: 200,
      })
    );

    const response = await POST(makeAuthedEvent({ text: 'hello', voice: 'af_bella', speed: 1.0 }));
    const body = await response.json();
    expect(body.format).toBe('audio/wav');
  });

  it('sends stream=false and return_timestamps=true to upstream', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify(makeCaptionedSpeechResponse()), { status: 200 })
    );

    await POST(makeAuthedEvent({ text: 'hello', voice: 'af_bella', speed: 1.0 }));
    const callArgs = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const sentBody = JSON.parse(callArgs[1].body as string);
    expect(sentBody.stream).toBe(false);
    expect(sentBody.return_timestamps).toBe(true);
  });

  it('returns 503 when TTS_URL is not configured', async () => {
    const saved = env.TTS_URL;
    env.TTS_URL = '';
    try {
      await expect(
        POST(makeAuthedEvent({ text: 'hello', voice: 'af_bella', speed: 1.0 }))
      ).rejects.toMatchObject({ status: 503 });
    } finally {
      env.TTS_URL = saved;
    }
  });

  it('returns 502 when upstream JSON is missing required fields', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify({ audio: 'x' }), { status: 200 })
    );

    await expect(
      POST(makeAuthedEvent({ text: 'hello', voice: 'af_bella', speed: 1.0 }))
    ).rejects.toMatchObject({ status: 502 });
  });

  it.each([
    ['opus', 'audio/opus'],
    ['flac', 'audio/flac'],
    ['pcm', 'audio/L16; rate=24000'],
    ['ogg', 'audio/mpeg'], // unknown → default
  ])('maps audio_format %s to %s', async (fmt, mime) => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify({ ...makeCaptionedSpeechResponse(), audio_format: fmt }), {
        status: 200,
      })
    );

    const response = await POST(makeAuthedEvent({ text: 'hello', voice: 'af_bella', speed: 1.0 }));
    const body = await response.json();
    expect(body.format).toBe(mime);
  });

  it('emits cursor-based offsets for a word not present in the source text', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          audio: btoa('x'),
          audio_format: 'mp3',
          timestamps: [{ word: 'zzz', start_time: 0, end_time: 0.1 }],
        }),
        { status: 200 }
      )
    );

    const response = await POST(
      makeAuthedEvent({ text: 'Hello world', voice: 'af_bella', speed: 1 })
    );
    const body = await response.json();
    // 'zzz' is not in 'Hello world', so char offsets collapse to the cursor (0).
    expect(body.words[0]).toMatchObject({ word: 'zzz', char_start: 0, char_end: 0 });
  });
});

// ── On-demand Kokoro lifecycle (DOCKER_API_URL configured) ─────────────────────
//
// These tests configure the Docker remote API so ensureKokoroRunning() and the
// idle-shutdown timer become active, then drive the fake-timer clock.

describe('POST /api/speak — on-demand Kokoro', () => {
  const dockerUrl = 'http://docker.test:2376';
  const containerName = 'svc-kokoro';

  beforeEach(() => {
    globalThis.fetch = vi.fn();
    env.DOCKER_API_URL = dockerUrl;
    env.KOKORO_CONTAINER_NAME = containerName;
    env.KOKORO_IDLE_MINUTES = '5';
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    globalThis.fetch = originalFetch;
    env.DOCKER_API_URL = undefined;
    env.KOKORO_CONTAINER_NAME = undefined;
    env.KOKORO_IDLE_MINUTES = undefined;
  });

  function speakResponse() {
    return new Response(JSON.stringify(makeCaptionedSpeechResponse()), { status: 200 });
  }

  it('skips startup when the container is already running', async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ State: { Running: true } }), { status: 200 })
      )
      .mockResolvedValueOnce(speakResponse());

    await POST(makeAuthedEvent({ text: 'Hello world', voice: 'af_bella', speed: 1 }));

    // First call: state probe. Second call: TTS. No /start.
    expect(String(fetchMock.mock.calls[0][0])).toContain(`/containers/${containerName}/json`);
    expect(fetchMock.mock.calls.some((c) => String(c[0]).endsWith('/start'))).toBe(false);
  });

  it('starts a stopped container and polls voices until ready', async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ State: { Running: false } }), { status: 200 })
      ) // state
      .mockResolvedValueOnce(new Response(null, { status: 204 })) // start
      .mockResolvedValueOnce(new Response('[]', { status: 200 })) // voices readiness poll
      .mockResolvedValueOnce(speakResponse()); // TTS

    const p = POST(makeAuthedEvent({ text: 'Hello world', voice: 'af_bella', speed: 1 }));
    await vi.advanceTimersByTimeAsync(2000); // drive the readiness sleep
    const response = await p;
    const body = await response.json();

    expect(body.words).toHaveLength(2);
    expect(fetchMock.mock.calls.some((c) => String(c[0]).endsWith('/start'))).toBe(true);
  });

  it('continues when the Docker API is unreachable on the state probe', async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    fetchMock
      .mockRejectedValueOnce(new TypeError('docker down')) // state probe throws → return early
      .mockResolvedValueOnce(speakResponse()); // TTS still attempted

    const response = await POST(
      makeAuthedEvent({ text: 'Hello world', voice: 'af_bella', speed: 1 })
    );
    expect(response.status).toBe(200);
  });

  it('continues when starting the container fails', async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ State: { Running: false } }), { status: 200 })
      ) // state
      .mockRejectedValueOnce(new TypeError('start failed')) // start throws → return
      .mockResolvedValueOnce(speakResponse()); // TTS

    const response = await POST(
      makeAuthedEvent({ text: 'Hello world', voice: 'af_bella', speed: 1 })
    );
    expect(response.status).toBe(200);
  });

  it('stops the container after the idle timeout elapses', async () => {
    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ State: { Running: true } }), { status: 200 })
      ) // state
      .mockResolvedValueOnce(speakResponse()) // TTS — resets idle timer
      .mockResolvedValueOnce(new Response(null, { status: 204 })); // stop

    await POST(makeAuthedEvent({ text: 'Hello world', voice: 'af_bella', speed: 1 }));
    await vi.advanceTimersByTimeAsync(5 * 60_000); // KOKORO_IDLE_MINUTES

    expect(fetchMock.mock.calls.some((c) => String(c[0]).endsWith('/stop'))).toBe(true);
  });
});
