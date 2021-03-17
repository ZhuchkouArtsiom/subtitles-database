import {
  Controller,
  Get,
  Request,
  Query,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { AuthGuard } from '@nestjs/passport';
import { StartWordDto } from './dto/crawler.dto';
import { IJwtPayload } from '../auth/jwt-strategy';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('crawlerWithYoutubeApi')
  crawlerWithYoutubeApiV3(
    @Request() req: { user: IJwtPayload },
    @Query('query') query: string,
    @Query('depth') depth: number,
  ): Promise<boolean | { message: string }> {
    return this.crawlerService.runCrawlerWithYoutubeApiV3(
      query.toLowerCase(),
      depth,
      req.user.name,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('headlessChromeCrawler')
  headlessChromeCrawler(
    @Request() req: { user: IJwtPayload },
    @Body() startWordDto: StartWordDto,
  ): Promise<true | { message: string }> {
    return this.crawlerService.crawlerWithHeadlessChrome(
      startWordDto.startWord,
      req.user.name,
    );
  }
}
