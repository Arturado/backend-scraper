import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScraperService {
  constructor(private prisma: PrismaService) {}

  async scrapeRemoteOK() {
    const response = await axios.get('https://remoteok.com/api');

    const data = response.data;

    // El primer elemento es metadata
    const jobs = data.slice(1);

    let inserted = 0;

    for (const job of jobs) {
      try {
        const combinedText = `${job.position} ${job.description ?? ""}`;

        const seniority = this.detectSeniority(combinedText);
        const stacks = this.detectStacks(combinedText);

        await this.prisma.job.create({
        data: {
            title: job.position,
            company: job.company,
            remoteType: "REMOTE", // para consumir en surce mantener el remoteok 
            source: "remoteok",
            url: `https://remoteok.com/${job.slug}`,
            description: job.description,
            publishedAt: new Date(job.date),
            seniority: seniority ?? undefined,

            stacks: {
            connectOrCreate: stacks.map(stack => ({
                where: { name: stack },
                create: { name: stack },
            })),
            },
        },
        });

        inserted++;
      } catch (error: any) {
        if (error.code !== 'P2002') {
          console.error(error);
        }
      }
    }

    return {
      totalFetched: jobs.length,
      inserted,
    };
  }

    private detectSeniority(text: string): any {
        const lower = text.toLowerCase();

        if (lower.includes("senior")) return "SENIOR";
        if (lower.includes("junior")) return "JUNIOR";
        if (lower.includes("lead")) return "LEAD";
        if (lower.includes("mid")) return "SEMI";

        return null;
    }

    private detectStacks(text: string): string[] {
        const lower = text.toLowerCase();
        const stacks: string[] = [];

        if (lower.includes("react")) stacks.push("React");
        if (lower.includes("next")) stacks.push("Next.js");
        if (lower.includes("node")) stacks.push("Node.js");
        if (lower.includes("nestjs")) stacks.push("NestJS");
        if (lower.includes("wordpress")) stacks.push("WordPress");
        if (lower.includes("salesforce")) stacks.push("Salesforce");
        if (lower.includes("python")) stacks.push("Python");
        if (lower.includes(".net")) stacks.push(".NET");
        if (lower.includes("java")) stacks.push("Java");

        return stacks;
    }

}
