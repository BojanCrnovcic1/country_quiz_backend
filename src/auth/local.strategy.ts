import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { LoginAdminDto } from 'src/dtos/admin/login.admin.dto';


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const loginAdminDto: LoginAdminDto = { username, password };
    return await this.authService.validateAdmin(
      loginAdminDto.username,
      loginAdminDto.password
    );
  }
  
}