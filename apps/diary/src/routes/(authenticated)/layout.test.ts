import { createDb } from '$lib/db.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock $env/dynamic/private before importing the handler. Mutable so tests
// can toggle DEMO_MODE (truthy = redirect to /welcome demo landing).
vi.mock('$env/dynamic/private', () => ({
  env: {} as Record<string, string | undefined>,
}));

const env = (await import('$env/dynamic/private')).env as Record<string, string | undefined>;
const { load } = await import('./+layout.server.js');

beforeEach(() => {
  env.DEMO_MODE = undefined;
});

describe('(authenticated) layout load', () => {
  it('redirects unauthenticated visitors to /login by default', async () => {
    const db = createDb(':memory:');
    await expect(load({ locals: { db, user: undefined } } as any)).rejects.toMatchObject({
      location: '/login',
      status: 302,
    });
  });

  it('redirects to /welcome when DEMO_MODE=true', async () => {
    env.DEMO_MODE = 'true';
    const db = createDb(':memory:');
    await expect(load({ locals: { db, user: undefined } } as any)).rejects.toMatchObject({
      location: '/welcome',
      status: 302,
    });
  });

  it('returns the user when authenticated', async () => {
    const db = createDb(':memory:');
    const user = { id: 1, username: 'Iona', cover_id: 'meadow' };
    const result = await load({ locals: { db, user } } as any);
    expect(result).toEqual({ user });
  });
});
