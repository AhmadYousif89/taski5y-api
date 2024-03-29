import {
  Get,
  Req,
  Res,
  Post,
  Body,
  HttpCode,
  UseGuards,
  HttpStatus,
  Controller,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

import { GoogleUser } from './types';
import { AuthServices } from './auth.service';
import { AuthLoginDto, AuthRegisterDto } from './dto';
import { GoogleAuthGuard, RtAuthGuard } from './../common/guards';
import { Cookies, GetUser, Protected } from './../common/decorators';

@Controller('auth')
export class AuthController {
  private timeToExpire = 24 * 60 * 60 * 1000; // (1 Day)
  private gUser: GoogleUser;

  constructor(
    private config: ConfigService,
    private readonly authServices: AuthServices,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: AuthRegisterDto, @Res() res: Response) {
    const { user, refreshToken } = await this.authServices.register(dto);
    this.attachCookie(res, refreshToken);
    return res.json(user);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: AuthLoginDto, @Res() res: Response) {
    const { user, refreshToken } = await this.authServices.login(dto);
    this.attachCookie(res, refreshToken);
    return res.json(user);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @HttpCode(HttpStatus.OK)
  async googleAuth() {
    return 'Authentication with Google';
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @HttpCode(HttpStatus.TEMPORARY_REDIRECT)
  async googleRedirect(@Req() req: Request, @Res() res: Response) {
    this.gUser = req.user as GoogleUser;
    return this.authServices.googleRedirect(this.gUser, res);
  }

  @Get('google/login')
  async loginWithGoogle(@Res() res: Response) {
    if (this.gUser) {
      const { user, refreshToken } = await this.authServices.loginWithGoogle(
        this.gUser,
      );
      this.attachCookie(res, refreshToken);
      return res.status(HttpStatus.OK).json(user);
    }
    return res
      .status(HttpStatus.TEMPORARY_REDIRECT)
      .redirect(
        `${
          process.env.NODE_ENV === 'production'
            ? this.config.get('VERCEL_URL') || this.config.get('RENDER_URL')
            : this.config.get('DEV_URL')
        }`,
      );
  }

  @Get('refresh')
  @UseGuards(RtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(@GetUser('id') id: string, @Cookies('jwt') jwt: string) {
    return this.authServices.refreshToken(id, jwt);
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: AuthLoginDto) {
    return this.authServices.resetPassword(dto);
  }

  @Protected()
  @Post('logout')
  async logout(
    @Res() res: Response,
    @GetUser('id') id: string,
    @Cookies('jwt') jwt: string,
  ) {
    await this.authServices.logout(id, jwt, res);
  }

  private attachCookie(res: Response, token: string) {
    res.cookie('jwt', token, {
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      maxAge: this.timeToExpire,
    });
  }
}
