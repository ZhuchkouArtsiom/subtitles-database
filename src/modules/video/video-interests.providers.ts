import { VideoInterest } from '../../db/models/video-interest.entity';
import { VIDEO_INTERESTS_REPOSITORY } from '../../globals/constants';

export const videoInterestsProviders = [
  {
    provide: VIDEO_INTERESTS_REPOSITORY,
    useValue: VideoInterest,
  },
];
