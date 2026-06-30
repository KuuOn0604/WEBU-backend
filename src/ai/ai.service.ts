import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai';
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
    java: string;
    python: string;
    typescript: string;
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
              'Full description of the problem formatted in clean Github-Flavored Markdown. Use headings (e.g. ### Description, ### Input, ### Output), bold text, bullet points for constraints, and clear paragraphs with double newlines (\n\n) to make it highly readable and clean.',
          },
          difficulty: {
            type: SchemaType.STRING,
            description:
              'Difficulty level, must be exactly one of the following values: Easy, Medium, or Hard. If the image has rating numbers like *900 or division tags, map them: rating < 1200 is Easy, 1200-1700 is Medium, > 1700 is Hard.',
          },
          tags: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: 'An array of relevant algorithmic or topic tags',
          },
          group: {
            type: SchemaType.STRING,
            description:
              "The course category, must be exactly either 'KTLT' or 'DSA'. Default to 'DSA' if unsure.",
          },
          boilerplateCode: {
            type: SchemaType.OBJECT,
            properties: {
              cpp: {
                type: SchemaType.STRING,
                description:
                  'The initial C++20 boilerplate code or skeleton function/main program for the problem',
              },
              java: {
                type: SchemaType.STRING,
                description:
                  'The initial Java 17 boilerplate code or skeleton class/method/main program for the problem',
              },
              python: {
                type: SchemaType.STRING,
                description:
                  'The initial Python 3 boilerplate code or skeleton function/method/main program for the problem',
              },
              typescript: {
                type: SchemaType.STRING,
                description:
                  'The initial TypeScript boilerplate code or skeleton function/main program for the problem.',
              },
            },
            required: ['cpp', 'java', 'python', 'typescript'],
          },
        },
        required: ['title', 'description', 'difficulty', 'boilerplateCode'],
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
        'You are an advanced OCR and software engineering assistant. Analyze the provided programming problem image. Extract key details accurately, format the description beautifully using clear Markdown sections and spacing, and format the output according to the requested JSON schema.\n\n' +
        'IMPORTANT CRITERIA FOR BOILERPLATE CODE:\n' +
        '1. The problem image can be LeetCode-style (which uses class/method structures) or Codeforces/Competitive Programming-style (which reads from standard input/stdin and writes to standard output/stdout).\n' +
        '2. For Codeforces/Competitive Programming style: Since there is no predefined function signature, the boilerplateCode for each language MUST be a complete runnable program template that reads inputs from stdin (e.g., using cin/Scanner/sys.stdin/readline), processes them, and prints results to stdout.\n' +
        '3. For LeetCode style: The boilerplateCode should be the typical class or function skeleton structure.\n' +
        '4. LANGUAGE SPECIFIC VERSIONS AND RULES:\n' +
        '   - cpp: Generate C++20 boilerplate.\n' +
        '   - java: Generate Java 17 boilerplate.\n' +
        '   - python: Generate Python 3 boilerplate.\n' +
        '   - typescript: Generate TypeScript boilerplate.';

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
