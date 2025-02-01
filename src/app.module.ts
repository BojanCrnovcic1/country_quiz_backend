import { Module } from '@nestjs/common';
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


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: DatabaseConfig.host,
      port: 3306,
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
    ])
  ],
  controllers: [
    AppController,
    CountryController,
    UserController,
    GameController,
  ],
  providers: [
    CountryService,
    UserService,
    GameService,
  ],
})
export class AppModule {}
