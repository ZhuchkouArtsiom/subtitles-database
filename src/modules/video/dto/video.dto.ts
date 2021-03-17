import {
  ArrayMinSize,
  IsOptional,
  Length,
  Max,
  Min,
  NotEquals,
} from 'class-validator';
import { YOUTUBE_VIDEO_ID_LENGTH } from '../../../globals/constants';
import { VideoFromCrawler } from '../../crawler/dto/crawler.dto';

export class VideoDto extends VideoFromCrawler {
  readonly etag: string;
  wordsPerMinute?: number;
  id?: string;
  creator: number;
  level?: string;
  priority: number;
}

export class VideoCreateByIdDto {
  @Length(YOUTUBE_VIDEO_ID_LENGTH)
  serviceId: string;
  @ArrayMinSize(1)
  interestIds: number[];
  @Length(2)
  level: string;
  @NotEquals(0)
  @NotEquals('0')
  priority?: number;
}
