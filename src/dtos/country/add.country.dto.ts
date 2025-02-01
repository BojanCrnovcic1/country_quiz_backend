export class AddCountryDto {
    name: string;
    continent: "Afrika" | "Azija" | "Evropa" | "Sjeverna Amerika" | "Južna Amerika" | "Okeanija";
    capital: string;
    flagUrl: string;
}