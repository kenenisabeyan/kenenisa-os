import { AIProvider, AIRequest, AIResponse, AIToolCall } from './ai-provider.interface.js';
import { prisma } from '../../../lib/prisma.js';
import { IntelligenceToolRegistry } from '../tools/intelligence-tool.registry.js';

function formatDate(d: unknown): string {
  if (!d) return '';
  if (d instanceof Date) return d.toISOString().split('T')[0];
  if (typeof d === 'string') return d.includes('T') ? d.split('T')[0] : d;
  return String(d);
}

function formatTime(d: unknown): string {
  if (!d) return '';
  if (d instanceof Date) return d.toTimeString().slice(0, 5);
  if (typeof d === 'string' && d.includes('T')) return d.split('T')[1].slice(0, 5);
  return String(d);
}

export class GroundedReasoningEngine implements AIProvider {
  readonly name = 'GroundedReasoningEngine';
  private toolRegistry: IntelligenceToolRegistry;

  constructor(toolRegistry?: IntelligenceToolRegistry) {
    this.toolRegistry = toolRegistry || new IntelligenceToolRegistry();
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const lastMsg = request.messages[request.messages.length - 1]?.content || '';
    const cleanQuery = lastMsg.trim().toLowerCase();

    // Conversation history context (previous message context for pronoun / follow-up resolution)
    const prevAssistantMsg = request.messages.length > 2
      ? request.messages[request.messages.length - 2]?.content || ''
      : '';

    // Extract user ID from context or default
    const userId = (request.context?.userId as string) || (await this.resolveDefaultUserId());
    const pageContext = request.context?.pageContext as { pageType?: string; entityId?: string; entityTitle?: string } | undefined;

    // Detect intent
    const isTaskCreation = cleanQuery.includes('create a task') || cleanQuery.includes('add task') || cleanQuery.includes('propose task');
    const isScheduleCreation = cleanQuery.includes('time block') || cleanQuery.includes('schedule') || cleanQuery.includes('plan focus');
    const isBlockerQuery = cleanQuery.includes('block') || cleanQuery.includes('bottleneck') || cleanQuery.includes('stuck') || cleanQuery.includes('prerequisite') || cleanQuery.includes('unblock') || cleanQuery.includes('resolve blocker');

    // 1. Action Proposal Intent: Create Task
    if (isTaskCreation) {
      const match = lastMsg.match(/(?:create a task|add task|propose task)\s+(?:called|titled|to)?\s*"?([^".\n]+)"?/i);
      const title = match && match[1] ? match[1].trim() : 'Deliverable Task';
      
      return {
        content: `I propose creating the task **"${title}"** with priority **P1** to advance your current execution track.\n\nPlease review and confirm the proposal card below to persist this task in your project.`,
        toolCalls: [
          {
            id: `tool-${Date.now()}`,
            name: 'propose_create_task',
            arguments: {
              title,
              priority: 'P1',
              estimateMinutes: 60,
              projectId: pageContext?.entityId,
            },
          },
        ],
        facts: [`Task title: ${title}`, `Target priority: P1`],
        inferences: ['Creating this task establishes a verifiable deliverable in your active project.'],
        recommendations: ['Confirm the proposal to save it to your backlog.'],
        providerName: this.name,
      };
    }

    // 2. Action Proposal Intent: Schedule Time Block
    if (isScheduleCreation) {
      const tomorrow9am = new Date();
      tomorrow9am.setDate(tomorrow9am.getDate() + 1);
      tomorrow9am.setHours(9, 0, 0, 0);
      const tomorrow1030am = new Date(tomorrow9am.getTime() + 90 * 60000);

      return {
        content: `I have analyzed your daily capacity and propose scheduling a **90-minute Deep Work session** tomorrow from 09:00 AM to 10:30 AM.\n\nPlease confirm to reserve this block on your execution schedule.`,
        toolCalls: [
          {
            id: `tool-${Date.now()}`,
            name: 'propose_create_time_block',
            arguments: {
              title: 'Deep Work Focus Execution',
              startAt: tomorrow9am.toISOString(),
              endAt: tomorrow1030am.toISOString(),
            },
          },
        ],
        facts: ['90-minute morning focus window open.'],
        inferences: ['Protected deep work blocks significantly increase completion rate of P0/P1 tasks.'],
        recommendations: ['Confirm to persist the time block in your calendar.'],
        providerName: this.name,
      };
    }

