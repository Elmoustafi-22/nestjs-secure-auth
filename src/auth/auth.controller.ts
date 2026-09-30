import { Body, Controller, Get, Res, Req, HttpCode, HttpStatus, Post, UseGuards, Query } from '@nestjs/common';
import { AuthService, AuthResult } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { CurrentUser } from './guards/decorators/current-user.decorator';
import type { JwtPayload } from './types/jwt-payload.type';
import { SafeUser } from 'src/users/users.service';
import type { Request, Response } from 'express';
import { GoogleAuthService } from './google-auth.service';
import { ConfigService } from '@nestjs/config';

const OAUTH_STATE_COOKIE = 'google_oauth_state'

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly googleAuthService: GoogleAuthService,
        private readonly configService: ConfigService
    ) { }

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

    @Get('google')
    googleAuth(@Res() res: Response): void {
        const state = this.googleAuthService.generateState()

        res.cookie(OAUTH_STATE_COOKIE, state, {
            httpOnly: true,
            secure: this.configService.get('NODE_ENV') === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
        });

        const authorizationUrl = this.googleAuthService.getAuthorizationUrl(state);
        res.redirect(authorizationUrl)
    }

    @Get('google/callback')
    async googleCallback(
        @Query('code') code: string,
        @Query('state') state: string,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void> {
        const cookieState = (req.cookies as Record<string, string> | undefined)?.[
            OAUTH_STATE_COOKIE
        ];

        res.clearCookie(OAUTH_STATE_COOKIE);

        const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL')

        if (!code || !state || !cookieState || state !== cookieState) {
            res.redirect(`${frontendUrl}/auth/callback?error=invalid_oauth_state`)
            return;
        }

        try {
            const googleAccessToken = await this.googleAuthService.exchangeCodeForAccessToken(code)
            const profile = await this.googleAuthService.fetchProfile(googleAccessToken)

            const result = await this.authService.loginWithOAuthProfile({
                email: profile.email,
                name: profile.name,
                avatarUrl: profile.avatarUrl,
                googleId: profile.googleId,
            })

            this.setAuthCookies(res, result.accessToken, result.refreshToken)
            res.redirect(`${frontendUrl}/auth/callback`)
        } catch (error) {
            console.error('Google OAuth callback error:', error);
            res.redirect(`${frontendUrl}/auth/callback?error=google_auth_failed`)
        }
    }

    private setAuthCookies(
        res: Response,
        accessToken: string,
        refreshToken: string,
    ): void {
        const isProduction = this.configService.get('NODE_ENV') === 'production'

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
        })

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 1000,
        })
    }

}
