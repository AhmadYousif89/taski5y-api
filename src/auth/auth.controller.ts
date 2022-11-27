import {
  Get,
  Res,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { Response } from 'express';
import { Cookies } from './../common/decorators';

import { GetUserId, Protected, ValidateBody } from './../common/decorators';
import { AuthLoginDto, AuthRegisterDto } from './dto';
import { RtAuthGuard } from './../common/guards';
import { AuthServices } from './auth.service';

@Controller('auth')
export class AuthController {
  private timeToExpire = 24 * 60 * 60 * 1000; // (1 Day)

  constructor(private readonly authServices: AuthServices) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@ValidateBody() dto: AuthRegisterDto, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authServices.register(dto);
    this.attachCookie(res, refreshToken);
    return res.json({ accessToken });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@ValidateBody() dto: AuthLoginDto, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authServices.login(dto);
    this.attachCookie(res, refreshToken);
    return res.json({ accessToken });
  }

  @Get('refresh')
  @UseGuards(RtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(@GetUserId() id: string, @Cookies('jwt') jwt: string) {
    return this.authServices.refreshToken(id, jwt);
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@ValidateBody() dto: AuthLoginDto) {
    return this.authServices.resetPassword(dto);
  }

  @Protected()
  @Post('logout')
  async logout(
    @Res() res: Response,
    @GetUserId() id: string,
    @Cookies('jwt') jwt: string,
  ) {
    await this.authServices.logout(id, jwt, res);
  }

  private attachCookie(res: Response, token: string) {
    res.cookie('jwt', token, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'none',
      maxAge: this.timeToExpire,
    });
  }
}