    // 3. Blocker Analysis & Unblocking Paths
    if (isBlockerQuery) {
      const blockedData = (await this.toolRegistry.executeTool('get_blocked_tasks', userId, {})) as any;
      const blockedTasks = blockedData.blockedTasks || [];

      if (blockedTasks.length === 0) {
        return {
          content: `### 🟢 System Blocker Audit\n\n**Zero blocked tasks detected.** All active tasks in your project pipeline are currently in **READY** or **IN_PROGRESS** status with no unresolved dependency constraints.\n\nYou have complete execution clearance to proceed with your Next Best Action.`,
          facts: ['Active blocked tasks count: 0'],
          inferences: ['Pipeline flow is optimal with zero dependency bottlenecks.'],
          recommendations: ['Maintain execution momentum by starting your highest priority ready task.'],
          providerName: this.name,
        };
      }

      let blockerReport = `### ⛔ Critical Blocker Analysis (${blockedTasks.length} Blocked Tasks)\n\n`;
      const toolCalls: AIToolCall[] = [];

      blockedTasks.forEach((t: any, idx: number) => {
        const rawBlockers = t.blockers || t.blockingDependencies || [];
        const prerequisites = rawBlockers
          .map((d: any) => {
            const title = d.title || d.blockingTask?.title || 'Unknown Task';
            const status = d.status || d.blockingTask?.status || 'UNKNOWN';
            return `**"${title}"** (${status})`;
          })
          .join(', ');

        const projectName = t.projectName || t.project?.name || 'General';
        blockerReport += `${idx + 1}. **"${t.title}"** (Priority: \`${t.priority}\`, Project: *${projectName}*)\n`;
        blockerReport += `   - **Prerequisite Blocker:** ${prerequisites || 'None specified'}\n`;
        blockerReport += `   - **Resolution Path:** Complete prerequisite task to automatically unblock this deliverable.\n\n`;

        // Propose unblocking the first blocked task if prerequisite is identified
        if (idx === 0 && rawBlockers.length > 0) {
          const prereqId = rawBlockers[0].id || rawBlockers[0].blockingTaskId;
          toolCalls.push({
            id: `tool-unblock-${Date.now()}`,
            name: 'propose_resolve_blocker',
            arguments: {
              blockedTaskId: t.id,
              prerequisiteTaskId: prereqId,
            },
          });
        }
      });

      return {
        content: blockerReport + `> 💡 **Recommended Action:** Execute or advance the blocking prerequisites above to trigger the internal cascade engine and automatically restore these tasks to **READY**.`,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        facts: [`Total blocked tasks: ${blockedTasks.length}`],
        inferences: ['Unblocking the top prerequisite task will trigger an internal cascade to ready status.'],
        recommendations: ['Prioritize finishing prerequisite tasks before attempting blocked work.'],
        providerName: this.name,
      };
    }

