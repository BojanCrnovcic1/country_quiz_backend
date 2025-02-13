import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageConfig } from "config/storage.config";
import * as multer from "multer";
import { extname } from "path";
import { User } from "src/entities/user.entity";
import { ApiResponse } from "src/misc/api.response.class";
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
    @UseInterceptors(FileInterceptor('profile', {
        storage: multer.diskStorage({
            destination: StorageConfig.profile.destination,
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname);
              },
        }),
        fileFilter(req, file, cb) {
            const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
            const ext = extname(file.originalname).toLowerCase();
            if (allowedExtensions.includes(ext)) {
            cb(null, true);
        }
    }}))
    async loginPlayer(@Body() body: { username: string }, @UploadedFile() file: Express.Multer.File): Promise<User | ApiResponse> {
        const profilePictureUrl = file ? file.filename : null;

        return await this.userService.createUser(body.username, profilePictureUrl);
    }
}