import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateTestCaseDto } from './dto/create-test-case.dto';
import { UpdateTestCaseDto } from './dto/update-test-case.dto';
import { TestCase } from './schemas/test-cases.schema';

@Injectable()
export class TestCasesService {
  constructor(
    @InjectModel(TestCase.name) private readonly testCaseModel: Model<TestCase>,
  ) {}

  async create(createTestCaseDto: CreateTestCaseDto): Promise<TestCase> {
    const createdTestCase = new this.testCaseModel(createTestCaseDto);
    return createdTestCase.save();
  }

  async findAll(): Promise<TestCase[]> {
    return this.testCaseModel.find().exec();
  }

  async findOne(id: string): Promise<TestCase | null> {
    return this.testCaseModel.findById(id).exec();
  }

  async update(
    id: string,
    updateTestCaseDto: UpdateTestCaseDto,
  ): Promise<TestCase | null> {
    return this.testCaseModel
      .findByIdAndUpdate(id, updateTestCaseDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<TestCase | null> {
    return this.testCaseModel.findByIdAndDelete(id).exec();
  }
}
