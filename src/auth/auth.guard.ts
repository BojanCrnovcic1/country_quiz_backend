import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { JwtService } from './jwt.service';
  import { Request } from 'express';
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(
      private readonly reflector: Reflector,
      private readonly jwtService: JwtService,
    ) {}
  
    canActivate(context: ExecutionContext): boolean {
      const roles = this.reflector.get<string[]>('roles', context.getHandler());
  
      if (!roles) return true;
  
      const request: Request = context.switchToHttp().getRequest();
      const authHeader = request.headers['authorization'];
  
      if (!authHeader) {
        throw new UnauthorizedException('Authorization header not found');
      }
  
      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('Invalid token format');
      }
  
      let admin;
      try {
        admin = this.jwtService.verifyAccessToken(token);
      } catch (error) {
        throw new UnauthorizedException('Invalid or expired access token');
      }
  
      if (!admin || !roles.includes(admin.role)) {
        throw new ForbiddenException('Access denied');
      }
  
      request['user'] = admin; 
      return true;
    }
  }