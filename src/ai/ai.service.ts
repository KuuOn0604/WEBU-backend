import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

// Định nghĩa Interface chuẩn cấu hình để ép kiểu dữ liệu trả về, xóa bỏ 'any'
export interface AiGeneratedProblemResponse {
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  group: string;
  boilerplateCode: {
    cpp: string;
  };
}

@Injectable()
export class AiService {
  // Thay thế console bằng Logger của NestJS để tránh dính quy tắc no-console
  private readonly logger = new Logger(AiService.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async generateFromImage(
    file: Express.Multer.File,
  ): Promise<AiGeneratedProblemResponse> {
    try {
      const aiProblemSchema: Schema = {
        type: SchemaType.OBJECT,
        properties: {
          title: {
            type: SchemaType.STRING,
            description: 'Tiêu đề ngắn gọn của bài toán trích xuất từ ảnh',
          },
          description: {
            type: SchemaType.STRING,
            description:
              'Mô tả toàn bộ yêu cầu, input, output, constraints của đề bài',
          },
          difficulty: {
            type: SchemaType.STRING,
            description:
              'Độ khó, bắt buộc phải là một trong ba chữ: Easy, Medium, hoặc Hard',
          },
          tags: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }, //  Đã sửa thành "type:" chuẩn chỉ ở đây
            description: 'Mảng các tag thuật toán liên quan',
          },
          group: {
            type: SchemaType.STRING,
            description: "Nhóm môn học phù hợp, chỉ chọn 'KTLT' hoặc 'DSA'",
          },
          boilerplateCode: {
            type: SchemaType.OBJECT,
            properties: {
              cpp: {
                type: SchemaType.STRING,
                description: 'Khung code C++ khởi tạo sẵn',
              },
            },
          },
        },
        required: ['title', 'description', 'difficulty'],
      };

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: aiProblemSchema,
        },
      });

      const imagePart = {
        inlineData: {
          data: file.buffer.toString('base64'),
          mimeType: file.mimetype,
        },
      };

      const systemInstruction =
        'Bạn là một hệ thống OCR nâng cao dành cho lập trình viên. Hãy phân tích hình ảnh đề bài lập trình được cung cấp. Trích xuất thông tin chính xác và định dạng theo JSON schema.';

      const result = await model.generateContent([
        systemInstruction,
        imagePart,
      ]);

      return JSON.parse(result.response.text()) as AiGeneratedProblemResponse;
    } catch (error) {
      this.logger.error('Lỗi Gemini Service:', error);
      throw new InternalServerErrorException(
        'AI không đọc được ảnh này rồi, thử lại xem sao con vợ.',
      );
    }
  }
}
