import { MinLength, IsNumber } from 'class-validator';
import { SnippetDto } from '../../video/dto/snippet.dto';

export class InterestsDto {
  id: number;
}

export class InterestsUpdateDto extends InterestsDto {
  @MinLength(1)
  name: string;
}

export class InterestsCreateDto extends InterestsUpdateDto {
  @IsNumber()
  parent: number;
}

interface Video {
  serviceId: string;
  duration: number;
  path: number[];
  interest: string;
  title: string;
  description: string;
  thumbnails: SnippetDto['thumbnails'];
  cover: string;
}

export interface InterestsWithVideos {
  [key: string]: Video;
}
