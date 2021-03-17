import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InterestsService } from './interests.service';
import {
  InterestsCreateDto,
  InterestsDto,
  InterestsUpdateDto,
  InterestsWithVideos,
} from './dto/interests.dto';
import { Interests } from '../../db/models/interest.entity';
import { IJwtPayload } from '../auth/jwt-strategy';

@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('all')
  getAll(): Promise<{ interests: Interests[] }> {
    return this.interestsService.getAll();
  }

  @Get('allWithVideos')
  getAllWithVideos(): Promise<InterestsWithVideos> {
    return this.interestsService.getAllWithVideos();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('one')
  get(@Query() interest: InterestsDto): Promise<{ interests: Interests }> {
    return this.interestsService.get(interest.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  create(
    @Body() interest: InterestsCreateDto,
    @Request() req: { user: IJwtPayload },
  ): Promise<{ message: string; id: number; name: string }> {
    return this.interestsService.create(interest, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('update')
  update(@Body() interest: InterestsUpdateDto): Promise<{ message: string }> {
    return this.interestsService.update(interest);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete')
  delete(@Body() interest: InterestsDto): Promise<{ message: string }> {
    return this.interestsService.delete(interest.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('getParents')
  getParents(@Query('id') id: number): Promise<Interests[]> {
    return this.interestsService.getParents(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('getChildrens')
  getChildrens(@Query('id') id: number): Promise<Interests[]> {
    return this.interestsService.getChildrens(id);
  }
}
