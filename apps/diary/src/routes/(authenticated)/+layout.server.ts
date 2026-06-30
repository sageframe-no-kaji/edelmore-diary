import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) {
    const demoMode = env.DEMO_MODE === 'true' || env.DEMO_MODE === '1';
    redirect(302, demoMode ? '/welcome' : '/login');
  }
  return { user: locals.user };
};
