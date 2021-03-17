import { Snippet } from '../../../db/models/snippet.entity';

export interface IVideo {
  id: {
    videoId: string;
  };
  tag: string;
  snippet: {
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    thumbnails: {
      high: {
        url: string;
        width: number;
        height: number;
      };
      medium: {
        url: string;
        width: number;
        height: number;
      };
      default: {
        url: string;
        width: number;
        height: number;
      };
    };
    liveBroadcastContent?: string;
    publishedAt: Date;
  };
  wordsPerMinute?: number;
  duration?: number;
}

export interface IVideoWithCreator {
  creator: string;
  serviceId: string;
  level: string;
  interestId: number;
}

export interface IVideoData {
  nextPageToken: number;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: IVideo[];
}

export interface ITrackInfo {
  name: string;
  lang: string;
}

export interface ISubtitle {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
}

export interface ISubtitlesSlicer {
  slicedSubtitles: string[];
  wordsPerMinute: number;
}

export interface ICounter {
  repeatingVideos: number;
  emptySubs: number;
  isFutureStream: number;
}

export interface IYoutubeSearchAnswer {
  kind: string;
  etag: string;
  nextPageToken: string;
  regionCode: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: {
    kind: string;
    etag: string;
    id: {
      kind: string;
      videoId: string;
    }[];
    snippet: Snippet;
  };
}
