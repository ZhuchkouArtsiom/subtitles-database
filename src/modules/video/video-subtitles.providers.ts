import { VideoSubtitles } from '../../db/models/video-subtitles.entity';
import { VIDEO_SUBTITLES_REPOSITORY } from '../../globals/constants';

export const videoSubtitlesProviders = [
  {
    provide: VIDEO_SUBTITLES_REPOSITORY,
    useValue: VideoSubtitles,
  },
];
