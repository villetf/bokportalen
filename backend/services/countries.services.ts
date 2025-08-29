import { AppDataSource } from '../data-source.js';
import { Country } from '../entities/Country.js';


export class CountriesService {
   static async getAllCountries() {
      const countries = await AppDataSource.getRepository(Country).find();

      return countries;
   }
}
