import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}
    async findAll(query: any) {
    const { stack, seniority, source, page = 1, limit = 20 } = query; // Limite de consulta a 20 

    const skip = (Number(page) - 1) * Number(limit);

    const jobs = await this.prisma.job.findMany({
      where: {
        seniority: seniority ? seniority : undefined,
        source: source ? source : undefined,
        stacks: stack
          ? {
              some: {
                name: stack,
              },
            }
          : undefined,
      },
      include: {
        stacks: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      skip,
      take: Number(limit),
    });

    const total = await this.prisma.job.count();

    return {
      data: jobs,
      total,
      page: Number(page),
    };
  }


  async createTestJob() {
  try {
    return await this.prisma.job.create({
      data: {
        title: "Fullstack Developer",
        company: "DevMarket Radar",
        remoteType: "REMOTE",
        source: "manual-test",
        url: "https://devmarket.test/job-1",
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { message: 'Job already exists' }; //disparador de duplicado
    }
    throw error;
  }
}

}

