import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RemoteType, Seniority } from "@prisma/client";
import { Cron } from '@nestjs/schedule';

import { RawJobSource } from "../sources/source.interface";
import { RemoteOKAdapter } from "../sources/remoteok.adapter";
import { ArbeitnowAdapter } from "../sources/arbeitnow.adapter";
import { GetOnBoardAdapter } from "../sources/getonboard.adapter";

@Injectable()
export class ScraperService {

  constructor(private prisma: PrismaService) {}

  // ===============================
  //  Registered job sources
  // ===============================
  // Aquí definimos todas las fuentes del sistema.
  // Agregar una nueva fuente solo requiere crear un nuevo Adapter.
  private sources: RawJobSource[] = [
    new RemoteOKAdapter(),
    new ArbeitnowAdapter(),
    new GetOnBoardAdapter(),
  ];

  // ===============================
  //  Cron job (ejecución automática)
  // ===============================
  // Ejecuta todas las fuentes cada 6 horas.
  @Cron('0 */6 * * *')
  async handleCron() {
    console.log("Running scheduled scrape...");
    await this.scrapeAllSources();
  }

  // ===============================
  //  Ejecutar todas las fuentes
  // ===============================
  async scrapeAllSources() {
    for (const source of this.sources) {
      try {
        const rawJobs = await source.fetchRawJobs();
        console.log(`Fetched ${rawJobs.length} jobs from ${source.name}`);

        await this.processRawJobs(rawJobs, source.name);

      } catch (e) {
        console.error(`${source.name} failed`, e);
      }
    }
  }

  // ===============================
  // Procesar y guardar jobs
  // ===============================
  // Normaliza y guarda en Prisma
  private async processRawJobs(rawJobs: any[], sourceName: string) {
    let inserted = 0;

    for (const raw of rawJobs) {
      try {
        const normalized = this.normalizeBySource(raw, sourceName);

        await this.prisma.job.create({
          data: {
            ...normalized,
            seniority: normalized.seniority ?? undefined,
            stacks: {
              connectOrCreate: normalized.stacks.map(stack => ({
                where: { name: stack },
                create: { name: stack },
              })),
            },
          },
        });

        inserted++;

      } catch (error: any) {
        // Ignoramos duplicados (url unique)
        if (error.code !== "P2002") {
          console.error(error);
        }
      }
    }

    console.log(`Inserted ${inserted} jobs from ${sourceName}`);
  }

  
  //  Normalizador por fuente
  
  private normalizeBySource(raw: any, sourceName: string) {
    switch (sourceName) {
      case "remoteok":
        return this.normalizeRemoteOK(raw);

      case "arbeitnow":
        return this.normalizeArbeitnow(raw);

      case "getonboard":
        return this.normalizeGetOnBoard(raw);

      default:
        throw new Error(`Unknown source: ${sourceName}`);
    }
  }

  
  //  Normalización RemoteOK
  
  private normalizeRemoteOK(job: any) {
    const combinedText = `${job.position} ${job.description ?? ""}`;

    return {
      title: job.position,
      company: job.company,
      remoteType: RemoteType.REMOTE,
      source: "remoteok",
      url: `https://remoteok.com/${job.slug}`,
      description: job.description ?? null,
      publishedAt: job.date ? new Date(job.date) : null,
      seniority: this.detectSeniority(combinedText),
      stacks: this.detectStacks(combinedText),
    };
  }

  
  //  Normalización Arbeitnow
  
  private normalizeArbeitnow(job: any) {
    const combinedText = `${job.title} ${job.description ?? ""}`;

    return {
      title: job.title,
      company: job.company_name,
      remoteType: job.remote === true ? RemoteType.REMOTE : RemoteType.ONSITE,
      source: "arbeitnow",
      url: job.url,
      description: job.description ?? null,
      publishedAt: job.created_at ? new Date(job.created_at * 1000) : null,
      seniority: this.detectSeniority(combinedText),
      stacks: this.detectStacks(combinedText),
    };
  }

  
  //  Normalización GetOnBoard
  
  private normalizeGetOnBoard(job: any) {
    const attr = job.attributes;

    const combinedText = `
      ${attr.title}
      ${attr.description ?? ""}
      ${attr.functions ?? ""}
      ${attr.desirable ?? ""}
    `;

    return {
      title: attr.title,
      company: attr.company?.data?.attributes?.name ?? "Unknown",
      country: attr.country ?? null,
      remoteType: attr.remote === true ? RemoteType.REMOTE : RemoteType.ONSITE,
      seniority: this.mapGetOnBoardSeniority(attr.seniority),
      salaryMin: attr.min_salary ?? null,
      salaryMax: attr.max_salary ?? null,
      currency: "USD",
      source: "getonboard",
      url: job.links.public_url,
      description: attr.description ?? null,
      publishedAt: attr.published_at
        ? new Date(attr.published_at * 1000)
        : null,
      stacks: this.detectStacks(combinedText),
    };
  }

  
  //  Detectar seniority genérico
 
  private detectSeniority(text: string): Seniority | null {
    const lower = text.toLowerCase();

    if (lower.includes("junior")) return Seniority.JUNIOR;
    if (lower.includes("semi")) return Seniority.SEMI;
    if (lower.includes("senior")) return Seniority.SENIOR;
    if (lower.includes("lead")) return Seniority.LEAD;

    return null;
  }

  
  // Mapear seniority GetOnBoard
 
  private mapGetOnBoardSeniority(value: any): Seniority | null {
    if (!value) return null;

    if (typeof value === "object") {
      value = value?.data?.attributes?.name ?? null;
    }

    if (typeof value !== "string") return null;

    const lower = value.toLowerCase();

    if (lower.includes("junior")) return Seniority.JUNIOR;
    if (lower.includes("semi")) return Seniority.SEMI;
    if (lower.includes("senior")) return Seniority.SENIOR;
    if (lower.includes("lead")) return Seniority.LEAD;

    return null;
  }

  
  //  Detectar stacks

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
