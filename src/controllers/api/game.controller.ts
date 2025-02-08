import { Controller, Get, Post, Body } from '@nestjs/common';
import { Country } from 'src/entities/country.entity';
import { Score } from 'src/entities/score.entity';
import { ApiResponse } from 'src/misc/api.response.class';
import { GameService } from 'src/services/game/game.service';


@Controller('api/game')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Get('score-list')
    getScoreList(): Promise<Score[]> {
        return this.gameService.getLeaderboard();
    }

    @Get('generate-letters')
    generateRandomLetters(): Promise<string[]> {
        return this.gameService.generateRandomLetters();
    }

    @Post('check-country')
    checkCountry(@Body() { userId, selectedLetters }: { userId: number, selectedLetters: string[] })
    : Promise<{ points: number, response?: ApiResponse }> {
        return this.gameService.checkCountry(userId, selectedLetters);
    }

    @Get('random-country-continent')
    getRandomCountryWithContinents(): Promise<Country> {
        return this.gameService.getRandomCountryWithContinents();
    }

    @Post('check-continent')
    checkContinent(@Body() { userId, country, continent }: { userId: number, country: string, continent: string })
    : Promise <number>
    {
        return this.gameService.checkContinent(userId, country, continent);
    }

    @Get('random-flag')
    getRandomFlag() {
        return this.gameService.getRandomFlag();
    }

    @Post('check-flag')
    checkFlag(@Body() { userId, country, guess }: { userId: number, country: string, guess: string }) {
        return this.gameService.checkFlag(userId, country, guess);
    }

    @Get('random-country-capital')
    getRandomCountryWithCapitals() {
        return this.gameService.getRandomCountryWithCapitals();
    }

    @Post('check-capital')
    checkCapital(@Body() { userId, country, capital }: { userId: number, country: string, capital: string }) {
        return this.gameService.checkCapital(userId, country, capital);
    }

    @Get('random-flags')
    getRandomCountryWithFlags() {
        return this.gameService.getRandomCountryWithFlags();
    }

    @Post('check-flags')
    checkFlags(@Body(){ userId, country, flag}: {userId: number, country: string, flag: string}) {
        return this.gameService.checkFlagSelection(userId, country, flag);
    }
}
