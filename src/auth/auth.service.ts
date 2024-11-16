import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtDto } from './dto/jwt-payload.dto';
import { JwtService } from '@nestjs/jwt';
import { comparePassword } from 'src/utils/bcrypt';
import { UsersService } from 'src/users/users.service';
import { LoginDto, UserLoginResponseDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async login(logInInput: LoginDto): Promise<UserLoginResponseDto> {
    const user = await this.usersService.getUserByEmail(logInInput?.email);

    if (!user) {
      throw new BadRequestException('email or password incorrect');
    }

    const isValidPwd = this.validatePassword(
      logInInput.password,
      user?.password,
    );

    if (!isValidPwd) {
      throw new BadRequestException('email or password incorrect');
    }

    const payload: JwtDto = {
      username: user.username,
      sub: user._id.toString(),
    };
    return {
      user: { ...user.toObject(), _id: user._id.toString() },
      access_token: this.getJwtToken(payload),
    };
  }

  validatePassword(pwd: string, dbPwd: string): boolean {
    const isValidPwd = pwd && comparePassword(pwd, dbPwd);
    if (!isValidPwd) {
      throw new BadRequestException('Entered password is not valid');
    }
    return true;
  }

  getJwtToken = ({ sub, username }: JwtDto) => {
    const payload: JwtDto = { username, sub };
    return this.jwtService.sign(payload);
  };
}
