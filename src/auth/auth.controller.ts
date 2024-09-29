import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { Request } from 'express';
import { User } from 'src/user/user.schema';
import { AccessTokenDto } from './dto/access-token.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<AccessTokenDto> {
    return await this.authService.register(createUserDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AccessTokenDto> {
    return await this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @Get('profile')
  async getProfile(@Req() request: Request): Promise<User> {
    return await this.authService.getProfile(request);
  }
}
