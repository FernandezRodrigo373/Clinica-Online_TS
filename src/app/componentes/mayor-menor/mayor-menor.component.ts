import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service'; 
import { Router, RouterLink } from '@angular/router';  

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [NgIf],
  templateUrl: './mayor-menor.component.html',
  styleUrl: './mayor-menor.component.css'
})
export class MayorMenorComponent implements OnInit {
  deckId: string = '';
  cartaActual: any;
  cartaAnteriorValor: number = 0;
  puedeJugar = false;
  mensaje = '';
  contador = 0;
  estadoJuego: 'jugando' | 'perdiste' = 'jugando';
  emailUsuario: string = '';
  usuarioId: number = 0;
  record: number = 0;


  constructor(private router: Router, private http: HttpClient, private supabaseService: SupabaseService) {}

  async ngOnInit() 
  {
    this.iniciarJuego();
    const usuario = await this.supabaseService.obtenerUsuarioYId();

    if (usuario)
    {
      this.emailUsuario = usuario.email;
      this.usuarioId = usuario.id;

      
      this.record = await this.supabaseService.obtenerRecordMayorMenor(usuario.id);

    }
  }

  iniciarJuego()
   {
    this.http.get<any>('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
      .subscribe(data => {
        this.deckId = data.deck_id;
        this.sacarCartaInicial();
      });
  }

  sacarCartaInicial() 
  {
    this.http.get<any>(`https://deckofcardsapi.com/api/deck/${this.deckId}/draw/?count=1`)
      .subscribe(data => {
        this.cartaActual = data.cards[0];
        this.cartaAnteriorValor = this.valorCarta(this.cartaActual.value);
        this.puedeJugar = true;
        this.mensaje = '';
      });
  }
 
  async adivinar(opcion: 'mayor' | 'menor') 
  {
    this.puedeJugar = false;

    this.http.get<any>(`https://deckofcardsapi.com/api/deck/${this.deckId}/draw/?count=1`)
      .subscribe(data => {
        const nuevaCarta = data.cards[0];
        const nuevoValor = this.valorCarta(nuevaCarta.value);

        let resultado = '';

        if (nuevoValor > this.cartaAnteriorValor) {
          resultado = 'mayor';
        } else if (nuevoValor < this.cartaAnteriorValor) {
          resultado = 'menor';
        } else {
          resultado = 'igual';
        }

        this.cartaActual = nuevaCarta;

        if (resultado === 'igual') 
        {
          this.mensaje = 'Empate, no cuenta.';
          this.puedeJugar = true;
        } 
        else if (resultado === opcion) 
        {
          this.mensaje = '¡Correcto!';
          this.puedeJugar = true;
          this.contador++;
          this.cartaAnteriorValor = nuevoValor;
        } 
        else 
        {
          this.mensaje = `Incorrecto, era ${nuevaCarta.value} de ${nuevaCarta.suit}`;
          this.estadoJuego = 'perdiste';

          if (this.contador > this.record && this.usuarioId) 
          {
            this.record = this.contador;

            this.supabaseService.actualizarRecordMayorMenor(this.usuarioId, this.record);

          }
        }


      });
  }

  

  valorCarta(valor: string): number 
  {
    switch (valor) {
      case 'ACE': return 14;
      case 'KING': return 13;
      case 'QUEEN': return 12;
      case 'JACK': return 11;
      default: return parseInt(valor);
    }
  }

  reiniciar() 
  {
    this.deckId = '';
    this.cartaActual = null;
    this.cartaAnteriorValor = 0;
    this.puedeJugar = false;
    this.mensaje = '';
    this.contador = 0;
    this.estadoJuego = 'jugando';
    this.iniciarJuego();
  }

  irAlMenu() 
  {
    this.router.navigate(['/home']);
  }



}