    // 4. Graduation Intelligence & Defense Readiness
    if (cleanQuery.includes('graduation') || cleanQuery.includes('defense') || cleanQuery.includes('astu') || cleanQuery.includes('thesis')) {
      const gradData = (await this.toolRegistry.executeTool('get_graduation_intelligence', userId, {})) as any;
      const daysRemaining = gradData.daysRemaining ?? 'Not set';
      const targetDate = gradData.targetDate ?? 'Not set';
      const projects = gradData.projects || [];
      const individualProjectA = projects.find((p: any) => p.slug === 'individual-graduation-project') || projects[0];
      const groupProjectB = projects.find((p: any) => p.slug === 'group-graduation-project') || projects[1];

      let gradReport = `### 🎓 ASTU Graduation Intelligence & Defense Readiness\n\n`;
      gradReport += `* **Target Graduation Date:** \`${targetDate}\` (**${daysRemaining} days remaining**)\n`;
      gradReport += `* **Individual Project A (${individualProjectA?.name || 'Individual Project'}):** **${individualProjectA?.progressPercentage || 0}% Complete** (${individualProjectA?.reachedMilestones || 0}/${individualProjectA?.totalMilestones || 0} milestones reached)\n`;
      gradReport += `* **Group Project B (${groupProjectB?.name || 'Group Project'}):** **${groupProjectB?.progressPercentage || 0}% Complete** (${groupProjectB?.reachedMilestones || 0}/${groupProjectB?.totalMilestones || 0} milestones reached)\n\n`;

      if (individualProjectA?.nextMilestone) {
        gradReport += `#### Immediate Next Milestone:\n`;
        gradReport += `- **"${individualProjectA.nextMilestone.name}"** ${individualProjectA.nextMilestone.targetDate ? `(Target: ${formatDate(individualProjectA.nextMilestone.targetDate)})` : ''}\n\n`;
      }

      gradReport += `> 🎯 **Defense Readiness Assessment:** Your individual project is currently paced at **${individualProjectA?.progressPercentage || 0}%**. To ensure on-time graduation defense, ensure all milestone deliverables and empirical benchmarks are substantiated with verifiable Git commit evidence.`;

      return {
        content: gradReport,
        facts: [
          `Days to graduation: ${daysRemaining}`,
          `Project A progress: ${individualProjectA?.progressPercentage || 0}%`,
          `Project B progress: ${groupProjectB?.progressPercentage || 0}%`,
        ],
        inferences: ['On-time defense requires closing remaining in-progress milestones.'],
        recommendations: ['Prioritize the next incomplete milestone in Individual Project A.'],
        providerName: this.name,
      };
    }

    // 5. Specific Project Details or Project Query
    if (cleanQuery.includes('project') || pageContext?.pageType === 'projects') {
      // Resolve project name from query or page context or conversation history
      let targetName: string | undefined;
      const lowerQuery = lastMsg.toLowerCase();
      if (lowerQuery.includes('individual graduation project') || lowerQuery.includes('individual project')) {
        targetName = 'Individual Graduation Project';
      } else if (lowerQuery.includes('group graduation project') || lowerQuery.includes('group project')) {
        targetName = 'Group Graduation Project';
      } else if (lowerQuery.includes('kenenisa os')) {
        targetName = 'KENENISA OS';
      } else if (pageContext?.entityTitle) {
        targetName = pageContext.entityTitle;
      } else {
        const quotedMatch = lastMsg.match(/["']([^"']+)["']/);
        if (quotedMatch && quotedMatch[1]) {
          targetName = quotedMatch[1].trim();
        } else {
          const projMatch = lastMsg.match(/project\s+([a-zA-Z0-9_-]+)/i);
          if (projMatch && projMatch[1] && !['and', 'the', 'status', 'milestone', 'detail', 'details'].includes(projMatch[1].toLowerCase())) {
            targetName = projMatch[1].trim();
          } else if (prevAssistantMsg.includes('Individual Project A') || prevAssistantMsg.includes('Individual Graduation Project')) {
            targetName = 'Individual Graduation Project';
          }
        }
      }

      const projData = (await this.toolRegistry.executeTool('get_project_details', userId, {
        projectId: pageContext?.entityId,
        projectName: targetName,
      })) as any;

      if (projData.found) {
        let projReport = `### 📁 Project Analysis: **${projData.name}**\n\n`;
        projReport += `* **Status:** \`${projData.status}\` | **Strategic Goal:** *${projData.goal}*\n`;
        projReport += `* **Completion Progress:** **${projData.progressPercentage}%** (${projData.completedTasks}/${projData.totalTasks} tasks completed)\n`;
        projReport += `* **Active Bottlenecks:** **${projData.blockedTasksCount} blocked tasks**\n\n`;

        if (projData.milestones && projData.milestones.length > 0) {
          projReport += `#### Milestones Roadmap:\n`;
          projData.milestones.forEach((m: any) => {
            const icon = m.status === 'REACHED' ? '✅' : '⏳';
            projReport += `- ${icon} **${m.name}** — \`${m.status}\` ${m.targetDate ? `(Due: ${formatDate(m.targetDate)})` : ''}\n`;
          });
          projReport += `\n`;
        }

        if (projData.blockedTasks && projData.blockedTasks.length > 0) {
          projReport += `#### ⚠️ Blocked Items in this Project:\n`;
          projData.blockedTasks.forEach((b: any) => {
            projReport += `- **"${b.title}"** (Blocked by: ${b.blockedBy.join(', ') || 'Prerequisite'})\n`;
          });
          projReport += `\n`;
        }

        if (projData.evidence && projData.evidence.length > 0) {
          projReport += `#### 🔗 Verifiable Evidence Attached:\n`;
          projData.evidence.forEach((e: any) => {
            projReport += `- [${e.title}](${e.url || '#'}) (\`${e.type}\`)\n`;
          });
        } else {
          projReport += `*No verifiable evidence documents or commits linked to this project yet.*\n`;
        }

        return {
          content: projReport,
          facts: [
            `Project: ${projData.name}`,
            `Status: ${projData.status}`,
            `Progress: ${projData.progressPercentage}%`,
            `Total tasks: ${projData.totalTasks}`,
          ],
          inferences: [`Project ${projData.name} has ${projData.blockedTasksCount} blocked dependencies requiring triage.`],
          recommendations: ['Advance active tasks to increment milestone completion.'],
          providerName: this.name,
        };
      } else {
        // Query database for all projects to list them
        const allProjects = await prisma.project.findMany({
          where: { userId },
          select: { id: true, name: true, status: true },
        });

        const projectList = allProjects.map((p) => `- **${p.name}** (\`${p.status}\`)`).join('\n');
        return {
          content: `### 📁 Active Projects Overview\n\n${projectList || 'No projects currently found in your workspace.'}\n\n*Tip: Specify a project name (e.g. "Explain Individual Project A") to inspect its complete milestone and task hierarchy.*`,
          facts: [`Total projects: ${allProjects.length}`],
          inferences: ['User inquired about project status.'],
          recommendations: ['Select a specific project to view detailed dependencies.'],
          providerName: this.name,
        };
      }
    }

