import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateTestCaseDto } from './dto/create-test-case.dto';
import { UpdateTestCaseDto } from './dto/update-test-case.dto';
import { TestCasesService } from './test-cases.service';

@Controller('test-cases')
export class TestCasesController {
  constructor(private readonly testCasesService: TestCasesService) {}

  @Post()
  create(@Body() createTestCaseDto: CreateTestCaseDto) {
    return this.testCasesService.create(createTestCaseDto);
  }

  @Get()
  findAll() {
    return this.testCasesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testCasesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTestCaseDto: UpdateTestCaseDto,
  ) {
    return this.testCasesService.update(+id, updateTestCaseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testCasesService.remove(+id);
  }
}
