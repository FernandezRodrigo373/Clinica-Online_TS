import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';  

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './ahorcado.component.html',
  styleUrl: './ahorcado.component.css'
})
export class AhorcadoComponent implements OnInit {

  palabras: string[] = ['MAMA', 'PERRO', 'JUEGO', 'CASA', 'GATO', 'ARBOL'];
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

  async ngOnInit() 
   {
    await this.iniciarJuego();

  }

  constructor(private router: Router)
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
    this.estadoJuego = 'jugando';
    this.letrasEstado = {};
    console.log("palabra secreta: ", this.palabraSecreta);
  }



  seleccionarLetra(letra: string) {
    if (this.letrasUsadas.includes(letra) || this.estadoJuego !== 'jugando')
    {      
      return;
    }

    this.letrasUsadas.push(letra);

    if (this.palabraSecreta.includes(letra)) {
      this.letrasCorrectas.push(letra);
      this.letrasEstado[letra] = 'correcta';

      } else {
        this.errores++;
        this.letrasEstado[letra] = 'incorrecta';

      }

    this.verificarVictoria();
    this.verificarDerrota();
  }

  verificarVictoria() {
  let todasAdivinadas = true;

  for (let i = 0; i < this.palabraSecreta.length; i++) {
    const letra = this.palabraSecreta[i];
    if (!this.letrasCorrectas.includes(letra)) {
      todasAdivinadas = false;
      break;
    }
  }

  if (todasAdivinadas) {
    this.estadoJuego = 'ganaste';
  }
}

  verificarDerrota() {
    if (this.errores >= this.maxErrores) {
      this.estadoJuego = 'perdiste';
    }
  }


  irAlMenu() {
    this.router.navigate(['/home']);
  }


}
