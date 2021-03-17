import { Module } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { InterestsController } from './interests.controller';
import { interestsProviders } from './interests.providers';

@Module({
  providers: [InterestsService, ...interestsProviders],
  controllers: [InterestsController],
})
export class InterestsModule {}
