import { Editor } from '../../db/models/editor.entity';
import { EDITORS_REPOSITORY } from '../../globals/constants';

export const editorsProviders = [
  {
    provide: EDITORS_REPOSITORY,
    useValue: Editor,
  },
];
