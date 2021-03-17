import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE, DEVELOPMENT, TEST, PRODUCTION } from '../globals/constants';
import { databaseConfig } from './database.config';
import { Video } from './models/video.entity';
import { VideoSubtitles } from './models/video-subtitles.entity';
import { Subtitles } from './models/subtitle.entity';
import { Snippet } from './models/snippet.entity';
import { Interests } from './models/interest.entity';
import { VideoInterest } from './models/video-interest.entity';
import { Editor } from './models/editor.entity';

export const postgresProviders = [
  {
    provide: SEQUELIZE,
    useFactory: async (): Promise<Sequelize> => {
      let config;
      switch (process.env.NODE_ENV) {
        case DEVELOPMENT:
          config = databaseConfig.development;
          break;
        case TEST:
          config = databaseConfig.test;
          break;
        case PRODUCTION:
          config = databaseConfig.production;
          break;
        default:
          config = databaseConfig.development;
      }
      const sequelize = new Sequelize(config);
      sequelize.addModels([
        Video,
        VideoSubtitles,
        Subtitles,
        Snippet,
        Interests,
        VideoInterest,
        Editor,
      ]);
      await sequelize.sync();
      return sequelize;
    },
  },
];
