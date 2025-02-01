import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {}

    async findUsers(): Promise<User[]> {
        return await this.userRepository.find();
    }

    async findUserById(userId: number): Promise<User | ApiResponse> {
        const user = await this.userRepository.findOne({where: {userId}});
        if (!user) {
            return new ApiResponse('error', -1001, 'User not found.')
        }
        return user;
    };

    async findUserByUsername(username: string): Promise<User | ApiResponse> {
        const user = await this.userRepository.findOne({where: {username}});
        if (!user) {
            return new ApiResponse('error', -1001, 'User not found.')
        }

        return user;
    };

    async createUser(username: string, profilePictureUrl: string | null): Promise<User | ApiResponse> {
        const existingUser = await this.userRepository.findOne({ where: { username } });
    
        if (existingUser) {
            if (existingUser.isLoggedIn) {
                return new ApiResponse('error', -1004, 'User already logged in. Only one login is allowed.');
            }
            
            return new ApiResponse('error', -1002, 'User with this name already exists.');
        }
    
        const newUser = this.userRepository.create({ username, profilePictureUrl, isLoggedIn: true });
        const savedUser = await this.userRepository.save(newUser);
    
        if (!savedUser) {
            return new ApiResponse('error', -1003, 'User is not saved.');
        }
    
        return savedUser;
    }
    
    async resetLoginStatus(username: string): Promise<ApiResponse> {
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) {
            return new ApiResponse('error', -1001, 'User not found.');
        }
    
        user.isLoggedIn = false;
        await this.userRepository.save(user);
        
        return new ApiResponse('success', 0, 'User can now log in again.');
    }    
}