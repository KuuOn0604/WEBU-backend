import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { Submission } from './schemas/submissions.schema';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<Submission>,
  ) {}

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
