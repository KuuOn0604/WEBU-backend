import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TestCase, TestCaseSchema } from './schemas/test-cases.schema';
import { TestCasesController } from './test-cases.controller';
import { TestCasesService } from './test-cases.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TestCase.name, schema: TestCaseSchema },
    ]),
  ],
  controllers: [TestCasesController],
  providers: [TestCasesService],
})
export class TestCasesModule {}
