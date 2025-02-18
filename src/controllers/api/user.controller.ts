import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageConfig } from "config/storage.config";
import * as multer from "multer";
import { extname } from "path";
import { User } from "src/entities/user.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { supabase } from "src/misc/supabase.client";
import { UserService } from "src/services/user/user.service";

@Controller('api/user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) {}

    @Get()
    async findUsers(): Promise<User[]> {
        return await this.userService.findUsers();
    };

    @Get(':id')
    async findUserById(@Param('id') userId: number): Promise<User | ApiResponse> {
        return await this.userService.findUserById(userId);
    };

    @Get('username/:username')
    async findUserByUsername(@Param('username') username: string): Promise<User | ApiResponse> {
        return await this.userService.findUserByUsername(username);
    }

    @Post('login')
    @UseInterceptors(FileInterceptor('profile'))
    async loginPlayer(
        @Body() body: { username: string },
        @UploadedFile() file: Express.Multer.File
    ): Promise<User | ApiResponse> {
        if (!file) {
            return this.userService.createUser(body.username, null);
        }

        const fileExt = extname(file.originalname);
        const fileName = `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;

        const { data, error } = await supabase.storage
            .from('profile')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
            });

        if (error) {
            throw new Error(`Greška pri uploadu slike: ${error.message}`);
        }

        const { data: publicURLData } = supabase.storage
            .from('profile')
            .getPublicUrl(fileName);
    
        const profilePictureUrl = publicURLData.publicUrl;

        return this.userService.createUser(body.username, profilePictureUrl);
    }
}