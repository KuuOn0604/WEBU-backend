import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Judge0Result,
  Judge0Service,
  LANGUAGE_ID_MAP,
} from '../judge0/judge0.service';
import { TestCase } from '../test-cases/schemas/test-cases.schema';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { RunCodeDto } from './dto/run-code.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { Submission } from './schemas/submissions.schema';

export interface TestCaseResult {
  order: number;
  input: string;
  expected_output: string;
  actual_output: string | null;
  passed: boolean;
  status: string;
  execution_time: string | null;
  error: string | null;
}

export interface RunCodeResult {
  success: boolean;
  all_passed: boolean;
  results: TestCaseResult[];
}

export interface SubmitResult {
  submission_id: string;
  passed: boolean;
  status: string;
  total_tests: number;
  passed_tests: number;
  execution_time: number | null; // ms
  memory_used: number | null; // KB
  error_details: string | null;
  results: TestCaseResult[];
}

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<Submission>,
    @InjectModel(TestCase.name)
    private readonly testCaseModel: Model<TestCase>,
    private readonly judge0Service: Judge0Service,
  ) {}

  /**
   * Chạy code với public test cases (không lưu DB)
   */
  async runCode(dto: RunCodeDto): Promise<RunCodeResult> {
    const { card_id, code, language } = dto;
    const languageId = LANGUAGE_ID_MAP[language] ?? 63;

    // Lấy public test cases
    const testCases = await this.testCaseModel
      .find({ card_id: new Types.ObjectId(card_id), is_hidden: false })
      .sort({ order: 1 })
      .exec();

    if (testCases.length === 0) {
      return {
        success: true,
        all_passed: true,
        results: [],
      };
    }

    // Chạy batch trên Judge0
    const judge0Results = await this.judge0Service.executeBatch(
      code,
      languageId,
      testCases.map((tc) => ({
        input: tc.input,
        expected_output: tc.expected_output,
      })),
    );

    const results: TestCaseResult[] = testCases.map((tc, idx) => {
      const r: Judge0Result = judge0Results[idx];
      const actualOutput = (r.stdout ?? '').trim();
      const expectedOutput = tc.expected_output.trim();
      const passed = r.status.id === 3 && actualOutput === expectedOutput;

      return {
        order: tc.order,
        input: tc.input,
        expected_output: tc.expected_output,
        actual_output: r.stdout,
        passed,
        status: r.status.description,
        execution_time: r.time,
        error: r.stderr || r.compile_output || null,
      };
    });

    return {
      success: true,
      all_passed: results.every((r) => r.passed),
      results,
    };
  }

  /**
   * Submit code với TẤT CẢ test cases (bao gồm hidden) → lưu vào DB
   */
  async submitCode(
    dto: CreateSubmissionDto,
    userId: string,
  ): Promise<SubmitResult> {
    const { card_id, submitted_code, language } = dto;
    const languageId = LANGUAGE_ID_MAP[language] ?? 63;

    // Lấy tất cả test cases (public + hidden)
    const testCases = await this.testCaseModel
      .find({ card_id: new Types.ObjectId(card_id) })
      .sort({ order: 1 })
      .exec();

    if (testCases.length === 0) {
      throw new NotFoundException('Không có test case nào cho bài tập này');
    }

    // Chạy batch trên Judge0
    const judge0Results = await this.judge0Service.executeBatch(
      submitted_code,
      languageId,
      testCases.map((tc) => ({
        input: tc.input,
        expected_output: tc.expected_output,
      })),
    );

    const results: TestCaseResult[] = testCases.map((tc, idx) => {
      const r: Judge0Result = judge0Results[idx];
      const actualOutput = (r.stdout ?? '').trim();
      const expectedOutput = tc.expected_output.trim();
      const passed = r.status.id === 3 && actualOutput === expectedOutput;

      return {
        order: tc.order,
        input: tc.input,
        expected_output: tc.expected_output,
        actual_output: r.stdout,
        passed,
        status: r.status.description,
        execution_time: r.time,
        error: r.stderr || r.compile_output || null,
      };
    });

    const passedCount = results.filter((r) => r.passed).length;
    const allPassed = passedCount === results.length;

    // Tính average execution time và max memory
    const times = judge0Results
      .map((r) => parseFloat(r.time ?? '0'))
      .filter((t) => !isNaN(t));
    const avgTime =
      times.length > 0
        ? (times.reduce((a, b) => a + b, 0) / times.length) * 1000
        : null;
    const maxMemory = Math.max(...judge0Results.map((r) => r.memory ?? 0));

    // Lấy lỗi đầu tiên nếu có
    const firstError = results.find((r) => r.error)?.error ?? null;

    // Xác định status
    let status = 'Accepted';
    if (!allPassed) {
      const hasCompileError = judge0Results.some((r) => r.compile_output);
      const hasTLE = judge0Results.some((r) => r.status.id === 5);
      if (hasCompileError) status = 'Compilation Error';
      else if (hasTLE) status = 'Time Limit Exceeded';
      else status = 'Wrong Answer';
    }

    // Lưu vào DB
    const submission = new this.submissionModel({
      user_id: new Types.ObjectId(userId),
      card_id: new Types.ObjectId(card_id),
      submitted_code,
      language,
      status,
      execution_time: avgTime ? Math.round(avgTime) : null,
      memory_used: maxMemory || null,
      error_details: firstError,
      passed: allPassed,
    });

    const saved = await submission.save();

    return {
      submission_id: (saved._id as { toString(): string }).toString(),
      passed: allPassed,
      status,
      total_tests: results.length,
      passed_tests: passedCount,
      execution_time: avgTime ? Math.round(avgTime) : null,
      memory_used: maxMemory || null,
      error_details: firstError,
      results,
    };
  }

  /**
   * Lấy lịch sử submission theo card + user
   */
  async findByCardAndUser(
    cardId: string,
    userId: string,
  ): Promise<Submission[]> {
    const submissions = await this.submissionModel
      .find({
        card_id: new Types.ObjectId(cardId),
        user_id: new Types.ObjectId(userId),
      })
      .sort({ submitted_at: -1 })
      .limit(20)
      .lean()
      .exec();

    return submissions.map((sub) => {
      const doc = sub as unknown as {
        _id: Types.ObjectId;
        [key: string]: unknown;
      };
      const { _id, ...rest } = doc;
      return {
        ...rest,
        id: _id.toString(),
      } as unknown as Submission;
    });
  }

  // ── CRUD cũ ──────────────────────────────────────────────────────────────

  async create(createSubmissionDto: CreateSubmissionDto): Promise<Submission> {
    const createdSubmission = new this.submissionModel(createSubmissionDto);
    return createdSubmission.save();
  }

  async findAll(): Promise<Submission[]> {
    return this.submissionModel.find().exec();
  }

  async findOne(id: string): Promise<Submission | null> {
    return this.submissionModel.findById(id).exec();
  }

  async update(
    id: string,
    updateSubmissionDto: UpdateSubmissionDto,
  ): Promise<Submission | null> {
    return this.submissionModel
      .findByIdAndUpdate(id, updateSubmissionDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Submission | null> {
    return this.submissionModel.findByIdAndDelete(id).exec();
  }
}
