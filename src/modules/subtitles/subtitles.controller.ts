import { Controller, Get, Query } from '@nestjs/common';
import { SubtitlesService } from './subtitles.service';
import { getSubtitlesByVideoIdDto, subtitlesDto } from './dto/subtitles.dto';

@Controller('subtitles')
export class SubtitlesController {
  constructor(private readonly subtitlesService: SubtitlesService) {}

  @Get()
  get(@Query() query: getSubtitlesByVideoIdDto): Promise<any> {
    return this.subtitlesService.get(query.videoId);
  }

  @Get('getByLang')
  getByLang(
    @Query() query: getSubtitlesByVideoIdDto,
  ): Promise<subtitlesDto | subtitlesDto[] | { message: string }> {
    return this.subtitlesService.getByLang(query.videoId, query?.lang);
  }
}
