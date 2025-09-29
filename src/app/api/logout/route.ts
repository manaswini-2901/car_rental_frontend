import { redirect } from 'next/navigation';
import { API_BASE } from '../../../config';

export async function GET() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    });
  } catch (e) {
    console.error('Logout failed', e);
  }
  redirect('/login'); // go to login, not cars
}
