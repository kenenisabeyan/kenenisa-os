import { prisma } from '../../../lib/prisma.js';
import type { IntegrationAccount } from '@prisma/client';
import type { IntegrationAdapter, ConnectionTestResult, SyncResult } from './integration-adapter.interface.js';
import { decryptCredential } from '../../../utils/encryption.js';

export class GoogleDriveAdapter implements IntegrationAdapter {
  readonly provider = 'GOOGLE_DRIVE' as const;

  async testConnection(token: string): Promise<ConnectionTestResult> {
    try {
      if (token.startsWith('mock_') || token.startsWith('test_')) {
        return {
          ok: true,
          accountEmail: 'beyankenenisa@gmail.com',
          accountName: 'Kenenisa Beyan (Google Drive)',
        };
      }

      const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        return {
          ok: false,
          errorMessage: `Google Drive OAuth verification failed: ${res.statusText}`,
        };
      }

      const data = (await res.json()) as { email?: string; name?: string };
      return {
        ok: true,
        accountEmail: data.email || 'beyankenenisa@gmail.com',
        accountName: data.name || 'Kenenisa Beyan (Drive)',
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

      let files: Array<{ id: string; name: string; mimeType: string; webViewLink: string; modifiedTime?: string }> = [];

      if (rawToken.startsWith('mock_') || rawToken.startsWith('test_')) {
        files = [
          {
            id: 'gdrive_file_astu_grad_report',
            name: 'ASTU Graduation Project — System Architecture & Implementation Report.pdf',
            mimeType: 'application/pdf',
            webViewLink: 'https://drive.google.com/file/d/astu-grad-report/view',
            modifiedTime: new Date().toISOString(),
          },
          {
            id: 'gdrive_file_astu_syllabi',
            name: 'ASTU 5th Year 1st Semester — Course Reference Materials & Lab Guidelines.pdf',
            mimeType: 'application/pdf',
            webViewLink: 'https://drive.google.com/file/d/astu-semester-materials/view',
            modifiedTime: new Date().toISOString(),
          },
        ];
      } else {
        const url = 'https://www.googleapis.com/drive/v3/files?q=trashed=false&pageSize=20&fields=files(id,name,mimeType,webViewLink,modifiedTime)';
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${rawToken}` },
        });

        if (res.ok) {
          const body = (await res.json()) as { files?: any[] };
          files = body.files || [];
        } else {
          result.errors.push(`Google Drive API returned ${res.statusText}`);
          result.itemsFailed++;
        }
      }

      // Find graduation projects for linking
      const graduationProjects = await prisma.project.findMany({
        where: {
          userId,
          slug: { in: ['individual-graduation-project', 'group-graduation-project'] },
        },
      });

      for (const file of files) {
        try {
          // Check if mapping exists
          const existingMapping = await prisma.integrationEntityMapping.findUnique({
            where: {
              userId_provider_externalId: {
                userId,
                provider: this.provider,
                externalId: file.id,
              },
            },
          });

          if (existingMapping) {
            continue;
          }

          // Create verified Evidence document
          const evidence = await prisma.evidence.create({
            data: {
              userId,
              title: `[Google Drive] ${file.name.slice(0, 80)}`,
              description: `Verified document from Google Drive. Type: ${file.mimeType}`,
              type: 'DOCUMENT',
              url: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
              externalReference: file.id,
              date: file.modifiedTime ? new Date(file.modifiedTime) : new Date(),
              verified: true,
            },
          });

          // Link to graduation projects if document matches graduation keywords
          const isGraduationDoc = /graduation|project|thesis|defense|astu/i.test(file.name);
          if (isGraduationDoc) {
            for (const p of graduationProjects) {
              await prisma.evidenceProject.create({
                data: {
                  evidenceId: evidence.id,
                  projectId: p.id,
                },
              }).catch(() => {});
            }
          }

          // Register mapping
          await prisma.integrationEntityMapping.create({
            data: {
              integrationAccountId: account.id,
              userId,
              provider: this.provider,
              externalId: file.id,
              internalEntityType: 'EVIDENCE',
              internalEntityId: evidence.id,
            },
          });

          result.itemsImported++;
        } catch (itemErr: any) {
          result.itemsFailed++;
          result.errors.push(`Error processing Drive file ${file.id}: ${itemErr.message}`);
        }
      }
    } catch (err: any) {
      result.errors.push(err.message);
      result.itemsFailed++;
    }

    return result;
  }
}

