import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  SUBTITLES_REPOSITORY,
  VIDEO_REPOSITORY,
  VIDEO_SUBTITLES_REPOSITORY,
} from '../../globals/constants';
import { Repository } from 'sequelize-typescript';
import { Subtitles } from '../../db/models/subtitle.entity';
import { VideoSubtitles } from '../../db/models/video-subtitles.entity';
import { Video } from '../../db/models/video.entity';
import { Sequelize } from 'sequelize-typescript';
import { subtitlesDto } from './dto/subtitles.dto';
import {
  ICounter,
  ISubtitle,
  ISubtitlesSlicer,
  ITrackInfo,
} from '../video/interfaces/video.interface';
import { XML } from 'sxml';
import * as parser from 'subtitles-parser-vtt';

@Injectable()
export class SubtitlesService {
  constructor(
    @Inject(SUBTITLES_REPOSITORY)
    private readonly subtitlesRepository: Repository<Subtitles>,
    @Inject(VIDEO_REPOSITORY)
    private readonly videosRepository: Repository<Video>,
    @Inject(VIDEO_SUBTITLES_REPOSITORY)
    private readonly videoSubtitlesRepository: Repository<VideoSubtitles>,
  ) {}

  async get(serviceId: string): Promise<any> {
    this.clickToVideoIncrement(serviceId);

    const allSubtitles = await this.videosRepository.findOne({
      where: {
        serviceId,
      },
      include: [
        {
          model: VideoSubtitles,
          right: false,
          attributes: ['id', 'lang'],
          include: [
            {
              model: Subtitles,
              right: false,
              order: [Sequelize.literal('startTime')],
              attributes: ['startTime', 'endTime', 'text'],
            },
          ],
        },
      ],
      order: [Sequelize.literal('"videoSubtitles->subtitles"."id"')],
    });

    allSubtitles.videoSubtitles.forEach((subtitle) => {
      this.addIdsToSubtitles(subtitle.subtitles);
    });

    return allSubtitles.videoSubtitles;
  }

  addIdsToSubtitles(subs: Subtitles[]): Subtitles[] {
    subs.forEach((elem, i) => (elem.id = i + 1));
    return subs;
  }

  async getByLang(
    serviceId: string,
    to: string = null,
  ): Promise<subtitlesDto | subtitlesDto[] | { message: string }> {
    try {
      if (!to) return await this.get(serviceId);

      this.clickToVideoIncrement(serviceId);

      const video = await this.videosRepository.findAll({
        where: {
          serviceId,
        },
        include: [
          {
            model: VideoSubtitles,
            right: false,
            attributes: ['id', 'lang'],
            include: [
              {
                model: Subtitles,
                right: false,
                attributes: ['startTime', 'endTime', 'text'],
              },
            ],
          },
        ],
        order: [Sequelize.literal('"videoSubtitles->subtitles"."id"')],
      });

      if (!video.length) {
        return {
          message: 'VIDEO_NOT_FOUND',
        };
      }

      const subtitlesByLang = video[0].videoSubtitles.filter(
        (subtitle) => subtitle.lang === to,
      );

      if (subtitlesByLang[0]) {
        this.addIdsToSubtitles(subtitlesByLang[0].subtitles);
        return subtitlesByLang[0];
        return;
      }

      const subs = video[0].videoSubtitles;

      if (!subs) return { message: 'SUBTITLES_NOT_FOUND' };

      const englishSubs = subs.filter((sub) => sub.lang.slice(0, 2) === 'en');
      const subsToTranslate = englishSubs[0] ? englishSubs[0] : subs[0];

      const url = `${process.env.LANG_API_URL_DEV}/api/translation/backDoor/subsTranslation`;
      const translatedSubs = await axios.post(url, {
        ...subsToTranslate.dataValues,
        key: 'STV0A7uPfX1H',
        to,
      });

      const { id } = await this.videosRepository.findOne({
        where: {
          serviceId,
        },
      });

      const videoSubtitles = await this.videoSubtitlesRepository.create<VideoSubtitles>(
        {
          lang: to,
          videoId: id,
        },
      );

      const videoSubtitleId = videoSubtitles.id;

      const subtitlesToDatabase = [];

      translatedSubs.data.subtitles.forEach((subtitle) => {
        const { startTime, endTime, text } = subtitle;
        subtitlesToDatabase.push({
          startTime,
          endTime,
          text,
          videoSubtitleId,
        });
      });

      this.subtitlesRepository.bulkCreate<Subtitles>(subtitlesToDatabase);

      this.addIdsToSubtitles(translatedSubs.data.subtitles);
      translatedSubs.data.id = videoSubtitleId;
      return translatedSubs.data;
    } catch (e) {
      console.log(e);
      return e;
    }
  }

