import { type Database, createDb, createUser, getUserByUsername } from '$lib/db.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { actions, load } from './+page.server.js';

function freshDb(): Database {
  return createDb(':memory:');
}

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

describe('load', () => {
  it('returns user list', async () => {
    const db = freshDb();
    createUser(db, 'Iona', 'hash');
    const result = (await load({ locals: { db } } as any)) as {
      users: { id: number; username: string }[];
    };
    expect(result.users).toHaveLength(1);
    expect(result.users[0].username).toBe('Iona');
  });

  it('returns empty list when no users', async () => {
    const result = (await load({ locals: { db: freshDb() } } as any)) as {
      users: { id: number; username: string }[];
    };
    expect(result.users).toEqual([]);
  });
});

describe('actions.default', () => {
  let db: Database;

  beforeEach(() => {
    db = freshDb();
  });

  it('returns 400 for missing username', async () => {
    const result = await actions.default({
      request: { formData: async () => makeFormData({ pin: '1234' }) },
      locals: { db },
    } as any);
    expect(result?.status).toBe(400);
  });

  it('returns 400 for non-4-digit PIN', async () => {
    const result = await actions.default({
      request: { formData: async () => makeFormData({ username: 'Iona', pin: '12' }) },
      locals: { db },
    } as any);
    expect(result?.status).toBe(400);
  });

  it('returns 400 for non-numeric PIN', async () => {
    const result = await actions.default({
      request: { formData: async () => makeFormData({ username: 'Iona', pin: 'abcd' }) },
      locals: { db },
    } as any);
    expect(result?.status).toBe(400);
  });

  it('creates user and returns success', async () => {
    const result = await actions.default({
      request: { formData: async () => makeFormData({ username: 'Iona', pin: '1234' }) },
      locals: { db },
    } as any);
    expect(result).toMatchObject({ success: true });
    expect(getUserByUsername(db, 'Iona')).toBeDefined();
  });

  it('returns 400 for duplicate username', async () => {
    createUser(db, 'Iona', 'hash');
    const result = await actions.default({
      request: { formData: async () => makeFormData({ username: 'Iona', pin: '1234' }) },
      locals: { db },
    } as any);
    expect(result?.status).toBe(400);
  });

  it('trims whitespace from username', async () => {
    await actions.default({
      request: { formData: async () => makeFormData({ username: '  Rosie  ', pin: '5678' }) },
      locals: { db },
    } as any);
    expect(getUserByUsername(db, 'Rosie')).toBeDefined();
  });
});
