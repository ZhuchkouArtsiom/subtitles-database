import { Inject, Injectable } from '@nestjs/common';
import { EDITORS_REPOSITORY } from '../../globals/constants';
import { Editor } from '../../db/models/editor.entity';
import { AuthDto } from '../auth/dto/auth.dto';

@Injectable()
export class EditorsService {
  constructor(
    @Inject(EDITORS_REPOSITORY)
    private readonly editorsRepository: typeof Editor,
  ) {}

  async createEditor(authDto: AuthDto): Promise<Editor> {
    return this.editorsRepository.create(authDto);
  }

  async findByName(name: string): Promise<Editor> {
    return this.editorsRepository.findOne({
      where: { name },
    });
  }
}
