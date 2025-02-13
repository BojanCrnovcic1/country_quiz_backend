import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from 'src/entities/country.entity';
import { GameAttempt } from 'src/entities/game-attempt.entity';
import { Score } from 'src/entities/score.entity';
import { User } from 'src/entities/user.entity';
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

    const randomCountry = await this.countryRepository
        .createQueryBuilder("country")
        .orderBy("RAND()")
        .limit(1)
        .getOne();   

    if (!randomCountry) {
        throw new Error("Nema dostupnih država u bazi.");
    }

    let countryLetters = randomCountry.name.toLowerCase().replace(/\s+/g, '').split(''); 

    while (countryLetters.length < 30) {
        countryLetters.push(letters.charAt(Math.floor(Math.random() * letters.length)));
    }

    for (let i = countryLetters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [countryLetters[i], countryLetters[j]] = [countryLetters[j], countryLetters[i]];
    }

    return countryLetters;
}

async checkCountry(userId: number, selectedLetters: any, allGeneratedLetters?: string[]): Promise<{ points: number, longestWord?: string }> {
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

    word = word.toLowerCase().replace(/\s+/g, '').trim();
    const availableLetters = word.split("");

    const existingCountry = await this.countryRepository.findOne({ where: { name: word } });

    if (!existingCountry) {

        const longestWord = allGeneratedLetters ? await this.findLongestWord(allGeneratedLetters) : undefined;

        return { points: 0, longestWord };
    }

    const points = word.replace(/\s/g, '').length;
    await this.updateScore(userId, points);

    const longestWord = allGeneratedLetters ? await this.findLongestWord(allGeneratedLetters) : undefined;

    return { points, longestWord };
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
    }

    const normalizeText = (text: string): string => {
        return text
            .toLowerCase()
            .replace(/č/g, 'c')
            .replace(/ć/g, 'c')
            .replace(/đ/g, 'dj')
            .replace(/š/g, 's')
            .replace(/ž/g, 'z');
    };

    const normalizedCountryName = normalizeText(countryEntity.name);
    const normalizedGuess = normalizeText(guess);

    const isCorrect = normalizedCountryName === normalizedGuess;
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

  async getRandomCountryPopulation(): Promise<Country[]> {
    const totalCount = await this.countryRepository.count();

    if (totalCount < 2) {
        throw new BadRequestException('Nema dovoljno država u bazi.');
    }

    const countries = await this.countryRepository.createQueryBuilder('country')
        .orderBy('RAND()')
        .take(2)
        .getMany();

    if (!countries.length) {
        throw new BadRequestException('Neuspiješno dobijanje država.');
    }

    return countries;
}

async checkPopulationAnswer(userId: number, countryId: number, question: any): Promise<number> {
    if (!question?.populations || !Array.isArray(question.populations) || question.populations.length !== 2) {
        throw new BadRequestException('Pitanje mora sadržati tačno dve države.');
    }

    const selectedCountry = question.populations.find((c: any) => c.countryId === countryId);
    if (!selectedCountry) {
        throw new BadRequestException('Izabrana država ne postoji u pitanju.');
    }

    const [firstCountry, secondCountry] = question.populations;

    if (!firstCountry || !secondCountry || firstCountry.population === undefined || secondCountry.population === undefined) {
        throw new BadRequestException('Podaci o populaciji nisu validni.');
    }

    if (firstCountry.population === secondCountry.population) {
        await this.saveGameAttempt(userId, countryId, GameType.POPULACIJA_POGADJANJE, JSON.stringify(question), null, 0);
        return 0;
    }

    const correctAnswer = firstCountry.population > secondCountry.population
        ? firstCountry.countryId
        : secondCountry.countryId;

    const points = countryId === correctAnswer ? 5 : -2;

    await this.updateScore(userId, points);

    await this.saveGameAttempt(userId, countryId, GameType.POPULACIJA_POGADJANJE, JSON.stringify(question), correctAnswer, points);

    return points;
}


  async getLeaderboard(): Promise<Score[]> {
    return this.scoreRepository.find({relations: ['user'], order: { totalScore: 'DESC' } });
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

  private async findLongestWord(availableLetters: string[]): Promise<string> {
    const allWords = await this.countryRepository.find();
    let longestWord = "";
    let longestOriginal = "";

    for (const country of allWords) {
        const wordWithoutSpaces = country.name.toLowerCase().replace(/\s+/g, '').trim();
        
        if (this.canFormWord(wordWithoutSpaces, availableLetters)) {          
            if (wordWithoutSpaces.length > longestWord.length) {
                longestWord = wordWithoutSpaces;
                longestOriginal = country.name; 
            }
        }
    }

    return longestOriginal || "Nema moguće reči";
}

private canFormWord(word: string, availableLetters: string[]): boolean {
    let lettersCopy = [...availableLetters];

    for (const letter of word) {
        const index = lettersCopy.indexOf(letter);
        if (index === -1) {
            return false;
        }
        lettersCopy.splice(index, 1);
    }

    return true;
}
}