  async createSubtitles(video: Video, counter: ICounter): Promise<boolean> {
    try {
      let subtitlesData = await this.getSubtitles(video.serviceId);

      if (!subtitlesData || !subtitlesData[0]) {
        counter.emptySubs += 1;
        return false;
      }

      const englishSubtitles = subtitlesData.filter(
        (subtitle) => subtitle.lang.substr(0, 2) === 'en',
      )[0].subtitles;

      const { wordsPerMinute } = this.subtitleSlicer(englishSubtitles);
      video.wordsPerMinute = wordsPerMinute || null;

      if (video.wordsPerMinute) {
        await this.videosRepository.upsert<Video>(video);
      }

      subtitlesData = subtitlesData.filter(
        (subtitle) => subtitle.subtitles.length !== 0,
      );

      const videoSubs = subtitlesData.map((subtitle) => {
        return {
          lang: subtitle.lang,
          videoId: video.id,
        };
      });

      const videoSubtitlesData = await this.videoSubtitlesRepository.bulkCreate<VideoSubtitles>(
        videoSubs,
      );

      const allAvailablesSubtitles = [];

      subtitlesData.forEach((subtitles) => {
        const lang: string = subtitles.lang;
        let videoSubtitleId: number;

        videoSubtitlesData.forEach((data) => {
          if (lang === data.lang) {
            videoSubtitleId = data.id;
          }
        });

        subtitles.subtitles.forEach((subtitle) => {
          allAvailablesSubtitles.push({
            videoSubtitleId,
            text: subtitle.text,
            startTime: subtitle.startTime,
            endTime: subtitle.endTime,
          });
        });
      });

      await this.subtitlesRepository.bulkCreate<Subtitles>(
        allAvailablesSubtitles,
      );

      return true;
    } catch (e) {
      console.log(e, 'error');
      return false;
    }
  }

  subtitleSlicer(subtitles: ISubtitle[]): ISubtitlesSlicer {
    let endTime: number;
    const reducer = (accumulator, sub) => {
      if (sub.text[0] === '(') return accumulator;

      const splitedText = sub.text.split(/[\n.,'\s\-]/gi);
      const filteredText = [];

      for (let i = 0; i < splitedText.length; i++) {
        if (splitedText[i] !== '' && splitedText[i][0] !== '(') {
          filteredText.push(splitedText[i]);
          endTime = sub.endTime;
        }
      }

      return accumulator.concat(filteredText);
    };

    const slicedSubtitles = subtitles.reduce(reducer, []);
    const wordsPerMinute = endTime
      ? Math.round(slicedSubtitles.length / (endTime / 60))
      : 0;
    return { slicedSubtitles, wordsPerMinute };
  }

  async getSubtitles(
    id: string,
  ): Promise<{ subtitles: Subtitles[]; lang: string }[] | false> {
    try {
      const subtitles = [];
      const list = await this.getListSubtitles(id);
      if (!list) return false;
      const arrFetch = list.map((tr, index) => {
        return this.getOneLangSubtitles(
          `https://www.youtube.com/api/timedtext?fmt=vtt&v=${id}&lang=${tr.lang}&name=${tr.name}`,
          tr.lang,
          tr.name,
          index,
        );
      });
      const responses = await Promise.all(arrFetch);
      responses.forEach((resp) => {
        subtitles.push(resp);
      });
      return subtitles;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async getListSubtitles(id: string): Promise<ITrackInfo[] | false> {
    try {
      const res = await axios.get(
        'https://www.youtube.com/api/timedtext?type=list&v=' + id,
      );
      const reg = /name=\"([a-zA-Z0-9_-]*)\" lang_code=\"([a-zA-Z0-9_-]+)\"/gim;
      let result;
      const trackInfo: ITrackInfo[] = [];
      while ((result = reg.exec(res.data))) {
        trackInfo.push({
          name: result[1],
          lang: result[2],
        });
      }
      return trackInfo;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async getOneLangSubtitles(
    url: string,
    lang: string,
    name: string,
    id: number,
  ): Promise<
    { lang: string; subtitles: string; name: string; id: number } | false
  > {
    try {
      const response = await axios.get(url);
      const subtitleParse = parser.fromSrt(response.data, 's');
      return { lang, subtitles: subtitleParse, name, id };
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async langSubsRequest(id: string): Promise<string | false> {
    try {
      const response = await axios.get(
        `http://video.google.com/timedtext?type=list&v=${id}`,
      );
      return response.data;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async checkLangSubs(id: string): Promise<boolean> {
    try {
      const langCodes = ['en', 'en-US', 'en-GB'];
      const resp = await this.langSubsRequest(id);
      if (!resp || resp.indexOf('track') === -1) return false;

      const xml: XML = new XML(resp);
      const xmlList = xml.get('track');
      for (let i = 0; i < xmlList.size(); i++) {
        if (langCodes.includes(xmlList.at(i).getProperty('lang_code'))) {
          return true;
        }
      }
    } catch (e) {
      console.log(e, 'error');
      return false;
    }
  }

  async clickToVideoIncrement(serviceId): Promise<{ message: string }> {
    try {
      const updatedVideo = await this.videosRepository.increment('clicks', {
        where: { serviceId },
      });

      console.log(updatedVideo);

      return {
        message: 'INCREMENT_COMPLETE',
      };
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
