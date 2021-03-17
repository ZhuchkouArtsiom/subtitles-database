import { Interests } from '../../db/models/interest.entity';
import { INTERESTS_REPOSITORY } from '../../globals/constants';

export const interestsProviders = [
  {
    provide: INTERESTS_REPOSITORY,
    useValue: Interests,
  },
];
