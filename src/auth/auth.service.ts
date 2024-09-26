import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.schema';
import { Request } from 'express';
import { AccessTokenDto } from './dto/access-token.dto';
import { compare, genSalt, hash } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async getProfile(request: Request): Promise<User> {
    return await this.userService.findById(request['user']?.sub);
  }

  async login({ email, password }: LoginDto): Promise<AccessTokenDto> {
    try {
      const user = await this.userService.findOneByEmail(email, '+password');

      const isPasswordMatch = await compare(password, user.password);
      if (!isPasswordMatch) {
        throw new UnauthorizedException('Password is incorrect');
      }

      return await this.generateAccessToken(user.id, user.email);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Email is incorrect');
      }
      throw error;
    }
  }

  async register({
    password,
    ...createUserDto
  }: User): Promise<AccessTokenDto> {
    const salt = await genSalt();
    const hashedPassword = await hash(password, salt);
    const createdUser = await this.userService.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return await this.generateAccessToken(createdUser.id, createdUser.email);
  }

  private async generateAccessToken(
    sub: string,
    username: string,
  ): Promise<AccessTokenDto> {
    return { accessToken: await this.jwtService.signAsync({ sub, username }) };
  }
}
