import { Injectable, Inject, HttpException } from '@nestjs/common';
import { Repository } from 'sequelize-typescript';
import axios from 'axios';
import * as sharp from 'sharp';
import * as fs from 'fs';
import { decode } from 'he';
import sequelize from 'sequelize';

import { Video } from '../../db/models/video.entity';
import { VideoSubtitles } from '../../db/models/video-subtitles.entity';
import { VideoCreateByIdDto, VideoDto } from './dto/video.dto';
import {
  SUBTITLES_REPOSITORY,
  VIDEO_REPOSITORY,
  VIDEO_SUBTITLES_REPOSITORY,
  SNIPPET_REPOSITORY,
  VIDEO_INTERESTS_REPOSITORY,
  EDITORS_REPOSITORY,
} from '../../globals/constants';
import { Subtitles } from '../../db/models/subtitle.entity';
import { Snippet } from '../../db/models/snippet.entity';
import {
  IVideo,
  IVideoData,
  ICounter,
  IYoutubeSearchAnswer,
  IVideoWithCreator,
} from './interfaces/video.interface';
import { VideoInterest } from '../../db/models/video-interest.entity';
import { Editor } from '../../db/models/editor.entity';
import { VideoFromCrawler } from '../crawler/dto/crawler.dto';
import { SubtitlesService } from '../subtitles/subtitles.service';

const minWordsPerMinute = '30';
const resultsPerPage = 50;
const eminemRecord = '458';

@Injectable()
export class VideoService {
  constructor(
    @Inject(VIDEO_REPOSITORY)
    private readonly videoRepository: Repository<Video>,
    @Inject(VIDEO_INTERESTS_REPOSITORY)
    private readonly videoInterestsRepository: Repository<VideoInterest>,
    @Inject(VIDEO_SUBTITLES_REPOSITORY)
    private readonly videoSubtitlesRepository: Repository<VideoSubtitles>,
    @Inject(SUBTITLES_REPOSITORY)
    private readonly subtitlesRepository: Repository<Subtitles>,
    @Inject(SNIPPET_REPOSITORY)
    private readonly snippetRepository: Repository<Snippet>,
    @Inject(EDITORS_REPOSITORY)
    private readonly editorRepository: Repository<Editor>,
    private readonly subtitlesService: SubtitlesService,
  ) {}

  async getByInterest(interestId: number, page = 0): Promise<IVideoData> {
    console.log('request');
    page = +page;
    const videos = await this.videoRepository.findAll<Video>({
      offset: page * resultsPerPage,
      limit: resultsPerPage,
      include: [
        {
          model: VideoInterest,
          right: false,
          where: {
            interestId,
          },
        },
        {
          model: Snippet,
          right: false,
        },
      ],
    });

    const videosResult = videos.map((video) => {
      return this.videoMappingFromDatabaseToClient(video);
    });

    return this.pagitedVideoResult(videosResult, page);
  }

