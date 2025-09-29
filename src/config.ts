export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, '') || 'http://localhost:4000';

// In case you ever run backend on a different host/port, just change NEXT_PUBLIC_API_BASE
// in a .env.local file and restart:  NEXT_PUBLIC_API_BASE=http://localhost:4000
