import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn({
    email,
    password,
  }: LoginDto): Promise<{ accessToken: string }> {
    try {
      const user = await this.userService.findOneByEmail(email);

      if (user.password !== password) {
        throw new UnauthorizedException('Password is incorrect');
      }

      return {
        accessToken: await this.jwtService.signAsync({
          sub: user.id,
          username: user.email,
        }),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Email is incorrect');
      }
      throw error;
    }
  }
}
