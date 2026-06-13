import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { Card } from '../cards/schemas/cards.schema';
import { Submission } from '../submissions/schemas/submissions.schema';
import { UserProgress } from '../user-progress/schemas/user-progress.schema';
import { User } from './schemas/users.schema';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

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
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(UserProgress.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(Submission.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(Card.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
