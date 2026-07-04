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

import { CARD_TAGS } from '../common/constants/card-config';

export interface AiGeneratedProblemResponse {
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  course: string;
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
    file?: Express.Multer.File,
    prompt?: string,
  ): Promise<AiGeneratedProblemResponse> {
    try {
      const aiProblemSchema: Schema = {
        type: SchemaType.OBJECT,
        properties: {
          title: {
            type: SchemaType.STRING,
            description:
              'A concise title of the programming problem extracted from the image or prompt',
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
            description: `An array of relevant algorithmic or topic tags. You MUST ONLY choose tags from the following allowed list: ${CARD_TAGS.join(', ')}. If any tags are identified that are not in this list, omit them.`,
          },
          course: {
            type: SchemaType.STRING,
            description: `The course category, must be exactly either 'KTLT' or 'DSA'. If the image, prompt, or description does not explicitly mention either 'KTLT' or 'DSA', return an empty string.`,
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

      const systemInstruction =
        'You are an advanced OCR and software engineering assistant. Analyze the provided programming problem details (which can be in the form of an image, a text prompt, or both). Extract or generate key details accurately, format the description beautifully using clear Markdown sections and spacing, and format the output according to the requested JSON schema.\n\n' +
        'IMPORTANT CRITERIA FOR BOILERPLATE CODE:\n' +
        '1. For ALL languages (cpp, java, python, typescript): The boilerplate code MUST be a complete, fully runnable program template.\n' +
        '2. It MUST include all necessary imports/includes, the core solution logic class/method, and a complete main function (or entry point) that automatically reads inputs from standard input (stdin) matching the testcase format, parses them into correct types, calls the solution method, and prints the exact expected output to standard output (stdout).\n' +
        '3. Inside the solution method, mark the region where the user should write their code with a concise and professional comment: "// TODO: Implement your solution here" (or equivalent syntax for python/other languages).\n' +
        '4. LANGUAGE SPECIFIC VERSIONS AND RULES:\n' +
        '   - cpp: Generate C++20 boilerplate.\n' +
        '   - java: Generate Java 17 boilerplate.\n' +
        '   - python: Generate Python 3 boilerplate.\n' +
        '   - typescript: Generate TypeScript boilerplate.';

      const contents: (string | Part)[] = [systemInstruction];

      if (file) {
        contents.push({
          inlineData: {
            data: file.buffer.toString('base64'),
            mimeType: file.mimetype,
          },
        });
      }

      if (prompt) {
        contents.push(`User request/prompt: ${prompt}`);
      }

      const result = await model.generateContent(contents);
      return JSON.parse(result.response.text()) as AiGeneratedProblemResponse;
    } catch (error) {
      this.logger.error('Gemini Service Error:', error);
      throw new InternalServerErrorException(
        'Failed to process the input. Please try again with a clearer prompt or image.',
      );
    }
  }

  async generateTestCases(
    title: string,
    description: string,
  ): Promise<unknown[]> {
    try {
      const testCasesSchema: Schema = {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            input: {
              type: SchemaType.STRING,
              description:
                'The exact input string for the testcase as it would be read from standard input.',
            },
            expected_output: {
              type: SchemaType.STRING,
              description:
                'The exact expected output string from the program as it would be printed to standard output.',
            },
            is_hidden: {
              type: SchemaType.BOOLEAN,
              description:
                'True if it is a hidden edge case, false if it is one of the 3 sample test cases.',
            },
            order: {
              type: SchemaType.INTEGER,
              description: 'The sequential 1-based order of the test case.',
            },
          },
          required: ['input', 'expected_output', 'is_hidden', 'order'],
        },
      };

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: testCasesSchema,
        },
      });

      const prompt = `Generate test cases for the programming problem: "${title}".
Description:
${description}

Generate exactly 3 sample test cases (where \`is_hidden\` is \`false\`) and 3 to 5 hidden edge cases (where \`is_hidden\` is \`true\`).
The hidden cases should cover typical boundaries, empty or large values, negatives, or other tricky inputs.
Make sure the expected outputs are 100% correct according to the description logic.`;

      const result = await model.generateContent(prompt);
      return JSON.parse(result.response.text()) as unknown[];
    } catch (error) {
      this.logger.error('Failed to generate test cases:', error);
      throw new InternalServerErrorException(
        'Failed to generate test cases. Please check the problem description and try again.',
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
