import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenGuard } from './guards/access-token.guard';


@Module({
    imports: [UsersModule, JwtModule],
    controllers: [AuthController],
    providers: [AuthService, AccessTokenGuard],
})
export class AuthModule { }