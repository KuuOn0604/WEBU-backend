import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { TestCase } from '../test-cases/schemas/test-cases.schema';
import { CardsService } from './cards.service';
import { Card } from './schemas/cards.schema';

describe('CardsService', () => {
  let service: CardsService;

  const mockModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        {
          provide: getModelToken(Card.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(TestCase.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
