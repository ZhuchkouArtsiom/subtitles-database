import { Inject, Injectable } from '@nestjs/common';
import {
  PRIORITY_VIDEO_DEFAULT,
  VIDEO_REPOSITORY,
} from '../../globals/constants';
import { Video } from '../../db/models/video.entity';
import { Repository } from 'sequelize-typescript';

@Injectable()
export class PriorityService {
  constructor(
    @Inject(VIDEO_REPOSITORY)
    private readonly videoRepository: Repository<Video>,
  ) {}

  async toEnd(serviceId): Promise<{ message: string }> {
    try {
      const res = await this.videoRepository.update(
        { priority: PRIORITY_VIDEO_DEFAULT + 1 },
        { where: { serviceId } },
      );

      if (!res[0]) {
        return {
          message: 'VIDEO_IN_NOT_FOUND',
        };
      }

      return {
        message: 'PRIORITY_HAS_BEEN_SET_TO_END',
      };
    } catch (e) {
      console.log(e);
      return {
        message: 'ERROR',
      };
    }
  }

  async reset(serviceId): Promise<{ message: string }> {
    try {
      const res = await this.videoRepository.update(
        { priority: PRIORITY_VIDEO_DEFAULT },
        { where: { serviceId } },
      );

      if (!res[0]) {
        return {
          message: 'VIDEO_IN_NOT_FOUND',
        };
      }

      return {
        message: 'PRIORITY_HAS_BEEN_DELETED',
      };
    } catch (e) {
      console.log(e);
      return {
        message: 'ERROR',
      };
    }
  }
}
