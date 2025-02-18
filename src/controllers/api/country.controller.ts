import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageConfig } from "config/storage.config";
import * as multer from "multer";
import { extname } from "path";
import { AddCountryDto } from "src/dtos/country/add.country.dto";
import { Country } from "src/entities/country.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { supabase } from "src/misc/supabase.client";
import { CountryService } from "src/services/country/country.service";

@Controller('api/country')
export class CountryController {
    constructor(
        private readonly countryService: CountryService,
    ) {}

    @Get('filter-country')
    async getCountriesAdmin(
        @Query("page") page: number = 1,
        @Query("size") size: number = 10,
        @Query("continent") continent?: "Afrika" | "Azija" | "Evropa" | "Sjeverna Amerika" | "Južna Amerika" | "Okeanija",
        @Query("search") search?: string,
        @Query("sortBy") sortBy: "name" | "continent" = "name",
        @Query("sortOrder") sortOrder: "ASC" | "DESC" = "ASC"
    ) {
        return this.countryService.getCountriesAdmin(page, size, continent, search, sortBy, sortOrder);
    }

    @Get()
    async getAllCountry(): Promise<Country[]> {
        return await this.countryService.getAllCountry();
    }

    @Get(':id')
    async getCountryById(@Param('id') countryId: number): Promise<Country | ApiResponse> {
        return await this.countryService.getCountryById(countryId);
    }

    @Get('name/:name')
    async getCountryByName(@Param('name') name: string): Promise<Country | ApiResponse> {
        return await this.countryService.getCountyByName(name);
    }

    @Get('/continent/:continent')
    async getCountriesByContinent(@Param('continent') continent: string): Promise<Country[] | ApiResponse> {
        const validContinents = ["Afrika", "Azija", "Evropa", "Sjeverna Amerika", "Južna Amerika", "Okeanija"];
        if (!validContinents.includes(continent)) {
            return new ApiResponse('error', -2004, 'Invalid continent name.');
        }
        return this.countryService.getCountriesByContinent(continent as any);
    }

    @Post('addCountry')
    @UseInterceptors(FileInterceptor('flag'))
    async addNewCountry(
        @UploadedFile() file: Express.Multer.File,
        @Body() data: AddCountryDto
    ): Promise<Country | ApiResponse> {
        let flagUrl = '';
    
        if (file) {
            const fileExt = extname(file.originalname);
            const fileName = `flag-${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
    
            const { data: uploadData, error } = await supabase.storage
                .from('flags') 
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                });
    
            if (error) {
                throw new Error(`Greška pri uploadu zastave: ${error.message}`);
            }
    
            const { data: publicURLData } = supabase.storage
                .from('flags')
                .getPublicUrl(fileName);
    
            flagUrl = publicURLData.publicUrl;
        }
    
        const newCountryData: AddCountryDto = {
            ...data,
            flagUrl: flagUrl
        };
    
        return this.countryService.addCountry(newCountryData);
    }

    @Patch(':id/editCountry')
    async updateCountry(@Param('id') countryId: number, @Body() data: AddCountryDto): Promise<Country | ApiResponse> {
        return await this.countryService.updateCountry(countryId, data);
    }

    @Delete(':id/remove')
    async removeCountry(@Param('id') countryId: number): Promise<Country | ApiResponse> {
        return await this.countryService.removeCountry(countryId);
    }
}