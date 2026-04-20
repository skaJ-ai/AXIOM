import 'server-only';

import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';

import { getDb } from '@/lib/db';
import { usersTable, workspacesTable } from '@/lib/db/schema';

type NodePostgresMigratorModule = typeof import('drizzle-orm/node-postgres/migrator');

let bootstrapPromise: Promise<void> | null = null;
let bootstrapRetryTimeout: NodeJS.Timeout | null = null;
let hasCompletedBootstrap = false;
let bootstrapRetryCount = 0;

const BOOTSTRAP_RETRY_DELAY_MS = 3000;

function getRuntimeRequire(): NodeJS.Require {
  return eval('require') as NodeJS.Require;
}

function getNodePostgresMigratorModule(): NodePostgresMigratorModule {
  return getRuntimeRequire()('drizzle-orm/node-postgres/migrator') as NodePostgresMigratorModule;
}

async function ensureAdminAccount(): Promise<void> {
  const adminLoginId = process.env.ADMIN_LOGIN_ID;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminLoginId || !adminPassword) {
    return;
  }

  const database = getDb();
  const existingAdminAccounts = await database
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.role, 'admin'))
    .limit(1);

  if (existingAdminAccounts.length > 0) {
    return;
  }

  const passwordHash = await hash(adminPassword, 12);
  const createdAdmins = await database
    .insert(usersTable)
    .values({
      employeeNumber: `admin-${adminLoginId}`,
      knoxId: `admin-${adminLoginId}`,
      loginId: adminLoginId,
      name: 'Administrator',
      passwordHash,
      role: 'admin',
    })
    .returning({ id: usersTable.id });

  const createdAdmin = createdAdmins[0];

  if (!createdAdmin) {
    throw new Error('Failed to create administrator account.');
  }

  await database.insert(workspacesTable).values({
    name: 'Administrator Workspace',
    ownerId: createdAdmin.id,
  });
}

async function runApplicationBootstrap(): Promise<void> {
  if (!process.env.DATABASE_URL || hasCompletedBootstrap) {
    return;
  }

  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      try {
        const database = getDb();
        const { migrate } = getNodePostgresMigratorModule();

        await migrate(database, { migrationsFolder: './drizzle' });
        await ensureAdminAccount();
        hasCompletedBootstrap = true;
        bootstrapRetryCount = 0;
      } catch (error) {
        bootstrapPromise = null;
        throw error;
      }
    })();
  }

  await bootstrapPromise;
}

function scheduleApplicationBootstrap(): void {
  if (!process.env.DATABASE_URL || hasCompletedBootstrap || bootstrapPromise || bootstrapRetryTimeout) {
    return;
  }

  void runApplicationBootstrap().catch((error) => {
    bootstrapRetryCount += 1;

    console.error(
      `Application bootstrap failed (attempt ${bootstrapRetryCount}). Retrying in ${BOOTSTRAP_RETRY_DELAY_MS}ms.`,
      error,
    );

    bootstrapRetryTimeout = setTimeout(() => {
      bootstrapRetryTimeout = null;
      scheduleApplicationBootstrap();
    }, BOOTSTRAP_RETRY_DELAY_MS);
  });
}

export { runApplicationBootstrap, scheduleApplicationBootstrap };
