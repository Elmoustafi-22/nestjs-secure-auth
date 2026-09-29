import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService, AuthResult } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { CurrentUser } from './guards/decorators/current-user.decorator';
import type { JwtPayload } from './types/jwt-payload.type';
import { SafeUser } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: RegisterDto): Promise<AuthResult> {
        return this.authService.register(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto): Promise<AuthResult> {
        return this.authService.login(dto);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refresh(dto);
    }

    @Post('logout')
    @UseGuards(AccessTokenGuard)
    @HttpCode(HttpStatus.OK)
    async logout(@CurrentUser() user: JwtPayload): Promise<{ success: true }> {
        return this.authService.logout(user.sub)
    }

    @Get('me')
    @UseGuards(AccessTokenGuard)
    @HttpCode(HttpStatus.OK)
    async getprofile(@CurrentUser() user: JwtPayload): Promise<SafeUser> {
        return this.authService.getProfile(user.sub)
    }
}
