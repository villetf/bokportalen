import { Injectable } from '@angular/core';
import { Country } from '../types/Country.model';


@Injectable({ providedIn: 'root' })
export class CountriesService {
   async getAllCountries(): Promise<Country[]> {
      const response = await fetch('http://localhost:3000/countries');
      const data: Country[] = await response.json();
      return data.sort((a, b) => a.name.localeCompare(b.name));
   }
}