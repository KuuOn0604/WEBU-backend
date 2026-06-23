/// <reference types="multer" />
import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
// Import thêm ApiBody và ApiConsumes từ Swagger để cấu hình UI
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AiGeneratedProblemResponse, AiService } from './ai.service';

@ApiTags('Ai') // Gom nhóm endpoint này vào group 'Ai' trên Swagger UI
@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-problem')
  @ApiOperation({ summary: 'Bóc tách đề bài lập trình từ hình ảnh bằng AI' })
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data') // 1. Định nghĩa kiểu dữ liệu gửi lên là form-data
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Hình ảnh đề bài cần AI trích xuất',
        },
      },
      required: ['image'],
    },
  })
  async generateProblem(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AiGeneratedProblemResponse> {
    if (!file) {
      throw new BadRequestException('Con vợ chưa tải ảnh đề bài lên kìa!');
    }
    return this.aiService.generateFromImage(file);
  }
}
