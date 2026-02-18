import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  getSummary() {
    return this.analyticsService.getSummary();
  }

  @Get('top-stacks')
  getTopStacks() {
    return this.analyticsService.getTopStacks();
  }

  @Get('seniority')
  getSeniorityDistribution() {
    return this.analyticsService.getSeniorityDistribution();
  }

  @Get("jobs-over-time")
  getJobsOverTime(@Query("days") days?: string) {
    const parsedDays = days ? parseInt(days) : 14;
    return this.analyticsService.getJobsOverTime(parsedDays);
  }

}
