import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const totalJobs = await this.prisma.job.count();

    const totalRemote = await this.prisma.job.count({
      where: { remoteType: "REMOTE" },
    });

    return {
      totalJobs,
      remotePercentage:
        totalJobs > 0
          ? ((totalRemote / totalJobs) * 100).toFixed(2)
          : 0,
    };
  }

  async getTopStacks() {
    const stacks = await this.prisma.stackTag.findMany({
        include: {
        _count: {
            select: { jobs: true },
        },
        },
        orderBy: {
        jobs: {
            _count: 'desc',
        },
        },
    });

        return stacks.map(stack => ({
            name: stack.name,
            count: stack._count.jobs,
        }));
  }
    async getSeniorityDistribution() {
    return this.prisma.job.groupBy({
        by: ['seniority'],
        _count: {
        seniority: true,
        },
     });
    }

  async getJobsOverTime(days: number = 14) {
    const result = await this.prisma.$queryRaw<
      { date: string; count: bigint }[]
    >`
      SELECT 
        DATE("publishedAt") as date,
        COUNT(*) as count
      FROM "Job"
      WHERE "publishedAt" IS NOT NULL
        AND "publishedAt" >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE("publishedAt")
      ORDER BY DATE("publishedAt") ASC;
    `;

    return result.map(row => ({
      date: row.date,
      count: Number(row.count),
    }));
  }

}
