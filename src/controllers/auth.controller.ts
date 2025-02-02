import { Body, Controller, Post, Req } from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";
import { LoginAdminDto } from "src/dtos/admin/login.admin.dto";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService, 
    ) {}

    @Post('admin/login')
    async login(@Body() data: LoginAdminDto) {
        return await this.authService.login(data);
    }

    @Post('refresh')
    async refresh(@Req() req: Request) {
        const admin = req['admin']; 
        return this.authService.login({ username: admin.username, password: '' }); 
    }
}