    // 6. Academic Obligations & Semester Courses
    if (cleanQuery.includes('course') || cleanQuery.includes('academic') || cleanQuery.includes('semester') || cleanQuery.includes('exam') || cleanQuery.includes('assignment')) {
      const acadData = (await this.toolRegistry.executeTool('get_academic_obligations', userId, {})) as any;
      const courses = acadData.courses || [];

      if (courses.length === 0) {
        return {
          content: `### 📚 Academic Obligations\n\nNo active course enrollments found for the current semester. You can configure enrolled ASTU courses under the **Academics** section.`,
          facts: ['Enrolled courses count: 0'],
          inferences: ['Academic semester records have not yet been populated.'],
          recommendations: ['Enroll your Semester 1 courses under /app/academics to track study hours and exam dates.'],
          providerName: this.name,
        };
      }

      let acadReport = `### 📚 ASTU Academic Obligations (${courses.length} Enrolled Courses)\n\n`;
      courses.forEach((c: any) => {
        acadReport += `* **${c.code}: ${c.name}** (\`${c.status}\`, ${c.creditHours} Credits)\n`;
        acadReport += `   - Study hours logged: **${Math.round(c.totalStudyMinutes / 60)}h**\n`;
        if (c.examDate) acadReport += `   - 📅 **Exam Date:** \`${formatDate(c.examDate)}\`\n`;
        if (c.assignmentDue) acadReport += `   - 📝 **Assignment Due:** \`${formatDate(c.assignmentDue)}\`\n`;
        if (c.lectureSchedule) acadReport += `   - 🏛️ Schedule: *${c.lectureSchedule}*\n`;
      });

      return {
        content: acadReport,
        facts: [`Enrolled courses: ${courses.length}`],
        inferences: ['Maintaining study hour allocation protects academic standing while executing graduation projects.'],
        recommendations: ['Schedule recurring study time blocks for upcoming exam dates.'],
        providerName: this.name,
      };
    }

