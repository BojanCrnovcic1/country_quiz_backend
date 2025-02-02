import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Admin } from "src/entities/admin.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { Repository } from "typeorm";

@Injectable()
export class AdminService {
    constructor( @InjectRepository(Admin) private readonly adminRepository: Repository<Admin> ) {}

    async getAllAdmin(): Promise <Admin[]> {
        return await this.adminRepository.find();
    }

    async getAdminById(adminId: number): Promise <Admin | ApiResponse> {
        const admin = this.adminRepository.findOne({where: {adminId}});
        if (!admin) {
            return new ApiResponse('error', -5001, 'Admin not found!')
        }
        return admin;
    }

    async getAdminByUsername(username: string): Promise<Admin | undefined> {
        const admin = await this.adminRepository.findOne({where: {username: username}});
        if (admin) {
            return admin;
        }
        return undefined;
    }
}