export class SnippetDto {
  readonly publishedAt: Date;
  readonly channelId: string;
  readonly channelTitle: string;
  readonly title: string;
  readonly description: string;
  readonly liveBroadcastContent: string;
  readonly videoId?: number;
  readonly thumbnails: {
    default: {
      url: string;
      width: number;
      height: number;
    };
    medium: {
      url: string;
      width: number;
      height: number;
    };
    high: {
      url: string;
      width: number;
      height: number;
    };
  };
}
