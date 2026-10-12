import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local if it exists
const envPath = join(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  config({ path: envPath });
}

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_APP_NAME',
];

const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error('❌ Missing env(s):', missing.join(', '));
  process.exit(1);
} else {
  console.log('✅ Env check passed');
}
