import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { GetOnBoardAdapter } from "../sources/getonboard.adapter";



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
      // Mapeo del senioriy
    private mapGetOnBoardSeniority(value: string | null) {
        if (!value) return null;

        const lower = value.toLowerCase();

        if (lower.includes("junior")) return "JUNIOR";
        if (lower.includes("semi")) return "SEMI";
        if (lower.includes("senior")) return "SENIOR";

        return null;
      }


      async scrapeArbeitnow() {
      const response = await axios.get('https://www.arbeitnow.com/api/job-board-api');
      const jobs = response.data.data;

      let inserted = 0;

      for (const job of jobs) {
        try {
          const combinedText = `${job.title} ${job.description ?? ""}`;

          const seniority = this.detectSeniority(combinedText);
          const stacks = this.detectStacks(combinedText);

          await this.prisma.job.create({
            data: {
              title: job.title,
              company: job.company_name,
              remoteType: job.remote === true ? "REMOTE" : "ONSITE",
              source: "arbeitnow",
              url: job.url,
              description: job.description,
              publishedAt: new Date(job.created_at),
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

    // Normalizar atributos de  getonboard para salvar en Prisma 

    private normalizeGetOnBoardJob(job: any) {
      const attr = job.attributes;

      const company =
        attr.company?.data?.attributes?.name ?? "Unknown";

      const combinedText = `
        ${attr.title}
        ${attr.description ?? ""}
        ${attr.functions ?? ""}
        ${attr.desirable ?? ""}
      `;

      const stacks = this.detectStacks(combinedText);

      return {
        title: attr.title,
        company,
        country: attr.country ?? null,
        remoteType: attr.remote === true ? "REMOTE" : "ONSITE",
        seniority: this.mapGetOnBoardSeniority(attr.seniority),
        salaryMin: attr.min_salary ?? null,
        salaryMax: attr.max_salary ?? null,
        currency: "USD", //  RECORDATORIO PARA MI: por ahora así luego hacerlo dinamico CLP/BR/Args/Euros etc ***
        source: "getonboard",
        url: job.links.public_url,
        description: attr.description ?? null,
        publishedAt: new Date(attr.published_at * 1000),
        stacks,
      };
    }


    async testGetOnBoard() {
    const adapter = new GetOnBoardAdapter();
    const jobs = await adapter.fetchRawJobs();

    const normalized = this.normalizeGetOnBoardJob(jobs[0]);

    return {
      total: jobs.length,
      normalizedExample: normalized,
    };
}

    

  

    @Cron('0 */6 * * *') // Cron Cada 6 Horas + try para que no se solapen 
    async handleCron() {
      console.log("Running scheduled scrape...");

      try {
        await this.scrapeRemoteOK();
      } catch (e) {
        console.error("RemoteOK failed", e);
      }

      try {
        await this.scrapeArbeitnow();
      } catch (e) {
        console.error("Arbeitnow failed", e);
      }
    }
}