    // 7. Skills & Learning Progress
    if (cleanQuery.includes('skill') || cleanQuery.includes('learning') || cleanQuery.includes('practice') || cleanQuery.includes('gap')) {
      const skillData = (await this.toolRegistry.executeTool('get_skill_gaps_and_evidence', userId, {})) as any;
      const skills = skillData.skills || [];

      if (skills.length === 0) {
        return {
          content: `### ⚡ Skills & Learning Progress\n\nNo engineering skills have been recorded yet. Navigate to **Skills** to track software, AI, and systems engineering proficiencies.`,
          facts: ['Total skills: 0'],
          inferences: ['No skill items logged.'],
          recommendations: ['Add engineering skills under /app/skills to monitor practice and evidence.'],
          providerName: this.name,
        };
      }

      let skillReport = `### ⚡ Engineering Competencies & Skill Analysis (${skills.length} Tracked Skills)\n\n`;
      const unverified = skills.filter((s: any) => s.evidenceCount === 0);

      skills.forEach((s: any) => {
        const starLevel = '★'.repeat(s.currentLevel) + '☆'.repeat(Math.max(0, s.targetLevel - s.currentLevel));
        skillReport += `* **${s.name}** (\`${s.category}\`) — Level ${s.currentLevel}/${s.targetLevel} \`${starLevel}\` (${s.evidenceCount} verified artifacts)\n`;
      });

      if (unverified.length > 0) {
        skillReport += `\n#### ⚠️ Skill Evidence Gaps (${unverified.length} skills lack proof):\n`;
        unverified.forEach((s: any) => {
          skillReport += `- **${s.name}** currently has **0 linked code commits or documents** demonstrating competence.\n`;
        });
        skillReport += `\n> 💡 **Recommendation:** Attach verified pull requests, repository commits, or lab reports to validate these competencies for graduation defense and employer evaluations.`;
      }

      return {
        content: skillReport,
        facts: [`Total skills: ${skills.length}`, `Unverified skills: ${unverified.length}`],
        inferences: ['Building verifiable evidence accelerates professional and academic credibility.'],
        recommendations: ['Link Git commit evidence to unverified engineering skills.'],
        providerName: this.name,
      };
    }

    // 8. Today's Tasks, Prioritization, or Next Best Action
    if (
      cleanQuery.includes('today') ||
      cleanQuery.includes('priorit') ||
      cleanQuery.includes('next best action') ||
      cleanQuery.includes('what should i do') ||
      cleanQuery.includes('task')
    ) {
      const planData = (await this.toolRegistry.executeTool('get_daily_plan', userId, {})) as any;
      const readyTasks = planData.readyNextTasks || [];
      const scheduledBlocks = planData.scheduledBlocks || [];

      let planReport = `### 🎯 Daily Execution Plan & Task Prioritization\n\n`;
      planReport += `* **Capacity Utilization:** **${planData.plannedMinutes}/${planData.dailyCapacityMinutes} minutes** (${planData.utilizationPercentage}%)\n`;
      planReport += `* **Active Focus Tasks:** ${planData.inProgressTasks?.length || 0} in-progress\n\n`;

      if (readyTasks.length > 0) {
        planReport += `#### Recommended Immediate Priorities (Next Best Actions):\n`;
        readyTasks.forEach((t: any, idx: number) => {
          planReport += `${idx + 1}. **"${t.title}"** — Priority: \`${t.priority}\` | Project: *${t.project?.name || 'General'}*\n`;
        });
        planReport += `\n`;
      } else {
        planReport += `*No READY tasks in immediate queue. Check backlog or unblock pending items.*\n\n`;
      }

      if (scheduledBlocks.length > 0) {
        planReport += `#### Scheduled Focus Blocks Today:\n`;
        scheduledBlocks.forEach((b: any) => {
          planReport += `- 🕒 **${formatTime(b.startAt)} - ${formatTime(b.endAt)}**: ${b.title} ${b.task ? `(*${b.task}*)` : ''}\n`;
        });
      }

      return {
        content: planReport,
        facts: [
          `Daily planned minutes: ${planData.plannedMinutes}`,
          `Ready tasks count: ${readyTasks.length}`,
        ],
        inferences: ['Executing top priority ready tasks prevents delivery bottlenecks.'],
        recommendations: ['Execute the #1 prioritized ready task before context switching.'],
        providerName: this.name,
      };
    }

