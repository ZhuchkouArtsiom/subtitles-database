import { Length } from 'class-validator';
import { YOUTUBE_VIDEO_ID_LENGTH } from '../../../globals/constants';

export class getSubtitlesByVideoIdDto {
  @Length(YOUTUBE_VIDEO_ID_LENGTH)
  videoId: string;
  lang?: string;
}

export class subtitles {
  startTime: number;
  endTime: number;
  text: string;
  id: number;
}

export class subtitlesDto {
  id: string;
  lang: string;
  subtitles: subtitles[];
}
