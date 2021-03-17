import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { VideoModule } from '../video/video.module';
import { CrawlerController } from './crawler.controller';

@Module({
  imports: [VideoModule],
  providers: [CrawlerService],
  controllers: [CrawlerController],
})
export class CrawlerModule {}
