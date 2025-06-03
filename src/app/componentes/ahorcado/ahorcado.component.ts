import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';  
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './ahorcado.component.html',
  styleUrl: './ahorcado.component.css'
})
export class AhorcadoComponent implements OnInit {

  palabras: string[] = ['MAMA', 'PERRO', 'JUEGO', 'CASA', 'GATO', 'ARBOL', 'CABALLO', 'MESA', 'ARGENTINA', 'PLANTA', 'MANZANA',];
  palabraSecreta = ''; 
  letrasUsadas: string[] = [];
  letrasCorrectas: string[] = [];
  errores = 0;
  maxErrores = 6;
  estadoJuego: 'jugando' | 'ganaste' | 'perdiste' = 'jugando';
  abecedario: string[] = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
  fila1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  fila2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  fila3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];
  letrasEstado: { [letra: string]: 'correcta' | 'incorrecta' | null } = {};

  usuarioId: number = 0;
  emailUsuario: string = '';
  mejorTiempo: number = 0;
  mejorIntentos: number = 0;
  tiempoTranscurrido: number = 0;
  private intervalId: any = null;
  juegoFinalizado: boolean = false;
  intentosUsados: number = 0;
  


  async ngOnInit() 
   {
     const usuario = await this.supabaseService.obtenerUsuarioYId();
      if (usuario)
      {
      this.usuarioId = usuario.id;
      this.emailUsuario = usuario.email;

      const record = await this.supabaseService.obtenerRecordAhorcado(this.usuarioId);
      this.mejorTiempo = record.menor_tiempo;
      this.mejorIntentos = record.menos_intentos;
    }

    await this.iniciarJuego();

  }

  constructor(private router: Router, private supabaseService:SupabaseService)
  {

  }

  iniciarJuego()
  {
    console.log("cantidad errores: ", this.errores);
    const indiceAleatorio = Math.floor(Math.random() * this.palabras.length);
    this.palabraSecreta = this.palabras[indiceAleatorio];
    this.letrasUsadas = [];
    this.letrasCorrectas = [];
    this.errores = 0;
    this.intentosUsados = 0; 
    this.estadoJuego = 'jugando';
    this.letrasEstado = {};
    console.log("palabra secreta: ", this.palabraSecreta);
    this.detenerTimer();
    this.tiempoTranscurrido = 0;
    this.iniciarTimer();
  }



  seleccionarLetra(letra: string) 
  {
    if (this.letrasUsadas.includes(letra) || this.estadoJuego !== 'jugando')
    {      
      return;
    }

    this.letrasUsadas.push(letra);
    this.intentosUsados++;

    if (this.palabraSecreta.includes(letra)) {
      this.letrasCorrectas.push(letra);
      this.letrasEstado[letra] = 'correcta';

      } else {
        this.errores++;
        this.letrasEstado[letra] = 'incorrecta';

      }

    this.verificarVictoria();
    this.verificarDerrota();
    console.log("intentos", this.intentosUsados);
  }

  verificarVictoria() 
  {
    let todasAdivinadas = true;

    for (let i = 0; i < this.palabraSecreta.length; i++) {
      const letra = this.palabraSecreta[i];
      if (!this.letrasCorrectas.includes(letra)) {
        todasAdivinadas = false;
        break;
      }
    }

    if (todasAdivinadas)
    {
        this.estadoJuego = 'ganaste';
        this.juegoFinalizado = true;
        this.detenerTimer();

        if ( this.tiempoTranscurrido < this.mejorTiempo || this.mejorTiempo === 0 ||this.intentosUsados < this.mejorIntentos || this.mejorIntentos === 0)
        {
            this.supabaseService.actualizarRecordAhorcado(
            this.usuarioId,
            this.tiempoTranscurrido,
            this.intentosUsados
          );
            this.mejorTiempo = this.tiempoTranscurrido;
             this.mejorIntentos = this.intentosUsados;
        }
    }
  }

  verificarDerrota() {
    if (this.errores >= this.maxErrores) {
      this.estadoJuego = 'perdiste';
      this.detenerTimer();
    }
  }


  irAlMenu() {
    this.router.navigate(['/home']);
  }

  iniciarTimer(): void 
  {
    this.intervalId = setInterval(() => {
      this.tiempoTranscurrido++;
    }, 1000);
  }

  detenerTimer(): void 
  {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }



}
