import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Country } from '../types/Country.model';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class CountriesService {
   private apiUrl = environment.apiUrl;
   constructor(private http: HttpClient) {}

   async getAllCountries(): Promise<Country[]> {
      const data = await firstValueFrom(this.http.get<Country[]>(`${this.apiUrl}/countries`));
      return data.sort((a, b) => a.name.localeCompare(b.name));
   }
}
