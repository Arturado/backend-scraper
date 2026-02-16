import { Controller, Get, Post, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.jobsService.findAll(query);
  }

  @Post('test')
  createTest() {
    return this.jobsService.createTestJob();
  }
}




