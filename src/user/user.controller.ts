import {
  Get,
  Body,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Controller,
} from '@nestjs/common';

import { GetUser, Protected } from './../common/decorators';
import { UserService } from './user.service';
import { EditUserDto } from './dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Protected()
  @Get('me')
  @HttpCode(HttpStatus.OK)
  getUserById(@GetUser('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Protected()
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  updateUserById(@GetUser('id') id: string, @Body() dto: EditUserDto) {
    return this.userService.updateUserById(id, dto);
  }

  @Protected()
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  deleteUserById(@GetUser('id') id: string) {
    return this.userService.deleteUserById(id);
  }
}
