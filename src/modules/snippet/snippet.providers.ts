import { Snippet } from '../../db/models/snippet.entity';
import { SNIPPET_REPOSITORY } from '../../globals/constants';

export const snippetProviders = [
  {
    provide: SNIPPET_REPOSITORY,
    useValue: Snippet,
  },
];
