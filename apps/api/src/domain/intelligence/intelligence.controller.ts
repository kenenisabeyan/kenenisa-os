import { Request, Response, NextFunction } from 'express';
import { IntelligenceService } from './intelligence.service.js';
import { MemoryService } from './memory/memory.service.js';
import {
  intelligenceChatSchema,
  createUserMemorySchema,
  updateUserMemorySchema,
  confirmActionSchema,
} from '@kenenisa-os/shared';
import { MemoryCategory } from '@prisma/client';

export class IntelligenceController {
  private service = new IntelligenceService();
  private memoryService = new MemoryService();

  chat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const input = intelligenceChatSchema.parse(req.body);
      const result = await this.service.chat(userId, input);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  confirmAction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const input = confirmActionSchema.parse(req.body);
      const result = await this.service.executeConfirmedAction(userId, input);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  listConversations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const list = await this.service.listConversations(userId);
      res.json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  };

  getConversationMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const messages = await this.service.getConversationMessages(userId, id);
      res.json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  };

  deleteConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const result = await this.service.deleteConversation(userId, id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  listMemories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const category = typeof req.query.category === 'string' ? (req.query.category as MemoryCategory) : undefined;
      const includeArchived = req.query.includeArchived === 'true';
      const memories = await this.memoryService.listUserMemories(userId, category, includeArchived);
      res.json({ success: true, data: memories });
    } catch (error) {
      next(error);
    }
  };

  createMemory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const input = createUserMemorySchema.parse(req.body);
      const created = await this.memoryService.createUserMemory(userId, input);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  };

  updateMemory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const input = updateUserMemorySchema.parse(req.body);
      const updated = await this.memoryService.updateUserMemory(id, userId, input);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  archiveMemory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth!.userId;
      const id = req.params.id as string;
      const archived = await this.memoryService.archiveUserMemory(id, userId);
      res.json({ success: true, data: archived });
    } catch (error) {
      next(error);
    }
  };
}
