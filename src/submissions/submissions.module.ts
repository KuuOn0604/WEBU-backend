import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Submission, SubmissionSchema } from './schemas/submissions.schema';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Submission.name, schema: SubmissionSchema },
    ]),
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService, MongooseModule],
})
export class SubmissionsModule {}
