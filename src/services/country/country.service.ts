import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AddCountryDto } from "src/dtos/country/add.country.dto";
import { Country } from "src/entities/country.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { Repository } from "typeorm";

@Injectable()
export class CountryService {
    constructor(
        @InjectRepository(Country) private readonly countryRepository: Repository<Country>,
    ) {}

    async getCountriesAdmin(
        page: number = 1,
        size: number = 10,
        continent?: "Afrika" | "Azija" | "Evropa" | "Sjeverna Amerika" | "Južna Amerika" | "Okeanija",
        search?: string,
        sortBy: "name" | "continent" = "name",
        sortOrder: "ASC" | "DESC" = "ASC"
    ): Promise<{ data: Country[]; total: number; page: number; size: number }> {
        const whereCondition: any = {};
        
        if (continent) {
            whereCondition.continent = continent;
        }
        
        if (search) {
            whereCondition.name = `%${search}%`;
        }
        
        const [data, total] = await this.countryRepository.findAndCount({
            where: whereCondition,
            relations: ['gameAttempts'],
            take: size,
            skip: (page - 1) * size,
            order: { [sortBy]: sortOrder }
        });
    
        return {
            data,
            total,
            page,
            size
        };
    }    

    async getAllCountry(): Promise<Country[]> {
        return await this.countryRepository.find({
            relations: ['gameAttempts']
        });
    }

    async getCountriesByContinent(continent: "Afrika" | "Azija" | "Evropa" | "Sjeverna Amerika" | "Južna Amerika" | "Okeanija"): Promise<Country[]> {
        return this.countryRepository.find({ where: { continent: continent } });
    }

    async getCountryById(countryId: number): Promise<Country | ApiResponse> {
        const country = await this.countryRepository.findOne({
            where: { countryId: countryId},
            relations: ['gameAttempts']
        })
        if (!country) {
            return new ApiResponse('error', -2001, 'Country not found.')
        }
        return country;
    }

    async getCountyByName(name: string): Promise<Country | ApiResponse> {
        const country = await this.countryRepository.findOne({
            where: {name: name},
            relations: ['gameAttempts']
        })
        if (!country) {
            return new ApiResponse('error', -2001, 'Country not found.')
        }
        return country;
    }

    async addCountry(data: AddCountryDto): Promise<Country | ApiResponse> {
        const existingCountry = await this.countryRepository.findOne({where: {name: data.name}});
        if (existingCountry) {
            return new ApiResponse('error', -2002, 'Country with this name already exist.')
        }
        const newCountry = this.countryRepository.create(data);
        
        const saveCountry = this.countryRepository.save(newCountry);
        if (!saveCountry) {
            return new ApiResponse('error', -2003, 'Country not saved.')
        }
        return saveCountry;
    }

    async updateCountry(countryId: number, updateCountryDto: AddCountryDto): Promise<Country | ApiResponse> {
        const country = await this.countryRepository.findOne({where: {countryId: countryId}})
        if (!country) {
            return new ApiResponse('error', -2001, 'Country not found.')
        }
   
        if (updateCountryDto.name && updateCountryDto.name !== country.name) {
          const existingCountry = await this.countryRepository.findOneBy({ name: updateCountryDto.name });
          if (existingCountry) {
            return new ApiResponse('error', -2002, 'Country with this name already exist.')
          }
        }
  
        Object.assign(country, updateCountryDto);
        return this.countryRepository.save(country);
    }

    async removeCountry(countryId: number): Promise<Country | ApiResponse> {
        const country = await this.countryRepository.findOne({where: {countryId: countryId}});

        if (!country) {
            return new ApiResponse('error', -2001, 'Country not found.')
        }
        
        return await this.countryRepository.remove(country);
    }
}