import { defineConfig } from 'drizzle-kit';

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://axiom:axiom@localhost:5432/axiom';

export default defineConfig({
  dbCredentials: {
    url: DATABASE_URL,
  },
  dialect: 'postgresql',
  out: './drizzle',
  schema: './src/lib/db/schema.ts',
  strict: true,
  verbose: true,
});
