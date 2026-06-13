import { Injectable } from '@nestjs/common';

import { CreateUserProgressDto } from './dto/create-user-progress.dto';
import { UpdateUserProgressDto } from './dto/update-user-progress.dto';

@Injectable()
export class UserProgressService {
  create(_createUserProgressDto: CreateUserProgressDto): string {
    return 'This action adds a new userProgress';
  }

  findAll(): string {
    return `This action returns all userProgress`;
  }

  findOne(id: number): string {
    return `This action returns a #${id} userProgress`;
  }

  update(id: number, _updateUserProgressDto: UpdateUserProgressDto): string {
    return `This action updates a #${id} userProgress`;
  }

  remove(id: number): string {
    return `This action removes a #${id} userProgress`;
  }
}
