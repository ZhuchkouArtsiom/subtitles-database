import { Module } from '@nestjs/common';
import { EditorsService } from './editor.service';
import { EDITORS_REPOSITORY } from '../../globals/constants';
import { Editor } from 'src/db/models/editor.entity';

@Module({
  providers: [
    EditorsService,
    {
      provide: EDITORS_REPOSITORY,
      useValue: Editor,
    },
  ],
})
export class EditorModule {}
