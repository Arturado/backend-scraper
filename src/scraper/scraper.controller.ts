import { Controller, Get } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  // Ejecuta todos los sources manualmente
  @Get('run')
  async runAll() {
    return this.scraperService.scrapeAllSources();
  }
}
