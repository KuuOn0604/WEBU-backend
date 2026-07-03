/// <reference types="multer" />
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AiGeneratedProblemResponse, AiService } from './ai.service';

@ApiTags('Ai')
@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-problem')
  @ApiOperation({
    summary:
      'Extract and structure programming problem from an image and/or text prompt using AI',
  })
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description:
            'The image file containing the programming problem to be extracted (optional)',
        },
        prompt: {
          type: 'string',
          description:
            'Text instructions or direct prompt for problem generation (optional)',
        },
      },
    },
  })
  async generateProblem(
    @UploadedFile() file?: Express.Multer.File,
    @Body('prompt') prompt?: string,
  ): Promise<AiGeneratedProblemResponse> {
    if (!file && (!prompt || !prompt.trim())) {
      throw new BadRequestException(
        'Either an image file or a prompt is required.',
      );
    }
    return this.aiService.generateFromImage(file, prompt);
  }

  @Post('generate-testcases')
  @ApiOperation({
    summary:
      'Generate sample and hidden test cases for a programming problem using AI',
  })
  async generateTestCases(
    @Body()
    body: {
      title: string;
      description: string;
    },
  ): Promise<any[]> {
    if (!body.title || !body.description) {
      throw new BadRequestException('title and description are required');
    }
    return this.aiService.generateTestCases(body.title, body.description);
  }

  @Post('chat')
  @ApiOperation({ summary: 'AI Tutor chat for problem-solving guidance' })
  async chat(
    @Body()
    body: {
      message: string;
      problem_title?: string;
      problem_description?: string;
    },
  ): Promise<{ reply: string }> {
    if (!body.message) {
      throw new BadRequestException('message is required');
    }
    const reply = await this.aiService.chatWithTutor(
      body.message,
      body.problem_title ?? 'Unknown Problem',
      body.problem_description ?? '',
    );
    return { reply };
  }
}
