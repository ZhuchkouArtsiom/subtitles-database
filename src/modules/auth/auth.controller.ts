import {
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { IJwtPayload } from './jwt-strategy';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() authDto: AuthDto): Promise<{ token: string; name: string }> {
    return this.authService.loginUser(authDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('register')
  @HttpCode(200)
  register(
    @Body() authDto: AuthDto,
    @Request() req: { user: IJwtPayload },
  ): Promise<{ message: string; name?: string }> {
    return this.authService.registerEditor(authDto, req?.user?.name);
  }
}
