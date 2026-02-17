import { Controller, Get } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get('remoteok')
  runRemoteOK() {
    return this.scraperService.scrapeRemoteOK();
  }

  @Get('arbeitnow') 
  runArbeitnow() {
    return this.scraperService.scrapeArbeitnow();
  }

  @Get("test-getonboard")
  runTest() {
    return this.scraperService.testGetOnBoard();
  }

}
