import 'server-only';

import { sql } from 'drizzle-orm';

import * as schema from './schema';

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

interface DatabaseHealth {
  isHealthy: boolean;
  message: string;
}

type DatabaseClient = NodePgDatabase<typeof schema>;
type DatabasePool = import('pg').Pool;
type NodePostgresModule = typeof import('drizzle-orm/node-postgres');
type PgModule = typeof import('pg');

let databaseClient: DatabaseClient | null = null;
let databasePool: DatabasePool | null = null;

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured.');
  }

  return databaseUrl;
}

function getRuntimeRequire(): NodeJS.Require {
  return eval('require') as NodeJS.Require;
}

function getPgModule(): PgModule {
  return getRuntimeRequire()('pg') as PgModule;
}

function getNodePostgresModule(): NodePostgresModule {
  return getRuntimeRequire()('drizzle-orm/node-postgres') as NodePostgresModule;
}

function getPool(): DatabasePool {
  if (databasePool) {
    return databasePool;
  }

  const { Pool } = getPgModule();

  databasePool = new Pool({
    connectionString: getDatabaseUrl(),
  });

  return databasePool;
}

function getDb(): DatabaseClient {
  if (databaseClient) {
    return databaseClient;
  }

  const { drizzle } = getNodePostgresModule();
  databaseClient = drizzle(getPool(), { schema });

  return databaseClient;
}

async function checkDatabaseConnection(): Promise<DatabaseHealth> {
  try {
    await getDb().execute(sql`select 1`);

    return {
      isHealthy: true,
      message: 'Database connection is healthy.',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';

    return {
      isHealthy: false,
      message,
    };
  }
}

export { checkDatabaseConnection, getDb, getPool };
