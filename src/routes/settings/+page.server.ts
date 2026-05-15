import { COVERS } from '$lib/covers.js';
import { updateUserCoverId } from '$lib/db.js';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, '/login');
  return {
    coverId: locals.user.cover_id,
    username: locals.user.username,
    covers: COVERS,
  };
};

export const actions: Actions = {
  select: async ({ request, locals }) => {
    if (!locals.user) redirect(302, '/login');
    const data = await request.formData();
    const coverId = data.get('cover_id')?.toString() ?? '';
    if (!COVERS.find((c) => c.id === coverId)) return fail(400, { error: 'Invalid cover' });
    updateUserCoverId(locals.db, locals.user.id, coverId);
    redirect(302, '/');
  },
};
