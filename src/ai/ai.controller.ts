import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  // UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { GetHintDto } from '@/ai/dto/get-hint.dto';

// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';

@ApiTags('AI Tutor')
@Controller('ai')
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('hint')
  @HttpCode(HttpStatus.OK)
  async getHint(@Body() getHintDto: GetHintDto): Promise<{ hint: string }> {
    const hint = await this.aiService.getHintForCode(
      getHintDto.problem_description,
      getHintDto.user_code,
      getHintDto.language,
    );

    return { hint };
  }
}
