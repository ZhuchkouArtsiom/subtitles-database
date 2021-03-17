import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { videoProviders } from './video.providers';
import { VideoController } from './video.controller';
import { videoSubtitlesProviders } from './video-subtitles.providers';
import { subtitlesProviders } from '../subtitles/subtitles.providers';
import { snippetProviders } from '../snippet/snippet.providers';
import { CrawlerService } from '../crawler/crawler.service';
import { videoInterestsProviders } from './video-interests.providers';
import { editorsProviders } from '../editor/editor.providers';
import { SubtitlesService } from '../subtitles/subtitles.service';
import { PriorityService } from '../priority/priority.service';

@Module({
  providers: [
    VideoService,
    CrawlerService,
    ...videoProviders,
    ...videoSubtitlesProviders,
    ...subtitlesProviders,
    ...snippetProviders,
    ...videoInterestsProviders,
    ...editorsProviders,
    SubtitlesService,
    PriorityService,
  ],
  controllers: [VideoController],
  exports: [VideoService],
})
export class VideoModule {}
