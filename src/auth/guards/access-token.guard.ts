import { CanActivate, Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthenticatedRequest } from '../types/authenticated-request.type';
import { Request } from 'express';
import { JwtPayload } from '../types/jwt-payload.type';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AccessTokenGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException('Missing access Token')
        }

        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(
                token, {
                secret: this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
            });

            (request as AuthenticatedRequest).user = payload;
        } catch {
            throw new UnauthorizedException('Invalid or expired token')
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return undefined;
        }

        const [type, token] = authHeader.split(' ');
        return type === 'Bearer' ? token : undefined;
    }
}