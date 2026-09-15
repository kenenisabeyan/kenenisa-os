import { prisma } from '../../lib/prisma.js';
import { DailyCapacityDto, WeeklyCapacityDto } from '@kenenisa-os/shared';
import { PlanningDateService } from './planning-date.service.js';

export class CapacityService {
  private dateService = new PlanningDateService();

  async getDailyCapacity(userId: string, dateStr?: string): Promise<DailyCapacityDto> {
    const { dateStr: formattedDate, startUtc, endUtc } = this.dateService.getDailyBounds(dateStr);

    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
      select: { dailyWorkCapacityMinutes: true },
    });

    const capacityMinutes = userSettings?.dailyWorkCapacityMinutes ?? 480;

    const timeBlocks = await prisma.timeBlock.findMany({
      where: {
        userId,
        startAt: { gte: startUtc, lte: endUtc },
      },
      select: { startAt: true, endAt: true },
    });

    const plannedMinutes = timeBlocks.reduce((acc, block) => {
      const diffMs = block.endAt.getTime() - block.startAt.getTime();
      return acc + Math.max(0, Math.round(diffMs / (1000 * 60)));
    }, 0);

    const remainingMinutes = capacityMinutes - plannedMinutes;
    const overCapacity = plannedMinutes > capacityMinutes;
    const utilizationPercent =
      capacityMinutes > 0 ? Math.round((plannedMinutes / capacityMinutes) * 100) : null;

    return {
      date: formattedDate,
      capacityMinutes,
      plannedMinutes,
      remainingMinutes,
      utilizationPercent,
      overCapacity,
    };
  }

  async getWeeklyCapacity(userId: string, weekStartStr?: string): Promise<WeeklyCapacityDto> {
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
      select: { weeklyWorkCapacityMinutes: true, weekStartsOn: true },
    });

    const weekStartsOn = userSettings?.weekStartsOn ?? 1;
    const weeklyCapacityMinutes = userSettings?.weeklyWorkCapacityMinutes ?? 2400;

    const { weekStartStr: startStr, weekEndStr: endStr, startUtc } =
      this.dateService.getWeeklyBounds(weekStartStr, weekStartsOn);

    const dailyBreakdown: DailyCapacityDto[] = [];
    const currentUtc = new Date(startUtc);

    for (let i = 0; i < 7; i++) {
      const year = currentUtc.getUTCFullYear();
      const month = String(currentUtc.getUTCMonth() + 1).padStart(2, '0');
      const day = String(currentUtc.getUTCDate()).padStart(2, '0');
      const dayStr = `${year}-${month}-${day}`;

      const dailyCap = await this.getDailyCapacity(userId, dayStr);
      dailyBreakdown.push(dailyCap);

      currentUtc.setUTCDate(currentUtc.getUTCDate() + 1);
    }

    const totalPlannedMinutes = dailyBreakdown.reduce((acc, d) => acc + d.plannedMinutes, 0);
    const remainingMinutes = weeklyCapacityMinutes - totalPlannedMinutes;
    const overCapacity = totalPlannedMinutes > weeklyCapacityMinutes;
    const utilizationPercent =
      weeklyCapacityMinutes > 0
        ? Math.round((totalPlannedMinutes / weeklyCapacityMinutes) * 100)
        : null;

    return {
      weekStart: startStr,
      weekEnd: endStr,
      capacityMinutes: weeklyCapacityMinutes,
      plannedMinutes: totalPlannedMinutes,
      remainingMinutes,
      utilizationPercent,
      overCapacity,
      dailyBreakdown,
    };
  }
}
