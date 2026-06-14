import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { CardsModule } from '../cards/cards.module';
import {
  UserProgress,
  UserProgressSchema,
} from './schemas/user-progress.schema';
import { UserProgressController } from './user-progress.controller';
import { UserProgressService } from './user-progress.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserProgress.name, schema: UserProgressSchema },
    ]),
    CardsModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UserProgressController],
  providers: [UserProgressService],
  exports: [UserProgressService, MongooseModule],
})
export class UserProgressModule {}
