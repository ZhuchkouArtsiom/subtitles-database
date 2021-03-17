import { Module } from '@nestjs/common';
import { videoProviders } from '../video/video.providers';
import { videoSubtitlesProviders } from '../video/video-subtitles.providers';
import { subtitlesProviders } from './subtitles.providers';
import { SubtitlesController } from './subtitles.controller';
import { SubtitlesService } from './subtitles.service';

@Module({
  providers: [
    ...videoProviders,
    ...videoSubtitlesProviders,
    ...subtitlesProviders,
    SubtitlesService,
  ],
  controllers: [SubtitlesController],
})
export class SubtitlesModule {}
