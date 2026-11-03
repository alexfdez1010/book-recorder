import { config } from 'dotenv';
import { hashPassword } from 'better-auth/crypto';
import { PrismaClient } from '../generated/prisma';

config({ path: process.env.AUTH_ENV_FILE ?? '.env', quiet: true });

/** Provisions the sole owner atomically; reruns preserve the existing hash and reject a different identity. */
async function main() {
  const email = process.env.AUTH_OWNER_EMAIL?.trim().toLowerCase();
  const password = process.env.AUTH_OWNER_PASSWORD;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error('AUTH_OWNER_EMAIL is required');
  const prisma = new PrismaClient();
  try {
    const existing = await prisma.user.findFirst();
    if (existing) {
      if (existing.email !== email)
        throw new Error('A different owner already exists');
      console.log('Owner already provisioned; credentials unchanged');
      return;
    }
    if (!password || password.length < 8 || password.length > 128)
      throw new Error('Owner password must contain 8–128 characters');
    const id = crypto.randomUUID();
    const hashed = await hashPassword(password);
    await prisma.user.create({
      data: {
        id,
        email,
        name: 'Alejandro',
        emailVerified: false,
        accounts: {
          create: {
            id: crypto.randomUUID(),
            accountId: id,
            providerId: 'credential',
            password: hashed,
          },
        },
      },
    });
    console.log('Owner provisioned with a hashed password');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(() => {
  console.error(
    'Owner provisioning failed; check identity, password policy and database access',
  );
  process.exitCode = 1;
});
