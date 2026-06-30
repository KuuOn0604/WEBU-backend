import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  UserProgress,
  UserProgressSchema,
} from '../user-progress/schemas/user-progress.schema';
import { FsrsController } from './fsrs.controller';
import { FsrsService } from './fsrs.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserProgress.name, schema: UserProgressSchema },
    ]),
  ],
  controllers: [FsrsController],
  providers: [FsrsService],
})
export class FsrsModule {}
