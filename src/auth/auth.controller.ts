import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { Request } from 'express';
import { User } from 'src/user/user.schema';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async signIn(@Body() loginDto: LoginDto): Promise<{ accessToken: string }> {
    return await this.authService.signIn(loginDto);
  }

  @ApiBearerAuth()
  @Get('profile')
  async getProfile(@Req() request: Request): Promise<User> {
    return await this.authService.getProfile(request);
  }
}
