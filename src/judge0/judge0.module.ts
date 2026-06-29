import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { Judge0Service } from './judge0.service';

@Module({
  imports: [ConfigModule],
  providers: [Judge0Service],
  exports: [Judge0Service],
})
export class Judge0Module {}
