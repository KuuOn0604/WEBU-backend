import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

interface OpenAiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAiCustomRequest {
  model: string;
  input: OpenAiMessage[];
  text?: {
    format?: { type: string };
    verbosity?: string;
  };
  reasoning?: {
    effort?: string;
    summary?: string;
  };
  tools?: unknown[];
  store?: boolean;
  include?: string[];
}

interface OpenAiCustomResponse {
  text?: { value?: string };
  output?: { text?: string };
  choices?: Array<{ message?: { content?: string } }>;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }

    this.openai = new OpenAI({
      apiKey,
    });
  }

  async getHintForCode(
    problemDescription: string,
    userCode: string,
    language: string,
  ): Promise<string> {
    const systemPrompt = `Bạn là một trợ lý giảng dạy lập trình xuất sắc. 
Nhiệm vụ của bạn là giúp sinh viên tìm ra lỗi sai hoặc hướng đi cho bài tập lập trình của họ.

QUY TẮC TUYỆT ĐỐI KHÔNG ĐƯỢC VI PHẠM, KHÔNG CÓ NGOẠI LỆ DƯỚI BẤT KỲ HÌNH THỨC NÀO:
1. KHÔNG BAO GIỜ được cung cấp mã nguồn code giải bài trực tiếp.
2. KHÔNG BAO GIỜ được viết lại đoạn code đúng cho sinh viên.
3. Chỉ được phép đặt câu hỏi gợi mở, chỉ ra dòng code có khả năng gây lỗi, hoặc giải thích các khái niệm thuật toán (ví dụ: Time Complexity, Space Complexity, cách hoạt động của vòng lặp).
4. Phải khuyến khích sinh viên tự suy nghĩ. Dùng ngôn từ khích lệ, ngắn gọn và tập trung vào vấn đề.`;

    const userMessage = `
Dưới đây là thông tin bài tập:
- Đề bài: ${problemDescription}
- Ngôn ngữ: ${language}

- Code hiện tại của tôi:
\`\`\`${language}
${userCode}
\`\`\`

Hãy cho tôi một gợi ý để tôi biết mình đang làm sai ở đâu hoặc nên tiếp cận thế nào.
`;

    try {
      const requestPayload: OpenAiCustomRequest = {
        model: 'gpt-5.4-mini',
        input: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        text: {
          format: { type: 'text' },
          verbosity: 'medium',
        },
        reasoning: {
          effort: 'medium',
          summary: 'auto',
        },
        tools: [],
        store: true,
        include: [
          'reasoning.encrypted_content',
          'web_search_call.action.sources',
        ],
      };
      const aiClient = this.openai as unknown as {
        responses: {
          create: (
            payload: OpenAiCustomRequest,
          ) => Promise<OpenAiCustomResponse>;
        };
      };

      const response = await aiClient.responses.create(requestPayload);

      const hintContent =
        response.text?.value ||
        response.output?.text ||
        response.choices?.[0]?.message?.content;

      return hintContent || 'Không thể tạo gợi ý lúc này.';
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Lỗi khi gọi OpenAI API: ${errorMessage}`, errorStack);
      throw new InternalServerErrorException(
        'Lỗi hệ thống khi sử dụng gợi ý bằng AI',
      );
    }
  }
}
