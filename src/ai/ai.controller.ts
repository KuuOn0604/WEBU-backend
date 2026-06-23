/// <reference types="multer" />
import {
  BadRequestException,
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
    summary: 'Extract and structure programming problem from an image using AI',
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
            'The image file containing the programming problem to be extracted',
        },
      },
      required: ['image'],
    },
  })
  async generateProblem(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AiGeneratedProblemResponse> {
    if (!file) {
      throw new BadRequestException(
        'Image file is required. Please upload a valid image.',
      );
    }
    return this.aiService.generateFromImage(file);
  }
}
