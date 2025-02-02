import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "./jwt.service";
import { AdminService } from "src/services/admin/admin.service";
import * as bcrypt from "bcrypt";
import { Admin } from "src/entities/admin.entity";
import { Request } from "express";
import { LoginAdminDto } from "src/dtos/admin/login.admin.dto";


@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly adminService: AdminService
    ) {}

    async validateAdmin(username: string, password: string): Promise<Admin | null> {
        const admin = await this.adminService.getAdminByUsername(username);

        if(admin && bcrypt.compare(password, admin.passwordHash)) {
            return admin;
        }
        return null;
    }

    async login(loginAdminDto: LoginAdminDto): Promise<{accessToken: string, refreshToken: string}> {
        const admin = await this.validateAdmin(
          loginAdminDto.username,
          loginAdminDto.password
        );
    
        if (!admin) {
          throw new UnauthorizedException('Invalid credentials');
        }

        const adminFarToken = {
            adminId: admin.adminId,
            username: admin.username,
        }
    
        return {
            accessToken: this.jwtService.signAccessToken(adminFarToken),
            refreshToken: this.jwtService.signRefreshToken(adminFarToken)
        }
      }

      async getCurrentAdmin(req: Request) {
        return req['admin'];
      }
}