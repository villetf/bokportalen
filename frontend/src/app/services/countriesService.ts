import { Injectable } from '@angular/core';
import { Country } from '../types/Country.model';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class CountriesService {
   private apiUrl = environment.apiUrl;

   async getAllCountries(): Promise<Country[]> {
      const response = await fetch(`${this.apiUrl}/countries`);
      const data: Country[] = await response.json();
      return data.sort((a, b) => a.name.localeCompare(b.name));
   }
}