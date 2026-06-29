import {
  GoogleGenerativeAI,
  Part,
  Schema,
  SchemaType,
} from '@google/generative-ai';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

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
            description:
              'A concise title of the programming problem extracted from the image',
          },
          description: {
            type: SchemaType.STRING,
            description:
              'Full description of the problem, including requirements, inputs, outputs, and constraints',
          },
          difficulty: {
            type: SchemaType.STRING,
            description:
              'Difficulty level, must be exactly one of the following values: Easy, Medium, or Hard',
          },
          tags: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: 'An array of relevant algorithmic or topic tags',
          },
          group: {
            type: SchemaType.STRING,
            description:
              "The course category, must be exactly either 'KTLT' or 'DSA'",
          },
          boilerplateCode: {
            type: SchemaType.OBJECT,
            properties: {
              cpp: {
                type: SchemaType.STRING,
                description:
                  'The initial C++ boilerplate code or skeleton function for the problem',
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
      const imagePart: Part = {
        inlineData: {
          data: (file.buffer as Buffer).toString('base64'),
          mimeType: file.mimetype as string,
        },
      };

      const systemInstruction =
        'You are an advanced OCR and software engineering assistant. Analyze the provided programming problem image. Extract key details accurately and format the output according to the requested JSON schema.';

      const result = await model.generateContent([
        systemInstruction,
        imagePart,
      ]);

      return JSON.parse(result.response.text()) as AiGeneratedProblemResponse;
    } catch (error) {
      this.logger.error('Gemini Service Error:', error);
      throw new InternalServerErrorException(
        'Failed to process the image. Please try again with a clearer image or check the service availability.',
      );
    }
  }

  /**
   * AI Tutor chat - trả lời câu hỏi về bài tập lập trình
   */
  async chatWithTutor(
    message: string,
    problemTitle: string,
    problemDescription: string,
  ): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
      });

      const systemPrompt = `Bạn là AI Tutor của hệ thống học lập trình W.E.B.U. 
Bạn đang hỗ trợ học viên giải bài tập: "${problemTitle}".

Mô tả bài tập:
${problemDescription}

Hướng dẫn:
- Trả lời bằng tiếng Việt trừ khi người dùng hỏi bằng tiếng Anh
- Đừng cho code đầy đủ trực tiếp, hãy gợi ý từng bước
- Khuyến khích học viên tự suy nghĩ
- Giải thích thuật toán và ý tưởng rõ ràng
- Giữ câu trả lời ngắn gọn (dưới 300 từ)
- Nếu được hỏi về bài khác, hướng dẫn về bài đang làm

Câu hỏi của học viên: ${message}`;

      const result = await model.generateContent(systemPrompt);
      return result.response.text();
    } catch (error) {
      this.logger.error('AI Tutor Chat Error:', error);
      return 'Xin lỗi, mình không thể kết nối đến AI lúc này. Vui lòng thử lại sau nhé!';
    }
  }
}
