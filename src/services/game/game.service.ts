import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from 'src/entities/country.entity';
import { GameAttempt } from 'src/entities/game-attempt.entity';
import { Score } from 'src/entities/score.entity';
import { User } from 'src/entities/user.entity';
import { ApiResponse } from 'src/misc/api.response.class';
import { GameType } from 'src/misc/game.type';
import { Repository } from 'typeorm';


@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Country)
    private countryRepository: Repository<Country>,
    @InjectRepository(GameAttempt)
    private gameAttemptRepository: Repository<GameAttempt>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Score)
    private scoreRepository: Repository<Score>,
  ) {}

  async startGame(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) throw new BadRequestException('Korisnik ne postoji!');

    await this.scoreRepository.save({ userId, totalScore: 0 });
  }

  async generateRandomLetters(): Promise<string[]> {
    const letters = 'abcčćdđefghijklmnoprsštuvzž';
    const randomLetters: string[] = [];

    for (let i = 0; i < 30; i++) {
        randomLetters.push(letters.charAt(Math.floor(Math.random() * letters.length)));
    }

    return randomLetters;
  }

  async checkCountry(userId: number, selectedLetters: any): Promise<{ points: number, response?: ApiResponse }> {
    if (!userId) {
        throw new BadRequestException('Niste poslali userId!');
    }

    if (!selectedLetters) {
        throw new BadRequestException('Niste poslali slova za proveru!');
    }

    let word: string;

    if (Array.isArray(selectedLetters)) {
        word = selectedLetters.join('');
    } else if (typeof selectedLetters === 'string') {
        word = selectedLetters;
    } else {
        throw new BadRequestException('selectedLetters mora biti string ili niz slova!');
    }

    word = word.toLowerCase().replace(/\s+/g, ' ').trim();
   
    const country = await this.countryRepository.findOne({ 
        where: { name: word }
    });

    if (!country) {
        return {
            points: 0,
            response: new ApiResponse('error', -2001, 'Country is not found.')
        };
    }

    const points = word.replace(/\s/g, '').length;

      await this.updateScore(userId, points);
      await this.saveGameAttempt(userId, country.countryId, GameType.GENERISANJE_RIJECI, word, true, points);
    
      return { points };
  }



  async getRandomCountryWithContinents(): Promise<Country> {
    return this.countryRepository.createQueryBuilder('country')
      .orderBy('RAND()')
      .getOne();
  }

  async checkContinent(userId: number, country: string, continent: string): Promise<number> {
    const countryEntity = await this.countryRepository.findOne({ where: { name: country } });
    if (!countryEntity) throw new BadRequestException('Država ne postoji!');
    
    const isCorrect = countryEntity.continent === continent;
    const points = isCorrect ? 4 : -2;
    await this.updateScore(userId, points);
    await this.saveGameAttempt(userId, countryEntity.countryId, GameType.KONTINENT_POGADJANJE, continent, isCorrect, points);
    return points;
  }

  async getRandomFlag(): Promise<Country> {
    return this.countryRepository.createQueryBuilder('country')
      .orderBy('RAND()')
      .getOne();
  }

  async checkFlag(userId: number, country: string, guess: string): Promise<number> {
    const countryEntity = await this.countryRepository.findOne({ where: { name: country } });
    if (!countryEntity) {
        return 0;
    };

    const isCorrect = countryEntity.name.toLowerCase() === guess.toLowerCase();
    const points = isCorrect ? 8 : 0;
    await this.updateScore(userId, points);
    await this.saveGameAttempt(userId, countryEntity.countryId, GameType.ZASTAVA_POGADJANJE, guess, isCorrect, points);
    return points;
  }

  async getRandomCountryWithCapitals(): Promise<any> {
    const countries = await this.countryRepository.createQueryBuilder('country')
      .orderBy('RAND()')
      .take(4)
      .getMany();

      const currentCapitalIndex = Math.floor(Math.random() * 4);
      const question = {
        countryId: countries[currentCapitalIndex].countryId,
        countryName: countries[currentCapitalIndex].name,
        capitals:countries.map((country, index) => {
            return {
                capital: country.capital,
                isCurrent: index === currentCapitalIndex
            }
        }) 
      }
      return question;
  }

  async checkCapital(userId: number, country: string, capital: string): Promise<number> {
    const countryEntity = await this.countryRepository.findOne({ where: { name: country } });
    if (!countryEntity) throw new BadRequestException('Država ne postoji!');
    
    const isCorrect = countryEntity.capital.toLowerCase() === capital.toLowerCase();
    const points = isCorrect ? 4 : -3;
    await this.updateScore(userId, points);
    await this.saveGameAttempt(userId, countryEntity.countryId, GameType.GLAVNI_GRAD_POGADJANJE, capital, isCorrect, points);
    return points;
  }

  async getRandomCountryWithFlags(): Promise<any> {
    const countries = await this.countryRepository.createQueryBuilder('country')
      .orderBy('RAND()')
      .take(3)
      .getMany();

      const currentFlagIndex = Math.floor(Math.random() * 3);
      const question = {
        countryId: countries[currentFlagIndex].countryId,
        countryName: countries[currentFlagIndex].name,
        capital: countries[currentFlagIndex].capital,
        flags: countries.map((country, index) => {
            return {
                flagUrl: country.flagUrl,
                isCurrent: index === currentFlagIndex
            }
        }),       
      }
      return question
  }

  async checkFlagSelection(userId: number, country: string, flag: string): Promise<number> {
    const countryEntity = await this.countryRepository.findOne({ where: { name: country } });
    if (!countryEntity) throw new BadRequestException('Država ne postoji!');

    const isCorrect = countryEntity.flagUrl === flag;
    const points = isCorrect ? 5 : 0;
    await this.updateScore(userId, points);
    await this.saveGameAttempt(userId, countryEntity.countryId, GameType.ZASTAVA_IZBOR, flag, isCorrect, points);
    return points;
  }

  async getLeaderboard(): Promise<Score[]> {
    return this.scoreRepository.find({ order: { totalScore: 'DESC' }, take: 10 });
  }

  
  private async saveGameAttempt(userId: number, countryId: number, gameType: GameType, answer: string, isCorrect: boolean, points: number) {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) throw new BadRequestException('Korisnik ne postoji!');
  
    const country = await this.countryRepository.findOne({ where: { countryId } });
    if (!country) throw new BadRequestException('Država ne postoji!');
  
    await this.gameAttemptRepository.save({
      user,
      country,
      gameType,
      answer,
      isCorrect,
      points,
    });
  }
  

  private async updateScore(userId: number, points: number) {
    const score = await this.scoreRepository.findOne({ where: { userId } });
    if (score) {
      score.totalScore += points;
      await this.scoreRepository.save(score);
    } else {
      await this.scoreRepository.save({ userId, totalScore: points });
    }
  }
}
