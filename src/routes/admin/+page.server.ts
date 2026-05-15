import { hashPin } from '$lib/auth.js';
import { createUser, listUsers } from '$lib/db.js';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  return { users: listUsers(locals.db) };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();
    const username = data.get('username');
    const pin = data.get('pin');

    if (
      typeof username !== 'string' ||
      username.trim().length === 0 ||
      typeof pin !== 'string' ||
      !/^\d{4}$/.test(pin)
    ) {
      return fail(400, { error: 'Username required and PIN must be 4 digits' });
    }

    try {
      const pinHash = await hashPin(pin);
      createUser(locals.db, username.trim(), pinHash);
    } catch {
      return fail(400, { error: 'Username already taken' });
    }

    return { success: true };
  },
};
