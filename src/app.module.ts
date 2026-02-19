import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { JobsModule } from './jobs/jobs.module';
import { ScraperModule } from './scraper/scraper.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, JobsModule, ScraperModule, AnalyticsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
