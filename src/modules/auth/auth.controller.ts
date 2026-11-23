import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('احراز هویت (Auth)')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) { }

  @Public()
  @Post('login')
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  @ApiOperation({ summary: 'ورود کاربر' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    const isDevelopment = this.configService.get<string>('NODE_ENV') === 'development';

    res.cookie('access_token', result.data.accessToken, {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    });

    res.cookie('refresh_token', result.data.refreshToken, {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    if (!isDevelopment) {
      delete result.data.accessToken;
      delete result.data.refreshToken;
    }

    return result;
  }

  @Public()
  @Post('register')
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  @ApiOperation({ summary: 'ثبت‌نام کاربر جدید' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('refresh')
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  @ApiOperation({ summary: 'تجدید توکن‌ها' })
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'] || req.body.refreshToken;

    const result = await this.authService.refreshTokens(refreshToken);
    const isDevelopment = this.configService.get<string>('NODE_ENV') === 'development';

    res.cookie('access_token', result.data.accessToken, {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', result.data.refreshToken, {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    if (!isDevelopment) {
      delete result.data.accessToken;
      delete result.data.refreshToken;
    }

    return result;
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'خروج کاربر' })
  async logout(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    // ✅ پاک کردن کوکی‌ها هنگام خروج
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return this.authService.logout(user.id);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'دریافت اطلاعات کاربر فعلی' })
  getMe(@CurrentUser() user: User) {
    return this.authService.getMe(user.id);
  }
}