import { redis } from '../../redis';

export const authPermissionsReleased = async (data: any) => {
  try {
    const payload = data['log'] as Record<string, string[]> | undefined;
    if (!payload) return;

    const multi = redis.multi();
    Object.entries(payload).map(([role, permissions]) => {
      multi.set(`perms:${role}`, JSON.stringify(permissions));
    });
    await multi.exec();
  } catch (err) {
    console.error('[Consumer] failed to save released permissions', err);
  }
};
