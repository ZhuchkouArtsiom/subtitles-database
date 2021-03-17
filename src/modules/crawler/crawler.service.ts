import { HttpException, Injectable } from '@nestjs/common';
import vocabular from '../../db/static/en';
import { VideoService } from '../video/video.service';
import { ICounter } from '../video/interfaces/video.interface';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const puppeteer = require('puppeteer');
import { Page } from 'puppeteer';
import { VideoFromCrawler } from './dto/crawler.dto';

const CRAWLER = {
  URL: 'https://youtube.com',
  TIMEOUT: 180000, // 3 minutes
  LINK_COUNTER: 500,
};

@Injectable()
export class CrawlerService {
  constructor(private videoService: VideoService) {}

  async crawlerWithHeadlessChrome(
    startWord: string,
    name: string,
  ): Promise<true | { message: string }> {
    if (name !== 'root') return { message: 'ONLY_ROOT_CAN_RUN_CRAWLER' };
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: false,
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1024,
      height: 768,
    });

    for (const word in vocabular) {
      if (startWord) {
        if (word === startWord) {
          startWord = null;
        }
        continue;
      }

      console.log(
        `<<<<<<<<<<<<< START PARSE NEW WORD, RANK:${vocabular[word].rank}, WORD:${word} >>>>>>>>>>>>>>>>>>>`,
      );
      const videos = await this.run(word, page);
      console.log(videos, '<<<<<<<<<<<< VIDEOS AFTER CRAWLING');
      const logs: boolean[] = [];
      const counter = {
        repeatingVideos: 0,
        emptySubs: 0,
        isFutureStream: 0,
      };

      for await (const video of videos) {
        console.log('pause start');
        await this.pause();
        console.log('pause end');
        const res = await this.videoService.createVideo(video, counter);
        logs.push(res);
      }

      console.log(logs);
    }
    return true;
  }

  async crawlerWithYoutubeApiV3(
    query: string,
    pageToken = '',
    ids: string[],
    counter: ICounter,
  ): Promise<{ token: string; logs: boolean[] } | false> {
    try {
      const logs: boolean[] = [];
      const res = await this.videoService.getSearchResults(
        query,
        pageToken,
        counter,
      );

      let nextPageToken: string;
      let items;

      if (res) {
        nextPageToken = res.nextPageToken;
        items = res.items;
      }

      for await (const video of items) {
        const videoDto = this.videoService.videoMappingFromYoutubeApiToDatabase(
          video,
          query,
          true,
        );

        const res = await this.videoService.createVideo(videoDto, counter);
        logs.push(res);
      }
      console.log('complete');
      return { token: nextPageToken, logs };
    } catch (e) {
      console.log(e, 'error');
      return false;
    }
  }

  async runCrawlerWithYoutubeApiV3(
    query: string,
    depth = 10,
    name: string,
  ): Promise<boolean | { message: string }> {
    try {
      if (name !== 'root') return { message: 'ONLY_ROOT_CAN_RUN_CRAWLER' };
      const ids: string[] = [];
      const counter: ICounter = {
        repeatingVideos: 0,
        emptySubs: 0,
        isFutureStream: 0,
      };
      let finalLogs: boolean[] = [];
      let nextPageToken = '';
      for (let i = 0; i < depth; i++) {
        console.log('crawlerdepth ', i + 1);
        const res = await this.crawlerWithYoutubeApiV3(
          query,
          nextPageToken,
          ids,
          counter,
        );
        let token: string;
        let logs: boolean[];
        if (res) {
          token = res.token;
          logs = res.logs;
        }

        nextPageToken = token;
        finalLogs = finalLogs.concat(logs);
      }
      console.log('final log', finalLogs);
      let trues = 0;
      let falses = 0;

      finalLogs.forEach((log) => {
        if (log) {
          trues++;
        } else {
          falses++;
        }
      });
      console.log(trues, 'trues');
      console.log(falses, 'falses');
      console.log(counter.repeatingVideos, 'counter of retrys services ids');
      console.log(counter.emptySubs, 'counter emptySubs');
      return true;
    } catch (e) {
      console.log(e, 'error');
      return false;
    }
  }

  async pause(): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(function () {
        resolve('Success!');
      }, 10000);
    });
  }

  async run(query: string, page: Page): Promise<VideoFromCrawler[]> {
    try {
      const videos = await this.runHeadlessChrome(query, page);
      return videos;
    } catch (e) {
      console.log(e);
      throw new HttpException('NETWORK_ERROR', 400);
    }
  }

  async runHeadlessChrome(
    query: string,
    page: Page,
  ): Promise<VideoFromCrawler[]> {
    await page.goto(
      `https://www.youtube.com/results?search_query=${query}&sp=EgIoAQ%253D%253D`,
      {
        waitUntil: 'load',
      },
    );

    console.log('LOAD PAGE OF HEADLESS CHROME');
    const startTimeParse = Date.now();
    const videos = await this.getLinks(page, startTimeParse, query);
    return videos;
  }

  async mouseMoveToSearchFieldAndMakeRequest(
    page: Page,
    word: string,
  ): Promise<void> {
    const searchField = await page.$('#search-input');
    const searchButton = await page.$('#search-icon-legacy');
    await searchField.click();
    await page.keyboard.type(word);
    await searchButton.click();
  }

  async getLinks(
    page: Page,
    startTimeParse: number,
    query: string,
    linksCounter = 0,
  ): Promise<VideoFromCrawler[]> {
    const timeNow = Date.now();
    await this.spinTheWheel(page);
    linksCounter = await page.evaluate(() => {
      return document.querySelectorAll('#dismissable').length;
    });
    if (
      linksCounter < CRAWLER.LINK_COUNTER &&
      timeNow < startTimeParse + CRAWLER.TIMEOUT
    ) {
      return this.getLinks(page, startTimeParse, query, linksCounter);
    }

    await page.waitFor(2000);

    const videos = await this.spinTheWheelAndGetVideos(page, query);
    return videos;
  }

  async spinTheWheelAndGetVideos(
    page: Page,
    tag: string,
  ): Promise<VideoFromCrawler[]> {
    const videos = await page.evaluate((tag) => {
      const videosWithSubtitles = [];

      const videosBlocks = document.querySelectorAll('#dismissable');

      videosBlocks.forEach((videoParent) => {
        let isHaveSubtitles = false;

        const badgeBlock = videoParent.querySelector('#badges');
        const badgeSpans = badgeBlock.querySelectorAll('span.style-scope');

        badgeSpans.forEach((span: Element) => {
          if (span.innerHTML === 'Subtitles' || span.innerHTML === 'CC') {
            isHaveSubtitles = true;
          }
        });

        if (!isHaveSubtitles) return;

        const title = videoParent
          .querySelector('#video-title')
          .getAttribute('title');
        const serviceId = videoParent
          .querySelector('#video-title')
          .getAttribute('href')
          .substr(9);
        const url = videoParent
          .querySelector('#img.style-scope.yt-img-shadow')
          .getAttribute('src');
        const channelTitle = videoParent.querySelector(
          'a.yt-simple-endpoint.style-scope.yt-formatted-string',
        ).innerHTML;

        const video = {
          serviceId,
          tag,
          snippet: {
            title,
            channelTitle,
            thumbnails: {
              medium: {
                url,
              },
            },
          },
        };
        videosWithSubtitles.push(video);
      });

      return videosWithSubtitles;
    }, tag);

    return videos;
  }

  async spinTheWheel(page: Page): Promise<void> {
    await page.mouse.wheel({ deltaY: 1000 });
    await page.waitFor(1000);
  }
}