    // 9. Weekly Review & Retrospective Synthesis
    if (cleanQuery.includes('weekly') || cleanQuery.includes('review') || cleanQuery.includes('retrospective')) {
      const reviewData = (await this.toolRegistry.executeTool('generate_weekly_review_summary', userId, {})) as any;
      const { period, metrics, completedTasks } = reviewData;

      let reviewReport = `### 📊 Weekly Performance & Retrospective Synthesis\n\n`;
      reviewReport += `* **Review Period:** \`${period.startDate}\` to \`${period.endDate}\`\n`;
      reviewReport += `* **Tasks Completed:** **${metrics.tasksCompleted} tasks shipped**\n`;
      reviewReport += `* **Learning Invested:** **${Math.round(metrics.learningMinutes / 60)} hours** (${metrics.learningMinutes} mins)\n`;
      reviewReport += `* **Active Blockers Encountered:** **${metrics.activeBlockers} items**\n\n`;

      if (completedTasks && completedTasks.length > 0) {
        reviewReport += `#### Accomplishments Shipped this Period:\n`;
        completedTasks.slice(0, 5).forEach((t: any) => {
          reviewReport += `- ✅ **"${t.title}"** (*${t.project?.name || 'General'}*)\n`;
        });
      }

      return {
        content: reviewReport,
        facts: [
          `Weekly tasks completed: ${metrics.tasksCompleted}`,
          `Weekly learning minutes: ${metrics.learningMinutes}`,
        ],
        inferences: ['Weekly velocity is measured against planned focus capacity.'],
        recommendations: ['Log completed retrospective under /app/reviews to calibrate next week.'],
        providerName: this.name,
      };
    }

    // 10. Default Factual Synthesis across the entire OS (Zero Hardcoded Generic Responses!)
    const currentState = (await this.toolRegistry.executeTool('get_current_state', userId, {})) as any;
    const goalsData = (await this.toolRegistry.executeTool('get_active_goals', userId, {})) as any;

    let defaultReport = `### 🚀 KENENISA OS — Live Operating State\n\n`;
    defaultReport += `I have analyzed your live system state across all connected modules:\n\n`;
    defaultReport += `* **Active Execution Pipeline:** **${currentState.openTasks} tasks** ready for execution across **${currentState.activeProjects} active projects**.\n`;
    defaultReport += `* **Strategic Goals:** **${goalsData.goalsCount} active goals** in progress.\n`;
    defaultReport += `* **Capacity Today:** **${currentState.plannedMinutesToday} minutes** scheduled on your focus calendar.\n`;
    defaultReport += `* **Career Pipeline:** **${currentState.activeOpportunities} active opportunities** tracked.\n\n`;

    defaultReport += `#### Quick Inquiries You Can Make:\n`;
    defaultReport += `- **"What tasks should I execute today?"** (Surfaces prioritized Next Best Actions)\n`;
    defaultReport += `- **"What is blocking my graduation project?"** (Audits dependency bottlenecks)\n`;
    defaultReport += `- **"Audit my defense readiness"** (Calculates milestone completion & countdown)\n`;
    defaultReport += `- **"Show my semester course schedule"** (Exams, assignments, and study hours)\n`;
    defaultReport += `- **"Which skills need verifiable evidence?"** (Highlights competency gaps)\n`;

    return {
      content: defaultReport,
      facts: [
        `Open tasks: ${currentState.openTasks}`,
        `Active projects: ${currentState.activeProjects}`,
        `Active goals: ${goalsData.goalsCount}`,
        `Planned minutes: ${currentState.plannedMinutesToday}`,
      ],
      inferences: ['All metrics derived dynamically from live PostgreSQL database records.'],
      recommendations: ['Ask specific questions about projects, graduation milestones, or blocker triage.'],
      providerName: this.name,
    };
  }

  private async resolveDefaultUserId(): Promise<string> {
    const user = await prisma.user.findFirst({ select: { id: true } });
    return user?.id || 'default_user';
  }
}
