import { Test, TestingModule } from '@nestjs/testing';
import { VideoService } from './video.service';
import { videoProviders } from './video.providers';
import { videoSubtitlesProviders } from './video-subtitles.providers';
import { subtitlesProviders } from '../subtitles/subtitles.providers';
import { snippetProviders } from '../snippet/snippet.providers';
import { CrawlerService } from '../crawler/crawler.service';
import { videoInterestsProviders } from './video-interests.providers';
import { editorsProviders } from '../editor/editor.providers';
import { SubtitlesService } from '../subtitles/subtitles.service';

describe('VideoService', () => {
  let service: VideoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
      ],
    }).compile();

    service = module.get<VideoService>(VideoService);
  });

  it('should be defined', () => {
    expect(service.test()).toBe('test');
  });
});
