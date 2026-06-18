import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { Card } from '../cards/schemas/cards.schema';
import { UserProgress } from './schemas/user-progress.schema';
import { UserProgressService } from './user-progress.service';

describe('UserProgressService', () => {
  let service: UserProgressService;

  const mockModel = {
    new: jest.fn(),
    constructor: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserProgressService,
        {
          provide: getModelToken(UserProgress.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(Card.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<UserProgressService>(UserProgressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
