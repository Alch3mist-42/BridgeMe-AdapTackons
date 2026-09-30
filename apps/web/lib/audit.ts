import { prisma, type Prisma } from "@ob/db";

/** Append-only audit trail. Throws on failure on purpose. */
export async function logAudit(entry: {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  meta?: Prisma.InputJsonValue;
}) {
  return prisma.auditLog.create({
    data: {
      actorId: entry.actorId ?? null,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      meta: entry.meta,
    },
  });
}
