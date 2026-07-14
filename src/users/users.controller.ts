import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { FsrsProgressItem } from '../user-progress/user-progress.service';
import { OnboardingSetupDto } from './dto/onboarding-setup.dto';
import { ReviewCardDto } from './dto/review-card.dto';
import { ExtendedStats, SkillStat, UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put('me/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateSetup(
    @CurrentUser() user: JwtPayload,
    @Body() setupDto: OnboardingSetupDto,
  ): Promise<{
    status: string;
    message: string;
    updated_at: Date;
  }> {
    return this.usersService.updateSetup(user.sub, setupDto);
  }

  @Get('me/daily-tasks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getDailyTasks(@CurrentUser() user: JwtPayload): Promise<
    {
      card_id: string;
      title: string;
      next_review_date: Date;
    }[]
  > {
    return this.usersService.getDailyTasks(user.sub);
  }

  @Post('me/daily-tasks/:card_id/review')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  reviewCard(
    @CurrentUser() user: JwtPayload,
    @Param('card_id') cardId: string,
    @Body() reviewCardDto: ReviewCardDto,
  ): Promise<void> {
    return this.usersService.reviewCard(user.sub, cardId, reviewCardDto.rating);
  }

  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getStats(@CurrentUser() user: JwtPayload): Promise<ExtendedStats> {
    return this.usersService.getStats(user.sub);
  }

  @Get('me/skill-stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getSkillStats(@CurrentUser() user: JwtPayload): Promise<SkillStat[]> {
    return this.usersService.getSkillStats(user.sub);
  }

  @Get('me/fsrs-progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getFsrsProgress(
    @CurrentUser() user: JwtPayload,
  ): Promise<FsrsProgressItem[]> {
    return this.usersService.getFsrsProgress(user.sub);
  }

  @Get('me/interacted-cards')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getInteractedCards(@CurrentUser() user: JwtPayload): Promise<string[]> {
    return this.usersService.getInteractedCards(user.sub);
  }
}
