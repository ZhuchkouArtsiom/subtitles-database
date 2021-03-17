import { Video } from '../../db/models/video.entity';
import { VIDEO_REPOSITORY } from '../../globals/constants';

export const videoProviders = [
  {
    provide: VIDEO_REPOSITORY,
    useValue: Video,
  },
];
