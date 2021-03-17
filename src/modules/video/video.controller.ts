import {
  Controller,
  Get,
  Request,
  Query,
  Post,
  Body,
  UseGuards,
  Put,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { VideoService } from './video.service';
import {
  IVideo,
  IVideoData,
  IVideoWithCreator,
} from './interfaces/video.interface';
import { AuthGuard } from '@nestjs/passport';
import { VideoCreateByIdDto } from './dto/video.dto';
import { IJwtPayload } from '../auth/jwt-strategy';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('getVideoWithCreator')
  get(
    @Query('serviceId') serviceId: string,
  ): Promise<IVideoWithCreator | { message: string }> {
    return this.videoService.get(serviceId);
  }

  @Get('byTag')
  searchInYoutubeApiV3(
    @Query('tag') tag: string,
    @Query('nextPageToken') page: number,
  ): Promise<IVideoData> {
    return this.videoService.getByTag(tag.toLowerCase(), page);
  }

  @Get('byInterest')
  getByInterest(
    @Query('interest') interest: number,
    @Query('nextPageToken') page: number,
  ): Promise<IVideoData> {
    return this.videoService.getByInterest(interest, page);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('addDurationInVideo')
  addDurationInVideo(
    @Request() req: { user: IJwtPayload },
  ): Promise<{ message: string }> {
    return this.videoService.addDurationInVideo(req.user.name);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('addVideoById')
  addVideoById(
    @Body() video: VideoCreateByIdDto,
    @Request() req: { user: IJwtPayload },
  ): Promise<{ message: string }> {
    return this.videoService.addVideoById(video, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('update')
  update(@Body() video: VideoCreateByIdDto): Promise<{ message: string }> {
    return this.videoService.update(video);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete')
  delete(@Query('serviceId') serviceId: string): Promise<{ message: string }> {
    return this.videoService.delete(serviceId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('cover')
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: diskStorage({
        destination: '/var/www/data/video-covers',
        filename: (_, file, callback) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return callback(
            null,
            `${randomName}.${file.originalname.split('.').pop()}`,
          );
        },
      }),
    }),
  )
  async uploadCover(
    @Request() req,
    @UploadedFile() file,
    @Body('serviceId') serviceId: string,
  ) {
    return this.videoService.uploadCover(req, file, serviceId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('deleteCover')
  deleteCover(
    @Query('serviceId') serviceId: string,
  ): Promise<{ message: string }> {
    return this.videoService.deleteCover(serviceId);
  }
}
