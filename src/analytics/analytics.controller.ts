import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))   //  Protección global del controller
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

  @Get('jobs-over-time')
  getJobsOverTime(@Query('days') days?: string) {
    return this.analyticsService.getJobsOverTime(
      days ? Number(days) : 30,
    );
  }
}
