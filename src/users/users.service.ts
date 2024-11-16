import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from './user.schema';
import { encodePassword } from 'src/utils/bcrypt';
// import { encodePassword } from '@app/common/utils/bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async createUser(data: Partial<User>): Promise<User> {
    const exists = await this.userModel.findOne({ email: data.email });
    if (exists) {
      throw new BadRequestException('Email already exists');
    }
    data.password = encodePassword(data.password);
    return this.userModel.create(data);
  }

  async listUser(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async getUserById(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  async getUserByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async findOne(username: string): Promise<User> {
    return this.userModel.findOne({ username }).exec();
  }
}
