import {
  Body,
  Controller,
  Get,
  Post,
  BadRequestException,
} from '@nestjs/common';
// import { CreateUserDto } from './create-user.dto';
import { UsersService } from './users.service';
import { User } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Create a new user
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.usersService.createUser(createUserDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Get a user by ID
  @Get()
  async getAllUser(): Promise<User[]> {
    const user = await this.usersService.listUser();
    // if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
