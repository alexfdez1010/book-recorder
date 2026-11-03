'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { isAuthenticated } from './session';

/** Disconnects an OAuth client atomically, immediately rejecting its access tokens and removing refresh grants. */
export async function disconnectClient(formData: FormData): Promise<void> {
  if (!(await isAuthenticated())) throw new Error('Unauthorized');
  const clientId = String(formData.get('clientId') ?? '');
  if (!clientId) throw new Error('Client ID is required');
  await prisma.$transaction([
    prisma.oauthClient.update({
      where: { clientId },
      data: { disabled: true },
    }),
    prisma.oauthConsent.deleteMany({ where: { clientId } }),
    prisma.oauthRefreshToken.deleteMany({ where: { clientId } }),
    prisma.oauthAccessToken.deleteMany({ where: { clientId } }),
  ]);
  revalidatePath('/skill');
}
