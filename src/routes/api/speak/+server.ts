import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * POST /api/speak
 *
 * Thin shim that forwards a TTS request to the upstream Kokoro-FastAPI
 * `/dev/captioned_speech` endpoint and returns normalised JSON.
 *
 * The browser sends:
 *   { text: string; voice: string; speed: number }
 *
 * This endpoint returns:
 *   { audio: string (base64); format: string (MIME); words: WordTiming[] }
 *
 * Where WordTiming is:
 *   { word: string; start: number; end: number; char_start: number; char_end: number }
 *
 * The upstream returns word timestamps without character offsets; this shim
 * computes char_start / char_end by scanning the input string left-to-right
 * (see computeCharOffsets). See ho-process/notes/kokoro-service-contract.md
 * for the full upstream contract.
 *
 * Env vars:
 *   TTS_URL      — full URL to the upstream /dev/captioned_speech endpoint
 *   TTS_API_KEY  — optional; sent as Authorization: Bearer if set
 *
 * Logging: failure modes only. Diary text, audio bytes, and word timings are
 * never logged.
 */

// ── Upstream types (raw from Kokoro-FastAPI) ─────────────────────────────────

interface UpstreamWord {
  word: string;
  start_time: number;
  end_time: number;
}

interface UpstreamPayload {
  audio: string; // base64-encoded audio
  audio_format: string; // file extension: "mp3", "wav", etc.
  timestamps: UpstreamWord[];
}

// ── Normalised types (returned to the browser) ───────────────────────────────

interface WordTiming {
  word: string;
  start: number;
  end: number;
  char_start: number;
  char_end: number;
}

interface SpeakResponse {
  audio: string; // base64
  format: string; // MIME type
  words: WordTiming[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Map Kokoro's file-extension audio_format to an HTMLAudioElement-friendly MIME type. */
function formatToMime(fmt: string): string {
  switch (fmt.toLowerCase()) {
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'opus':
      return 'audio/opus';
    case 'flac':
      return 'audio/flac';
    case 'pcm':
      return 'audio/L16; rate=24000';
    default:
      return 'audio/mpeg';
  }
}

/**
 * Compute char_start / char_end for each upstream word by scanning the
 * original input string left-to-right. Punctuation tokens like "." and ","
 * are treated exactly like regular words — indexOf finds them fine.
 *
 * When a word can't be found verbatim (e.g. normalised by TTS), char_start
 * and char_end are both set to the current cursor position so the downstream
 * consumer can treat them as "no new offset" — the previous highlight simply
 * holds until the next word that does match.
 */
function computeCharOffsets(input: string, words: UpstreamWord[]): WordTiming[] {
  let cursor = 0;
  return words.map((w) => {
    const idx = input.indexOf(w.word, cursor);
    if (idx === -1) {
      // Defensive: upstream's tokenised form doesn't appear verbatim in input.
      return {
        word: w.word,
        start: w.start_time,
        end: w.end_time,
        char_start: cursor,
        char_end: cursor,
      };
    }
    const charEnd = idx + w.word.length;
    cursor = charEnd;
    return {
      word: w.word,
      start: w.start_time,
      end: w.end_time,
      char_start: idx,
      char_end: charEnd,
    };
  });
}

// ── Request handler ───────────────────────────────────────────────────────────

interface SpeakRequest {
  text: string;
  voice: string;
  speed: number;
}

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) throw error(401, 'Unauthorized');

  const ttsUrl = env.TTS_URL;
  if (!ttsUrl) throw error(503, 'TTS not configured');

  const body = (await request.json()) as SpeakRequest;
  if (!body?.text || typeof body.text !== 'string') throw error(400, 'Missing text');
  if (!body.voice || typeof body.voice !== 'string') throw error(400, 'Missing voice');

  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const apiKey = env.TTS_API_KEY;
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  // Per kokoro-service-contract.md: use /dev/captioned_speech with stream=false.
  // response_format=mp3 is the default; return_timestamps ensures we always
  // get the timestamps array even if the upstream default changes.
  const upstreamBody = {
    model: 'kokoro',
    voice: body.voice,
    input: body.text,
    response_format: 'mp3',
    speed: body.speed ?? 1.0,
    stream: false,
    return_timestamps: true,
  };

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(ttsUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(upstreamBody),
    });
  } catch (e) {
    console.error('TTS upstream unreachable:', e instanceof Error ? e.message : e);
    throw error(503, 'TTS service unreachable');
  }

  if (!upstreamResponse.ok) {
    console.error('TTS upstream error:', upstreamResponse.status, upstreamResponse.statusText);
    throw error(502, 'TTS failed');
  }

  let raw: unknown;
  try {
    raw = await upstreamResponse.json();
  } catch (e) {
    console.error('TTS upstream returned non-JSON:', e instanceof Error ? e.message : e);
    throw error(502, 'TTS returned unexpected response');
  }

  // Validate that the upstream payload has the expected shape before normalising.
  if (
    !raw ||
    typeof raw !== 'object' ||
    typeof (raw as Record<string, unknown>).audio !== 'string' ||
    !Array.isArray((raw as Record<string, unknown>).timestamps)
  ) {
    console.error('TTS upstream payload missing required fields');
    throw error(502, 'TTS returned unexpected response');
  }

  const upstream = raw as UpstreamPayload;

  // Normalise: rename fields and compute character offsets.
  const responsePayload: SpeakResponse = {
    audio: upstream.audio,
    format: formatToMime(upstream.audio_format ?? 'mp3'),
    words: computeCharOffsets(body.text, upstream.timestamps),
  };

  return new Response(JSON.stringify(responsePayload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
