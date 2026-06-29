import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { Judge0Module } from '../judge0/judge0.module';
import { TestCasesModule } from '../test-cases/test-cases.module';
import { Submission, SubmissionSchema } from './schemas/submissions.schema';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Submission.name, schema: SubmissionSchema },
    ]),
    Judge0Module,
    TestCasesModule,
    // Import JwtModule trực tiếp thay vì AuthModule để tránh circular dependency
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
          expiresIn: configService.get<string>('JWT_EXPIRATION', '12h') as any,
        },
      }),
    }),
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService, MongooseModule],
})
export class SubmissionsModule {}
