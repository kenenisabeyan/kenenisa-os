import { prisma } from '../../../lib/prisma.js';
import { MemoryCategory, Prisma } from '@prisma/client';
import { UserMemoryDto, CreateUserMemoryInput, UpdateUserMemoryInput } from '@kenenisa-os/shared';
import { NotFoundError, ForbiddenError } from '../../../utils/errors.js';

export class MemoryService {
  private formatMemory(mem: Prisma.UserMemoryGetPayload<Record<string, never>>): UserMemoryDto {
    return {
      id: mem.id,
      userId: mem.userId,
      key: mem.key,
      value: mem.value,
      category: mem.category,
      source: mem.source,
      confidence: mem.confidence,
      createdAt: mem.createdAt.toISOString(),
      updatedAt: mem.updatedAt.toISOString(),
      archivedAt: mem.archivedAt ? mem.archivedAt.toISOString() : null,
    };
  }

  async listUserMemories(
    userId: string,
    category?: MemoryCategory,
    includeArchived = false
  ): Promise<UserMemoryDto[]> {
    const where: Prisma.UserMemoryWhereInput = {
      userId,
      archivedAt: includeArchived ? undefined : null,
    };
    if (category) where.category = category;

    const memories = await prisma.userMemory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return memories.map((m) => this.formatMemory(m));
  }

  async createUserMemory(userId: string, input: CreateUserMemoryInput): Promise<UserMemoryDto> {
    const memory = await prisma.userMemory.upsert({
      where: { userId_key: { userId, key: input.key } },
      update: {
        value: input.value,
        category: input.category || 'OTHER',
        source: input.source || 'USER_CONFIRMED',
        confidence: input.confidence ?? 1.0,
        archivedAt: null,
      },
      create: {
        userId,
        key: input.key,
        value: input.value,
        category: input.category || 'OTHER',
        source: input.source || 'USER_CONFIRMED',
        confidence: input.confidence ?? 1.0,
      },
    });

    return this.formatMemory(memory);
  }

  async updateUserMemory(id: string, userId: string, input: UpdateUserMemoryInput): Promise<UserMemoryDto> {
    const existing = await prisma.userMemory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError(`User memory not found: ${id}`);
    if (existing.userId !== userId) throw new ForbiddenError('Access denied');

    const updated = await prisma.userMemory.update({
      where: { id },
      data: {
        value: input.value,
        category: input.category,
        archivedAt: input.archived ? new Date() : input.archived === false ? null : undefined,
      },
    });

    return this.formatMemory(updated);
  }

  async archiveUserMemory(id: string, userId: string): Promise<UserMemoryDto> {
    return this.updateUserMemory(id, userId, { archived: true });
  }
}
