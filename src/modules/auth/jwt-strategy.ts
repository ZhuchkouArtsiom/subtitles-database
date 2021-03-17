import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Editor } from 'src/db/models/editor.entity';
import { EDITORS_REPOSITORY } from '../../globals/constants';

export interface IJwtPayload {
  name: 'root';
  id: 1;
  iat: 1614683058;
  exp: 1617102258;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(EDITORS_REPOSITORY)
    private readonly editorsRepository: typeof Editor,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('authorization'),
      secretOrKey: process.env.JWTKEY,
    });
  }

  async validate(payload: IJwtPayload): Promise<Editor> {
    const editor = await this.editorsRepository.findOne({
      where: { name: payload.name },
      attributes: ['name', 'id'],
    });

    if (!editor) {
      throw new UnauthorizedException();
    }

    return editor;
  }
}
