import { IsNotEmpty } from 'class-validator';
import { SnippetDto } from '../../video/dto/snippet.dto';

export class StartWordDto {
  @IsNotEmpty()
  startWord: string;
}

export class VideoFromCrawler {
  readonly serviceId: string;
  readonly tag: string;
  readonly snippet: SnippetDto;
}
