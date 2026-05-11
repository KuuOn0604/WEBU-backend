import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CardsService } from './cards.service';
import { GetCardsFilterDto } from './dto/get-cards-filter.dto';

@ApiTags('cards')
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bài tập' })
  @ApiResponse({
    status: 200,
    description: 'Trả về danh sách thẻ bài và metadata phân trang.',
  })
  findAll(@Query() filterDto: GetCardsFilterDto) {
    return this.cardsService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một bài tập kèm public test cases' })
  @ApiParam({ name: 'id', description: 'ID của bài tập' })
  @ApiResponse({
    status: 200,
    description: 'Trả về chi tiết bài tập.',
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy bài tập.',
  })
  findOne(@Param('id') id: string) {
    return this.cardsService.findOne(id);
  }
}
