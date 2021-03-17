import { Module } from '@nestjs/common';
import { PriorityService } from '../priority/priority.service';
import { videoProviders } from '../video/video.providers';
import { PriorityController } from './priority.controller';

@Module({
  providers: [...videoProviders, PriorityService],
  controllers: [PriorityController],
  exports: [PriorityService],
})
export class PriorityModule {}
