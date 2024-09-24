import { IsEmail, IsOptional, IsString } from 'class-validator';
import { IUser } from '../user.interface';

export class UpdateUserDto implements Partial<IUser> {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
