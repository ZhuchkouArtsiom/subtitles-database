import { MaxLength, MinLength } from 'class-validator';

export class AuthDto {
  @MinLength(1)
  @MaxLength(32)
  key: string;
  @MinLength(1)
  @MaxLength(32)
  name: string;
}
