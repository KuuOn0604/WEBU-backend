import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection, Schema } from 'mongoose';

import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CardsModule } from './cards/cards.module';
import { FlashcardsModule } from './flashcards/flashcards.module';
import { FsrsModule } from './fsrs/fsrs.module';
import { Judge0Module } from './judge0/judge0.module';
import { NotesModule } from './notes/notes.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { TestCasesModule } from './test-cases/test-cases.module';
import { UserProgressModule } from './user-progress/user-progress.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    CardsModule,
    TestCasesModule,
    UserProgressModule,
    SubmissionsModule,
    NotesModule,
    Judge0Module,
    FlashcardsModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        connectionFactory: (connection: Connection) => {
          connection.plugin((schema: Schema) => {
            schema.set('toJSON', {
              virtuals: true,
              versionKey: false,
              transform: (_doc: unknown, ret: Record<string, unknown>) => {
                delete ret._id;
                return ret;
              },
            });
            schema.set('toObject', { virtuals: true });
          });
          return connection;
        },
      }),
    }),
    AiModule,
    AuthModule,
    FsrsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
