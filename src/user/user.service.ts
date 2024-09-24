import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Model } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  findAll() {
    const foundUsers = this.userModel.find();
    return foundUsers;
  }

  findOne(id: string) {
    const user = this.userModel.findById(id);
    return user;
  }

  create(createUserDto: CreateUserDto) {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  update(id: string, createUserDto: UpdateUserDto) {
    const updatedUser = this.userModel.findByIdAndUpdate(id, createUserDto, {
      new: true,
    });
    return updatedUser;
  }

  delete(id: string) {
    const deletedUser = this.userModel.findByIdAndDelete(id);
    return deletedUser;
  }
}