  async getByTag(tag: string, page = 0): Promise<IVideoData> {
    page = +page;
    const res = await this.videoRepository.findAll<Video>({
      offset: page * resultsPerPage,
      limit: resultsPerPage,
      where: {
        tag: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('tag')),
          'LIKE',
          tag,
        ),
        wordsPerMinute: sequelize.where(
          sequelize.fn('', sequelize.col('wordsPerMinute')),
          '>',
          minWordsPerMinute,
        ),
        eminemRecordMax: sequelize.where(
          sequelize.fn('', sequelize.col('wordsPerMinute')),
          '<',
          eminemRecord,
        ),
      },
      include: [Snippet],
    });

    const videoIdForElangTvInstruction = 'xLTdy6PfotA';
    const videos = [];

    for (let i = 0; i < res.length; i++) {
      const video = this.videoMappingFromDatabaseToClient(res[i]);

      if (res[i].serviceId === videoIdForElangTvInstruction) {
        videos.unshift(video);
      } else if (res[i].snippet.liveBroadcastContent === 'none') {
        videos.push(video);
      }
    }

    return this.pagitedVideoResult(videos, page);
  }

  pagitedVideoResult(videos: IVideo[], page: number): IVideoData {
    return {
      nextPageToken: page + 1,
      pageInfo: {
        totalResults: 1000000,
        resultsPerPage,
      },
      items: videos,
    };
  }

  videoMappingFromDatabaseToClient(video: Video): IVideo {
    return {
      id: {
        videoId: video.serviceId,
      },
      tag: video.tag,
      snippet: {
        title: video.snippet.title,
        description: video.snippet.description,
        channelId: video.snippet.channelId,
        channelTitle: video.snippet.channelTitle,
        thumbnails: video.snippet.thumbnails,
        liveBroadcastContent: video.snippet.liveBroadcastContent,
        publishedAt: video.snippet.publishedAt,
      },
      wordsPerMinute: video.wordsPerMinute,
      duration: video.duration,
    };
  }

  videoMappingFromYoutubeApiToDatabase(
    video: any,
    tag = 'tag',
    isSearch = false,
    creator = 1,
    level: string = null,
    priority = 999999,
  ): VideoDto {
    return {
      serviceId: isSearch ? video.id.videoId : video.id,
      etag: video.etag,
      tag,
      snippet: video.snippet,
      creator,
      level,
      priority,
    };
  }

  async update(
    videoUpdateData: VideoCreateByIdDto,
  ): Promise<{ message: string }> {
    try {
      const { serviceId, interestIds } = videoUpdateData;

      const updatedVideo = await this.videoRepository.update(videoUpdateData, {
        where: {
          serviceId,
        },
        returning: true,
      });

      const videoId = updatedVideo[1][0].id;
      await this.videoInterestsRepository.destroy({
        where: { videoId },
      });

      await this.createVideoInterests(interestIds, videoId);

      return { message: 'VIDEO_HAS_BEEN_UPDATED' };
    } catch (e) {
      console.log(e);
      return { message: 'ERROR' };
    }
  }

  async delete(serviceId: string): Promise<{ message: string }> {
    try {
      const deleted = await this.videoRepository.destroy({
        where: { serviceId },
      });

      if (deleted) {
        return { message: 'VIDEO_HAS_BEEN_DELETED' };
      }

      return { message: 'ERROR: VIDEO IS NOT DELETED' };
    } catch (e) {
      console.log(e);
      return { message: 'ERROR' };
    }
  }

  async get(
    serviceId: string,
  ): Promise<IVideoWithCreator | { message: string }> {
    const video = await this.editorRepository.findOne({
      attributes: ['name'],
      include: [
        {
          model: Video,
          right: false,
          where: {
            serviceId,
          },
          attributes: ['serviceId', 'level'],
          include: [
            {
              model: VideoInterest,
              right: false,
              attributes: ['interestId'],
            },
          ],
        },
      ],
    });

    if (!video) return { message: 'VIDEO_IS_NOT_FOUND' };

    const videoInfo = video.video[0];

    return {
      creator: video.name,
      serviceId: videoInfo.serviceId,
      level: videoInfo.level,
      interestId: videoInfo.videoInterest[0].interestId,
    };
  }

  async createVideo(
    video: VideoDto | VideoFromCrawler,
    counter: ICounter,
    interestIds: number[] = [],
  ): Promise<boolean> {
    try {
      const videoData = await this.videoRepository.findOrCreate<Video>({
        where: { serviceId: video.serviceId },
        defaults: video,
      });

      const isVideoAllreadyAdded = !videoData[videoData.length - 1];
      const { dataValues } = videoData[0];

      if (isVideoAllreadyAdded) {
        return false;
      }

      const snippet = { ...video.snippet, videoId: dataValues.id };
      await this.snippetRepository.findOrCreate<Snippet>({
        where: { videoId: dataValues.id },
        defaults: snippet,
      });
      const videoId = dataValues.id;
      await this.createVideoInterests(interestIds, videoId);
      const res = await this.subtitlesService.createSubtitles(
        dataValues,
        counter,
      );

      if (!res) {
        await this.videoRepository.destroy<Video>({
          where: { serviceId: video.serviceId },
        });
        return false;
      }

      return res;
    } catch (e) {
      const isUnuqueError = e.errors[0].message === 'serviceId must be unique';
      if (!isUnuqueError) {
        console.log(e, 'error');
      }
      console.log(e);
      return false;
    }
  }

  async createVideoInterests(
    interestIds: number[],
    videoId: number,
  ): Promise<VideoInterest[]> {
    const interests = interestIds.map((interestId) => {
      return { videoId, interestId };
    });
    return await this.videoInterestsRepository.bulkCreate<VideoInterest>(
      interests,
    );
  }

  test(): string {
    return 'test';
  }

  async getSearchResults(
    keyword: string,
    nextPageToken = '',
    counter: ICounter,
  ): Promise<IYoutubeSearchAnswer | false> {
    try {
      const filteredIds = [];

      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&relevanceLanguage=en&type=video&videoEmbeddable=true&videoCaption=closedCaption&q=${encodeURI(
          keyword,
        )}&key=${process.env.YOUTUBE_KEY}&pageToken=${nextPageToken}`,
      );
      const { data } = response;
      const ids = [];
      for (const item of data.items) {
        ids.push(item.id.videoId);
      }
      const idsToCheck = ids.map((id) => {
        return this.subtitlesService.checkLangSubs(id);
      });
      const responses = await Promise.all(idsToCheck);
      for (let i = 0; i < ids.length; i++) {
        if (responses[i]) {
          const item = data.items[i];
          item.snippet.title = decode(item.snippet.title);
          item.snippet.etag = data.etag;
          filteredIds.push(item);
        }
      }

      return { ...data, items: filteredIds };
    } catch (e) {
      counter.isFutureStream += 1;
      return false;
    }
  }

  async addDurationInVideo(name: string): Promise<{ message: string }> {
    try {
      if (name !== 'root') return { message: 'ONLY_ROOT_CAN_ADD_DURATION' };
      const videos = await this.videoRepository.findAll<Video>({
        where: {
          wordsPerMinute: sequelize.where(
            sequelize.fn('', sequelize.col('wordsPerMinute')),
            '>',
            '1',
          ),
          duration: sequelize.where(
            sequelize.fn('', sequelize.col('duration')),
            '=',
            '0',
          ),
        },
        include: [
          {
            model: VideoSubtitles,
            right: false,
            include: [
              {
                model: Subtitles,
                right: false,
              },
            ],
          },
        ],
        raw: false,
      });
      for await (const video of videos) {
        const subtitle = video.videoSubtitles[0].subtitles;
        const duration = subtitle[subtitle.length - 1].endTime;
        await this.videoRepository.update(
          { duration },
          {
            where: {
              id: video.id,
            },
          },
        );
      }
      return { message: 'DURATION_HAS_BEEN_ADDED' };
    } catch (e) {
      console.log(e);
      return { message: 'ERROR' };
    }
  }

  async addVideoById(
    video: VideoCreateByIdDto,
    creatorId: number,
  ): Promise<{ message: string }> {
    try {
      const { serviceId, interestIds, level, priority } = video;

      const isHaveVideo = await this.videoRepository.findOne<Video>({
        where: { serviceId },
      });

      if (isHaveVideo) {
        return { message: 'VIDEO_ALLREADY_ADDED' };
      }

      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?id=${serviceId}&part=snippet&key=${process.env.YOUTUBE_KEY}`,
      );

      const videoDto = this.videoMappingFromYoutubeApiToDatabase(
        response.data.items[0],
        'tag',
        false,
        creatorId,
        level,
        priority,
      );
      const counter = {
        repeatingVideos: 0,
        emptySubs: 0,
        isFutureStream: 0,
      };

      const res = await this.createVideo(videoDto, counter, interestIds);
      return {
        message: res ? 'VIDEO_HAS_BEEN_ADDED' : 'ERROR',
      };
    } catch (e) {
      console.log(e);
    }
  }

  async updateSnippet(serviceId, updatedForSnippet) {
    try {
      const video = await this.videoRepository.findOne({
        where: { serviceId },
      });

      if (!video) {
        return false;
      }

      const { id } = video;

      const updatedSnippet = await this.snippetRepository.update(
        updatedForSnippet,
        { where: { videoId: id } },
      );

      return updatedSnippet;
    } catch (e) {
      console.log(e);
      throw new HttpException('ERROR', 400);
    }
  }

  async uploadCover(req, file, serviceId): Promise<{ message: string }> {
    try {
      const maxCoverSize = 10000000; //bytes
      const supportedFormats = ['jpg', 'png', 'jpeg'];
      const { filename } = req.file;
      const format = filename.substr(filename.length - 3, filename.length);
      if (!req.file) {
        return { message: 'NO_COVER_FILE' };
      }

      if (req.file.size > maxCoverSize) {
        return { message: 'TO_LARGE_COVER' };
      }

      if (!supportedFormats.includes(format)) {
        return { message: 'FORMAT_NOT_SUPPORTED' };
      }

      const res = await this.updateSnippet(serviceId, { cover: filename });

      if (!res) {
        return { message: 'VIDEO_IS_NOT_FOUND' };
      }

      await sharp(file.path)
        .resize({ width: 434, height: 244 })
        .toBuffer((_, buf) =>
          fs.writeFile(file.path, buf, () => {
            console.log('save');
          }),
        );

      return {
        message: 'COVER_HAS_BEEN_UPLOADED',
      };
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async deleteCover(serviceId): Promise<{ message: string }> {
    const res = await this.updateSnippet(serviceId, { cover: null });

    if (!res) {
      return {
        message: 'VIDEO_NOT_FOUND',
      };
    }

    return {
      message: 'COVER_HAS_BEEN_REMOVED',
    };
  }
}
