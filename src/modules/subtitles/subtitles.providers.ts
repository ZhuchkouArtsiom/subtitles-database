import { Subtitles } from '../../db/models/subtitle.entity';
import { SUBTITLES_REPOSITORY } from '../../globals/constants';

export const subtitlesProviders = [
  {
    provide: SUBTITLES_REPOSITORY,
    useValue: Subtitles,
  },
];
