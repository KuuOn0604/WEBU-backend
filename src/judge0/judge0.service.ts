import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
}

export interface Judge0Result {
  token: string;
  status: {
    id: number;
    description: string;
  };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  memory: number | null;
}

export const LANGUAGE_ID_MAP: Record<string, number> = {
  python: 71, // Python 3
  cpp: 54, // C++ (GCC 9.2.0)
  java: 62, // Java (OpenJDK 13.0.1)
  javascript: 63, // JavaScript (Node.js 12.14.0)
  typescript: 74, // TypeScript (3.7.4)
};

@Injectable()
export class Judge0Service {
  private readonly client: AxiosInstance;
  private readonly logger = new Logger(Judge0Service.name);
  private readonly useRapidApi: boolean;

  constructor(private readonly configService: ConfigService) {
    const rapidApiKey = this.configService.get<string>('JUDGE0_RAPIDAPI_KEY');
    const selfHostedUrl = this.configService.get<string>('JUDGE0_URL');

    this.useRapidApi = !!rapidApiKey;

    if (this.useRapidApi) {
      this.client = axios.create({
        baseURL: 'https://judge0-ce.p.rapidapi.com',
        headers: {
          'x-rapidapi-key': rapidApiKey,
          'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
          'Content-Type': 'application/json',
        },
      });
    } else {
      this.client = axios.create({
        baseURL: selfHostedUrl || 'http://localhost:2358',
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  /**
   * Gửi code lên Judge0 và đợi kết quả
   */
  async execute(submission: Judge0Submission): Promise<Judge0Result> {
    const languageId = submission.language_id;

    let submitToken: string;
    try {
      const submitRes = await this.client.post<{ token: string }>(
        '/submissions',
        {
          source_code: Buffer.from(submission.source_code).toString('base64'),
          language_id: languageId,
          stdin: submission.stdin
            ? Buffer.from(submission.stdin).toString('base64')
            : '',
          expected_output: submission.expected_output
            ? Buffer.from(submission.expected_output).toString('base64')
            : '',
        },
        {
          params: { base64_encoded: 'true', wait: 'false', fields: '*' },
        },
      );
      submitToken = submitRes.data.token;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401 || status === 403) {
        throw new HttpException(
          'Judge0 API key is invalid or not subscribed. Please set JUDGE0_RAPIDAPI_KEY in .env and subscribe to the API on RapidAPI.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const errMsg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message || err.message
        : err instanceof Error
          ? err.message
          : 'Unknown error';
      throw new HttpException(
        'Failed to submit code to Judge0: ' + errMsg,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return this.pollResult(submitToken);
  }

  private async pollResult(token: string, attempts = 0): Promise<Judge0Result> {
    const MAX_ATTEMPTS = 30;
    // Backoff: first 5 attempts 500ms, then 800ms
    const POLL_INTERVAL_MS = attempts < 5 ? 500 : 800;

    if (attempts >= MAX_ATTEMPTS) {
      this.logger.warn(
        `Polling timed out after ${MAX_ATTEMPTS} attempts for token ${token}`,
      );
      return {
        token,
        status: { id: 5, description: 'Time Limit Exceeded' },
        stdout: null,
        stderr: 'Execution timed out — code may be in an infinite loop.',
        compile_output: null,
        time: null,
        memory: null,
      };
    }

    let result: Judge0Result;
    try {
      const res = await this.client.get<Judge0Result>(`/submissions/${token}`, {
        params: { base64_encoded: 'true', fields: '*' },
      });
      result = res.data;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 429) {
        this.logger.warn('Judge0 rate limit hit, waiting 2s...');
        await new Promise((r) => setTimeout(r, 2000));
        return this.pollResult(token, attempts + 1);
      }
      if (status === 401 || status === 403) {
        throw new HttpException(
          'Judge0 API key is invalid, expired, or not subscribed. Please check JUDGE0_RAPIDAPI_KEY in .env and your RapidAPI subscription.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const errMsg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message || err.message
        : err instanceof Error
          ? err.message
          : 'Unknown error';
      throw new HttpException(
        'Failed to poll result from Judge0: ' + errMsg,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // status 1 = In Queue, 2 = Processing
    if (result.status.id <= 2) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      return this.pollResult(token, attempts + 1);
    }

    // Decode base64 outputs
    if (result.stdout) {
      result.stdout = Buffer.from(result.stdout, 'base64').toString('utf-8');
    }
    if (result.stderr) {
      result.stderr = Buffer.from(result.stderr, 'base64').toString('utf-8');
    }
    if (result.compile_output) {
      result.compile_output = Buffer.from(
        result.compile_output,
        'base64',
      ).toString('utf-8');
    }

    return result;
  }

  /**
   * Chạy code với nhiều test case cùng lúc (batch)
   */
  async executeBatch(
    code: string,
    languageId: number,
    testCases: Array<{ input: string; expected_output: string }>,
  ): Promise<Judge0Result[]> {
    const submissions = testCases.map((tc) => ({
      source_code: Buffer.from(code).toString('base64'),
      language_id: languageId,
      stdin: Buffer.from(tc.input).toString('base64'),
      expected_output: Buffer.from(tc.expected_output).toString('base64'),
    }));

    try {
      const batchRes = await this.client.post<{ token: string }[]>(
        '/submissions/batch',
        { submissions },
        { params: { base64_encoded: 'true' } },
      );

      const tokens = batchRes.data.map((r) => r.token);

      return Promise.all(tokens.map((token) => this.pollResult(token)));
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401 || status === 403) {
        throw new HttpException(
          'Judge0 API key is invalid, expired, or not subscribed. Please check JUDGE0_RAPIDAPI_KEY in .env and your RapidAPI subscription.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const errMsg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message || err.message
        : err instanceof Error
          ? err.message
          : 'Unknown error';
      throw new HttpException(
        'Failed to execute batch on Judge0: ' + errMsg,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getLanguageId(language: string): number {
    return LANGUAGE_ID_MAP[language] ?? 63; // default JS
  }
}
