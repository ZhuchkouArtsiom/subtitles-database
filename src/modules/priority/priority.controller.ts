import { Controller, Delete, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PriorityService } from './priority.service';

@Controller('priority')
export class PriorityController {
  constructor(private readonly priorityService: PriorityService) {}

  @UseGuards(AuthGuard('jwt'))
  @Delete('video/reset')
  reset(@Query('serviceId') serviceId: string): Promise<{ message: string }> {
    return this.priorityService.reset(serviceId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('video/toEnd')
  toEnd(@Query('serviceId') serviceId: string): Promise<{ message: string }> {
    return this.priorityService.toEnd(serviceId);
  }
}
