import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../common/user.model';
import { Model } from 'mongoose';
import { CreateUserDto } from '../interfaces/create.user.dto';

@Injectable()
export class DbService {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}

  async createOrUpdateUser(createUserDto: CreateUserDto) {
    return this.UserModel.findOneAndUpdate(
      { chatId: createUserDto.chatId },
      {
        time: createUserDto.time,
        latitude: createUserDto.latitude,
        longitude: createUserDto.longitude,
        offset: createUserDto.offset,
        timeInput: createUserDto.timeInput,
      },
      { new: true, upsert: true },
    );
  }

  async findUser(chatId: number) {
    return this.UserModel.findOne({ chatId: chatId }).exec();
  }

  async deleteUser(chatId: number) {
    return this.UserModel.deleteOne({ chatId: chatId });
  }

  async findUsers() {
    return this.UserModel.find({}).exec();
  }
}
