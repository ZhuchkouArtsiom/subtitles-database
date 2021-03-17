import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { EDITORS_REPOSITORY } from '../../globals/constants';
import * as jwt from 'jsonwebtoken';
import { Editor } from '../../db/models/editor.entity';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { EditorsService } from '../editor/editor.service';

const expiresIn = 2419200; // seconds (1 month)

@Injectable()
export class AuthService {
  jwtSecret: string;

  constructor(
    @Inject(EDITORS_REPOSITORY)
    private readonly editorsRepository: typeof Editor,
    private readonly editorsService: EditorsService,
  ) {
    this.jwtSecret = process.env.JWTKEY;
  }

  async registerEditor(
    authDto: AuthDto,
    name: string,
  ): Promise<{ message: string; name?: string }> {
    if (name !== 'root')
      return {
        message: 'ONLY_ROOT_CAN_REGISTER_EDITORS',
      };

    const user = await this.editorsService.findByName(authDto.name);

    if (user) {
      throw new HttpException('ALREADY_REGISTERED', 409);
    }

    authDto.key = await this.genHash(authDto.key);

    console.log(authDto);

    const newEditor: Editor = await this.editorsService.createEditor(authDto);

    console.log(newEditor);
    if (!newEditor) {
      throw new InternalServerErrorException();
    }

    return {
      message: 'EDITOR_CREATED',
      name: newEditor.name,
    };
  }

  private createToken(name: string, id: number): string {
    return jwt.sign({ name, id }, this.jwtSecret, { expiresIn });
  }

  private async genHash(key: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(key, salt);
  }

  async loginUser(authDto: AuthDto): Promise<{ token: string; name: string }> {
    const editor: Editor = await this.editorsService.findByName(authDto.name);

    if (!editor) {
      throw new HttpException('DOES_NOT_EXIST', 400);
    }

    const isMatch: boolean = await bcrypt.compare(authDto.key, editor.key);

    const { name, id } = editor;
    console.log(name, id);

    if (isMatch) {
      return {
        token: this.createToken(name, id),
        name,
      };
    } else {
      throw new HttpException('WRONG_PASS', 401);
    }
  }
}
