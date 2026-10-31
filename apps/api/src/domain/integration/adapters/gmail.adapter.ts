import { prisma } from '../../../lib/prisma.js';
import type { IntegrationAccount } from '@prisma/client';
import type { IntegrationAdapter, ConnectionTestResult, SyncResult } from './integration-adapter.interface.js';
import { decryptCredential } from '../../../utils/encryption.js';

interface GmailMessageSummary {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
}

export class GmailAdapter implements IntegrationAdapter {
  readonly provider = 'GMAIL' as const;

  async testConnection(token: string): Promise<ConnectionTestResult> {
    try {
      if (token.startsWith('mock_') || token.startsWith('test_')) {
        return {
          ok: true,
          accountEmail: 'beyankenenisa@gmail.com',
          accountName: 'Kenenisa Beyan (Gmail Academic Sentinel)',
        };
      }

      const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        return {
          ok: false,
          errorMessage: `Gmail OAuth verification failed: ${res.statusText}`,
        };
      }

      const data = (await res.json()) as { email?: string; name?: string };
      return {
        ok: true,
        accountEmail: data.email || 'beyankenenisa@gmail.com',
        accountName: data.name || 'Kenenisa Beyan',
      };
    } catch (err: any) {
      return { ok: false, errorMessage: err.message };
    }
  }

  async sync(account: IntegrationAccount, userId: string): Promise<SyncResult> {
    const result: SyncResult = {
      itemsImported: 0,
      itemsExported: 0,
      itemsFailed: 0,
      errors: [],
    };

    try {
      const rawToken = decryptCredential(account.encryptedToken);

      let messages: GmailMessageSummary[] = [];

      if (rawToken.startsWith('mock_') || rawToken.startsWith('test_')) {
        messages = [
          {
            id: 'gmail_msg_astu_supervisor_update',
            threadId: 'gmail_thread_001',
            subject: 'ASTU Graduation Project — Progress Review Meeting Next Tuesday',
            from: 'advisor@astu.edu.et',
            date: new Date().toISOString(),
            snippet: 'Dear Kenenisa, please prepare your system architecture diagrams and working prototype demo for our milestone review next Tuesday at 10:00 AM.',
          },
          {
            id: 'gmail_msg_astu_department_exam_schedule',
            threadId: 'gmail_thread_002',
            subject: 'ASTU Computer Science & Engineering — Final Exam Schedule Published',
            from: 'cse-dept@astu.edu.et',
            date: new Date().toISOString(),
            snippet: 'Please find attached the official semester exam schedule. Verify all course assessment submissions by Friday.',
          },
        ];
      } else {
        // Query Gmail for academic / project keywords: strictly read-only
        const query = encodeURIComponent('astu OR advisor OR graduation OR "project review" OR exam');
        const listRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=10`, {
          headers: { Authorization: `Bearer ${rawToken}` },
        });

        if (listRes.ok) {
          const listData = (await listRes.json()) as { messages?: Array<{ id: string; threadId: string }> };
          const rawMessages = listData.messages || [];

          for (const m of rawMessages) {
            const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, {
              headers: { Authorization: `Bearer ${rawToken}` },
            });

            if (detailRes.ok) {
              const detail = (await detailRes.json()) as any;
              const headers = (detail.payload?.headers || []) as Array<{ name: string; value: string }>;
              const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || 'ASTU Academic Notice';
              const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
              const date = headers.find(h => h.name.toLowerCase() === 'date')?.value || new Date().toISOString();

              messages.push({
                id: m.id,
                threadId: m.threadId,
                subject,
                from,
                date,
                snippet: detail.snippet || '',
              });
            }
          }
        } else {
          result.errors.push(`Gmail API query failed: ${listRes.statusText}`);
          result.itemsFailed++;
        }
      }

      // Find individual graduation project or ASTU fallback project
      let targetProject = await prisma.project.findFirst({
        where: {
          userId,
          slug: 'individual-graduation-project',
        },
      });

      if (!targetProject) {
        targetProject = await prisma.project.findFirst({
          where: { userId },
          orderBy: { createdAt: 'asc' },
        });
      }

      if (!targetProject) {
        result.errors.push('No project available to attach Gmail academic action items.');
        return result;
      }

      // For each email, create an actionable task if not already mapped
      for (const msg of messages) {
        try {
          const existingMapping = await prisma.integrationEntityMapping.findUnique({
            where: {
              userId_provider_externalId: {
                userId,
                provider: this.provider,
                externalId: msg.id,
              },
            },
          });

          if (existingMapping) {
            continue;
          }

          // Create actionable task
          const task = await prisma.task.create({
            data: {
              userId,
              projectId: targetProject.id,
              title: `[Gmail Action] ${msg.subject.slice(0, 90)}`,
              description: `From: ${msg.from}\nDate: ${msg.date}\nSnippet: ${msg.snippet}\n\nStrictly sentinel imported. Review and follow up as needed.`,
              priority: 'P1',
              status: 'READY',
              estimateMinutes: 30,
            },
          });

          // Register mapping
          await prisma.integrationEntityMapping.create({
            data: {
              integrationAccountId: account.id,
              userId,
              provider: this.provider,
              externalId: msg.id,
              internalEntityType: 'TASK',
              internalEntityId: task.id,
            },
          });

          result.itemsImported++;
        } catch (itemErr: any) {
          result.itemsFailed++;
          result.errors.push(`Error processing Gmail message ${msg.id}: ${itemErr.message}`);
        }
      }
    } catch (err: any) {
      result.errors.push(err.message);
      result.itemsFailed++;
    }

    return result;
  }
}

