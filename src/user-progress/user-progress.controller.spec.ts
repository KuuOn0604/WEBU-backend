import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { UserProgressController } from './user-progress.controller';
import { UserProgressService } from './user-progress.service';

describe('UserProgressController', () => {
  let controller: UserProgressController;

  const mockUserProgressService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getDailyTasks: jest.fn(),
    reviewCard: jest.fn(),
    getProgressStats: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserProgressController],
      providers: [
        {
          provide: UserProgressService,
          useValue: mockUserProgressService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<UserProgressController>(UserProgressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
