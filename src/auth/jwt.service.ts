import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { jwtSecret } from "config/jwt.secret";

@Injectable()
export class JwtService {
    constructor(private readonly jwtService: NestJwtService) {}

    signAccessToken(payload: any): string {
        return this.jwtService.sign(payload, { secret: jwtSecret, expiresIn: '30m' });
    }
  
    signRefreshToken(payload: any): string {
        return this.jwtService.sign(payload, { secret: jwtSecret, expiresIn: '90d' });
    }
      
    verifyAccessToken(token: string): any {
        try {
            const result = this.jwtService.verify(token, { secret: jwtSecret });
            return result;
        } catch (error) {
            console.error('JWT verification error:', error);
            throw new Error('Invalid or malformed token');
        }
    }

    verifyRefreshToken(refreshToken: string): any {
        try {
          const payload = this.jwtService.verify(refreshToken, { secret: jwtSecret });
          return payload;
        } catch (error) {
          if (error === 'TokenExpiredError') {
            throw new UnauthorizedException('Refresh token expired, please log in again.');
          }
          throw new UnauthorizedException('Invalid refresh token');
        }
    }

    generateTokens(payload: any): { accessToken: string; refreshToken: string } {
        const accessToken = this.signAccessToken(payload);
        const refreshToken = this.signRefreshToken(payload);
        return { accessToken, refreshToken };
    }
}