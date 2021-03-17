import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt-strategy';
import { EditorsService } from '../editor/editor.service';
import { EDITORS_REPOSITORY } from '../../globals/constants';
import { Editor } from '../../db/models/editor.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWTKEY,
      signOptions: {
        expiresIn: 5184000, // 2 months
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    EditorsService,
    {
      provide: EDITORS_REPOSITORY,
      useValue: Editor,
    },
  ],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
