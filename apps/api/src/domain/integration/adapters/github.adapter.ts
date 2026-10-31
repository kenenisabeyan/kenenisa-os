import { prisma } from '../../../lib/prisma.js';
import type { IntegrationAccount } from '@prisma/client';
import type { IntegrationAdapter, ConnectionTestResult, SyncResult } from './integration-adapter.interface.js';
import { decryptCredential } from '../../../utils/encryption.js';

export class GitHubAdapter implements IntegrationAdapter {
  readonly provider = 'GITHUB' as const;

  async testConnection(token: string): Promise<ConnectionTestResult> {
    try {
      if (token.startsWith('mock_') || token.startsWith('test_')) {
        return {
          ok: true,
          accountEmail: 'beyankenenisa@gmail.com',
          accountName: 'kenenisabeyan',
        };
      }

      const res = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'KENENISA-OS-System-Integration',
        },
      });

      if (!res.ok) {
        return {
          ok: false,
          errorMessage: `GitHub authentication failed: ${res.statusText}`,
        };
      }

      const user = (await res.json()) as { login: string; email?: string };
      return {
        ok: true,
        accountName: user.login,
        accountEmail: user.email || 'beyankenenisa@gmail.com',
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

      let commits: Array<{ sha: string; message: string; date: string; url: string; repo: string }> = [];

      if (rawToken.startsWith('mock_') || rawToken.startsWith('test_')) {
        commits = [
          {
            sha: 'a1b2c3d4e5f67890123456789abcdef012345678',
            message: 'feat: ASTU graduation command center & deterministic NBA engine',
            date: new Date().toISOString(),
            url: 'https://github.com/kenenisabeyan/kenenisa-os/commit/a1b2c3d4e5f6',
            repo: 'kenenisa-os',
          },
          {
            sha: 'f9e8d7c6b5a43210987654321fedcba987654321',
            message: 'feat(academics): semester course management and assessment tracker',
            date: new Date().toISOString(),
            url: 'https://github.com/kenenisabeyan/kenenisa-os/commit/f9e8d7c6b5a4',
            repo: 'kenenisa-os',
          },
        ];
      } else {
        // Fetch recent user repos & commits
        const res = await fetch('https://api.github.com/user/events?per_page=10', {
          headers: {
            Authorization: `Bearer ${rawToken}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'KENENISA-OS-Integration',
          },
        });

        if (res.ok) {
          const events = (await res.json()) as any[];
          for (const ev of events) {
            if (ev.type === 'PushEvent' && ev.payload?.commits) {
              for (const c of ev.payload.commits) {
                commits.push({
                  sha: c.sha,
                  message: c.message,
                  date: ev.created_at,
                  url: c.url,
                  repo: ev.repo?.name || 'repository',
                });
              }
            }
          }
        } else {
          result.errors.push(`GitHub API returned ${res.statusText}`);
          result.itemsFailed++;
        }
      }

      // Find individual and group project for auto-association
      const graduationProjects = await prisma.project.findMany({
        where: {
          userId,
          slug: { in: ['individual-graduation-project', 'group-graduation-project'] },
        },
      });

      // Find AI / Software engineering skills for auto-linking
      const engineeringSkills = await prisma.skill.findMany({
        where: {
          userId,
          name: { in: ['Software Engineering', 'Full-Stack Development', 'AI Engineering', 'PostgreSQL'] },
        },
      });

      for (const commit of commits) {
        try {
          // Check if mapping already exists
          const existingMapping = await prisma.integrationEntityMapping.findUnique({
            where: {
              userId_provider_externalId: {
                userId,
                provider: this.provider,
                externalId: commit.sha,
              },
            },
          });

          if (existingMapping) {
            // Already imported as evidence
            continue;
          }

          // Create verified Evidence record
          const evidence = await prisma.evidence.create({
            data: {
              userId,
              title: `[GitHub] ${commit.message.split('\n')[0].slice(0, 80)}`,
              description: `Automated verifiable code evidence from ${commit.repo}. Commit SHA: ${commit.sha.slice(0, 8)}`,
              type: 'GIT_COMMIT',
              url: commit.url,
              externalReference: commit.sha,
              date: new Date(commit.date),
              verified: true,
            },
          });

          // Link to graduation projects if available
          for (const p of graduationProjects) {
            await prisma.evidenceProject.create({
              data: {
                evidenceId: evidence.id,
                projectId: p.id,
              },
            }).catch(() => {});
          }

          // Link to engineering skills if available
          for (const s of engineeringSkills) {
            await prisma.evidenceSkill.create({
              data: {
                evidenceId: evidence.id,
                skillId: s.id,
              },
            }).catch(() => {});
          }

          // Register mapping
          await prisma.integrationEntityMapping.create({
            data: {
              integrationAccountId: account.id,
              userId,
              provider: this.provider,
              externalId: commit.sha,
              internalEntityType: 'EVIDENCE',
              internalEntityId: evidence.id,
            },
          });

          result.itemsImported++;
        } catch (itemErr: any) {
          result.itemsFailed++;
          result.errors.push(`Error processing commit ${commit.sha}: ${itemErr.message}`);
        }
      }
    } catch (err: any) {
      result.errors.push(err.message);
      result.itemsFailed++;
    }

    return result;
  }
}

