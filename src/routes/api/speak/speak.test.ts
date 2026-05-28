import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock $env/dynamic/private before importing the handler.
vi.mock('$env/dynamic/private', () => ({
  env: {
    TTS_URL: 'http://kokoro.test/dev/captioned_speech',
    TTS_VOICES_URL: 'http://kokoro.test/v1/audio/voices',
    TTS_API_KEY: '',
  },
}));

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
});
