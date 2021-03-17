import { Module } from '@nestjs/common';
import { PostgresModule } from './db/postgres.module';
import { ConfigModule } from '@nestjs/config';
import { VideoModule } from './modules/video/video.module';
import { CrawlerModule } from './modules/crawler/crawler.module';
import { AuthModule } from './modules/auth/auth.module';
import { InterestsModule } from './modules/interests/interests.module';
import { SubtitlesModule } from './modules/subtitles/subtitles.module';
import { PriorityModule } from './modules/priority/priority.module';

@Module({
  imports: [
    PostgresModule,
    ConfigModule.forRoot({ isGlobal: true }),
    VideoModule,
    CrawlerModule,
    AuthModule,
    InterestsModule,
    SubtitlesModule,
    PriorityModule,
  ],
})
export class AppModule {}
