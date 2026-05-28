import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock $env/dynamic/private before importing the handler.
vi.mock('$env/dynamic/private', () => ({
  env: {
    TTS_URL: 'http://kokoro.test/dev/captioned_speech',
    TTS_VOICES_URL: 'http://kokoro.test/v1/audio/voices',
    TTS_API_KEY: '',
  },
}));

const { GET } = await import('./+server.js');

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeAuthedEvent() {
  return {
    request: new Request('http://localhost/api/speak/voices'),
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
  } as Parameters<typeof GET>[0];
}

function makeUnauthEvent() {
  return {
    request: new Request('http://localhost/api/speak/voices'),
    locals: {},
  } as Parameters<typeof GET>[0];
}

const originalFetch = globalThis.fetch;

describe('GET /api/speak/voices', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns 401 for unauthenticated requests', async () => {
    await expect(GET(makeUnauthEvent())).rejects.toMatchObject({ status: 401 });
  });

  it('returns the upstream voice list when available', async () => {
    const upstreamPayload = {
      voices: [
        { id: 'af_bella', name: 'af_bella' },
        { id: 'am_echo', name: 'am_echo' },
      ],
    };
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(JSON.stringify(upstreamPayload), { status: 200 })
    );

    const response = await GET(makeAuthedEvent());
    const body = await response.json();
    expect(body.voices).toHaveLength(2);
    expect(body.voices[0].id).toBe('af_bella');
  });

  it('returns { voices: [] } (not an error) when upstream is unreachable', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new TypeError('fetch failed')
    );

    const response = await GET(makeAuthedEvent());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ voices: [] });
  });

  it('returns { voices: [] } (not an error) when upstream returns non-2xx', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response('error', { status: 503 })
    );

    const response = await GET(makeAuthedEvent());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ voices: [] });
  });
});
