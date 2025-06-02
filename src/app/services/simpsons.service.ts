import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SimpsonsQuote {
  quote: string;
  character: string;
  image: string;
  characterDirection: string;
}

@Injectable({
  providedIn: 'root'
})
export class SimpsonsService {

  private apiUrl = 'https://thesimpsonsquoteapi.glitch.me/quotes?count=20';

  constructor(private http: HttpClient) {}

  obtenerInfo(): Observable<SimpsonsQuote[]> {
    return this.http.get<SimpsonsQuote[]>(this.apiUrl);
  }
}
