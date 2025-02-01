import { Controller, Get, Post, Body } from '@nestjs/common';
import { GameService } from 'src/services/game/game.service';


@Controller('api/game')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Get('generate-letters')
    generateRandomLetters() {
        return this.gameService.generateRandomLetters();
    }

    @Post('check-country')
    checkCountry(@Body() { userId, word }: { userId: number, word: string }) {
        return this.gameService.checkCountry(userId, word);
    }

    @Get('random-country-continent')
    getRandomCountryWithContinents() {
        return this.gameService.getRandomCountryWithContinents();
    }

    @Post('check-continent')
    checkContinent(@Body() { userId, country, continent }: { userId: number, country: string, continent: string }) {
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
    checkFlags() {
        return this.checkFlags();
    }
}
