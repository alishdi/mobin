import { 
  Controller, Post, Body, HttpCode, HttpStatus, Res, Req, UseGuards, 
  UnauthorizedException
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { RefreshGuard } from './guards/refresh.guard'; 

@ApiTags('احراز هویت (Auth)')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOperation({ summary: 'ورود به سیستم' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto.phone, loginDto.password);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    const isDev = this.configService.get<string>('NODE_ENV') === 'development';
    return {
      message: 'ورود با موفقیت انجام شد',
      user: result.user,
      ...(isDev && { 
        accessToken: result.accessToken,
        refreshToken: result.refreshToken 
      }),
    };
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOperation({ summary: 'ثبت‌نام کاربر جدید' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(registerDto);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    const isDev = this.configService.get<string>('NODE_ENV') === 'development';
    return {
      message: 'ثبت‌نام با موفقیت انجام شد',
      user: result.user,
      ...(isDev && { 
        accessToken: result.accessToken,
        refreshToken: result.refreshToken 
      }),
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshGuard)
  @ApiOperation({ summary: 'تولید توکن جدید با refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: User,
  ) {
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token یافت نشد');
    }

    const result = await this.authService.refreshTokens(user, refreshToken);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    const isDev = this.configService.get<string>('NODE_ENV') === 'development';
    return {
      message: 'توکن با موفقیت به‌روزرسانی شد',
      user: result.user,
      ...(isDev && { 
        accessToken: result.accessToken,
        refreshToken: result.refreshToken 
      }),
    };
  }

  @Post('profile')
  @ApiOperation({ summary: 'دریافت پروفایل کاربر فعلی' })
  getProfile(@CurrentUser() user: User) {
    const { password, deletedAt, ...safeUser } = user;
    return { data: safeUser };
  }

  @Post('logout')
  @ApiOperation({ summary: 'خروج از سیستم' })
  async logout(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.id);

    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });

    return { message: 'خروج با موفقیت انجام شد' };
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const isDev = this.configService.get<string>('NODE_ENV') === 'development';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: !isDev,
      sameSite: isDev ? 'lax' : 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: !isDev,
      sameSite: isDev ? 'lax' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }
}