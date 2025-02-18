import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from '../src/controllers/app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from 'config/database.config';
import { Admin } from './entities/admin.entity';
import { Country } from './entities/country.entity';
import { GameAttempt } from './entities/game-attempt.entity';
import { Score } from './entities/score.entity';
import { User } from './entities/user.entity';
import { CountryController } from './controllers/api/country.controller';
import { CountryService } from './services/country/country.service';
import { UserService } from './services/user/user.service';
import { UserController } from './controllers/api/user.controller';
import { GameController } from './controllers/api/game.controller';
import { GameService } from './services/game/game.service';
import { AuthController } from './controllers/auth.controller';
import { AdminService } from './services/admin/admin.service';
import { AuthService } from './auth/auth.service';
import { JwtService } from './auth/jwt.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { LocalStrategy } from './auth/local.strategy';
import { AuthMiddleware } from './auth/auth.middleware';
import { AuthGuard } from './auth/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { jwtSecret } from 'config/jwt.secret';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: DatabaseConfig.host,
      port: 3307,
      username: DatabaseConfig.username,
      password: DatabaseConfig.password,
      database: DatabaseConfig.database,
      entities: [
        Admin,
        Country,
        GameAttempt,
        Score,
        User
      ]
    }),
    TypeOrmModule.forFeature([
      Admin,
      Country,
      GameAttempt,
      Score,
      User
    ]),
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '30m' },
    }),
  ],
  controllers: [
    AppController,
    CountryController,
    UserController,
    GameController,
    AuthController,
  ],
  providers: [
    CountryService,
    UserService,
    GameService,
    AdminService,
    AuthService,
    JwtService,
    JwtStrategy,
    LocalStrategy,
    AuthMiddleware,
    AuthGuard,
  ],
  exports: [
    AuthService
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware)
            .exclude('auth/*')
            .forRoutes('api/*')
  }
}
