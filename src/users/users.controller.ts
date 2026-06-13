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
import { OnboardingSetupDto } from './dto/onboarding-setup.dto';
import { ReviewCardDto } from './dto/review-card.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Cấu hình onboarding cho user
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

  // Lấy nhiệm vụ ôn tập hàng ngày
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

  // Đánh giá độ khó sau khi ôn tập
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

  // Xem Dashboard thống kê
  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getStats(@CurrentUser() user: JwtPayload): Promise<{
    total_cards_mastered: number;
    average_retention_rate: number;
    submission_history: {
      date: string;
      count: number;
    }[];
  }> {
    return this.usersService.getStats(user.sub);
  }
}
