import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimpsonsService, SimpsonsQuote } from '../../services/simpsons.service';
import { SupabaseService } from '../../services/supabase.service';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';  


@Component({
  selector: 'app-preguntados',
  standalone: true,
  imports: [CommonModule,  HttpClientModule],
  templateUrl: './preguntados.component.html',
  styleUrls: ['./preguntados.component.css']
})
export class PreguntadosComponent implements OnInit {

  private traducciones: { [key: string]: string } = {
    'Homer Simpson': 'Homero Simpson',  
    'Mr. Burns': 'Sr. Burns',   
    'Moe Szyslak': 'Moe',
    'Apu Nahasapeemapetilon': 'Apu',
    'Groundskeeper Willie': 'Willie',
    'Comic Book Guy': 'Hombre de las historietas',
    'Chief Wiggum' : 'Jefe Gorgory',
    'Rainier Wolfcastle': 'McBain',
    'Ralph Wiggum': 'Ralph',
    'Principal Skinner': 'Sr. Skinner',
    'Duffman': 'Hombre Duff'

  };

  personajeCorrecto = '';
  imagen = '';
  opciones: string[] = [];
  mensaje = '';
  cargando = true;
  respondido = false; 
  personajesUsados: string[] = [];
  contadorAciertos:number = 0;
  vidas: number = 3; 
  juegoTerminado: boolean = false;
  tiempoTranscurrido: number = 0; 
  private intervalId: any = null;


  emailUsuario: string = '';
  usuarioId: number = 0;
  record: number = 0;

  gifActual: string = 'assets/jugando.gif';  

  vidasPrevias = this.vidas;
  aciertosPrevios = this.contadorAciertos;

  constructor(private simpsonsService: SimpsonsService, private router: Router,private supabaseService: SupabaseService) {}


  async ngOnInit(): Promise<void>
  {
    const usuario = await this.supabaseService.obtenerUsuarioYId();

      if (usuario) {
        this.emailUsuario = usuario.email;
        this.usuarioId = usuario.id;

        this.record = await this.supabaseService.obtenerRecordPreguntados(this.usuarioId);
      }
    this.cargarPregunta();
    this.iniciarTimer();
  }

  iniciarTimer(): void 
  {
    this.intervalId = setInterval(() => {
      if (!this.juegoTerminado) {
        this.tiempoTranscurrido++;
      } else {
        this.detenerTimer();
      }
    }, 1000);
  }

  detenerTimer(): void 
  {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  cargarPregunta(): void 
  {
    this.cargando = true;
    this.mensaje = '';
    this.respondido = false;

    this.simpsonsService.obtenerInfo().subscribe({
      next: (listaDePersonajes) => {
        const personajesSinRepetidos: SimpsonsQuote[] = [];

        for (const personaje of listaDePersonajes) {
          const yaExiste = personajesSinRepetidos.find(p => p.character === personaje.character);
          if (!yaExiste) {
            personajesSinRepetidos.push(personaje);
          }
        }
        // peersonajes que no fueron elegidos nunca como correctos
        const personajesNoUsados = personajesSinRepetidos.filter(p => !this.personajesUsados.includes(p.character));

        if (personajesNoUsados.length === 0) 
        {
          if (this.contadorAciertos > this.record && this.usuarioId)
          {
            this.record = this.contadorAciertos;
            this.supabaseService.actualizarPreguntados(this.usuarioId, this.record);
          }

          this.detenerTimer();
          this.mensaje = 'Ganaste. Llegaste al final del juego';
          this.cargando = false;
          this.opciones = [];
          this.imagen = '';
          this.personajeCorrecto = '';
          this.juegoTerminado = true;
          return;
        }

        // elegir personaje correcto solo de los no usados
        const indiceAleatorio = Math.floor(Math.random() * personajesNoUsados.length);
        const personajeCorrecto = personajesNoUsados[indiceAleatorio];

        this.personajesUsados.push(personajeCorrecto.character);
        this.personajeCorrecto = this.traducir(personajeCorrecto.character);
        this.imagen = personajeCorrecto.image;

        // se pueden repetir, se sacan de todos los personajes excepto el correcto actual
        const personajesParaOpciones = personajesSinRepetidos.filter(p => p.character !== personajeCorrecto.character);

        const personajesMezclados = this.mezclarOpciones(personajesParaOpciones);
        const personajeIncorrecto1 = personajesMezclados[0];
        const personajeIncorrecto2 = personajesMezclados[1];
        const personajeIncorrecto3 = personajesMezclados[2];

        const listaOpciones: string[] = [
          this.personajeCorrecto,
          this.traducir(personajeIncorrecto1.character),
          this.traducir(personajeIncorrecto2.character),
          this.traducir(personajeIncorrecto3.character),
        ];

        this.opciones = this.mezclarOpcionesStrings(listaOpciones);

        this.cargando = false;
      },
      error: () => {
        this.mensaje = 'Error al cargar los datos';
        this.cargando = false;
      }
    });
  }




  traducir(nombre: string): string 
  {
   return this.traducciones[nombre] || nombre;
  }


  async elegirOpcion(opcion: string): Promise<void> 
  {
    if (this.respondido)
    {
      return;  
    }
        
    if (opcion === this.personajeCorrecto) {
      this.contadorAciertos++;
      this.mensaje = '¡Correcto!';
    } 
    else 
    {
      this.vidas--;
      if (this.vidas <= 0) {
       this.detenerTimer();
        this.juegoTerminado = true;
        this.mensaje = `Juego terminado. No te quedan vidas. La respuesta correcta era: ${this.personajeCorrecto}`;
        if (this.contadorAciertos > this.record && this.usuarioId) 
        {
          this.record = this.contadorAciertos;
          await this.supabaseService.actualizarPreguntados(this.usuarioId, this.record);
        }
        
      } 
      else {
        this.mensaje = `Incorrecto. Te quedan ${this.vidas} vidas. Respuesta correcta: ${this.personajeCorrecto}`;
        if (this.contadorAciertos > this.record && this.usuarioId) 
        {
          this.record = this.contadorAciertos;
          await this.supabaseService.actualizarPreguntados(this.usuarioId, this.record);
        }
      }
    }


    
    this.actualizarGif();

    this.respondido = true;
  }

  siguientePregunta(): void 
  {
     this.gifActual = '';
      this.actualizarGif();
      if (this.juegoTerminado) 
      {
        return; 
      }
    this.cargarPregunta();
  }

  mezclarOpciones(opciones: SimpsonsQuote[]): SimpsonsQuote[] 
  {
    return opciones.sort(() => Math.random() - 0.5);
  }

  mezclarOpcionesStrings(opciones: string[]): string[] 
  {
    return opciones.sort(() => Math.random() - 0.5);
  }

  irAlMenu() 
    {
    this.router.navigate(['/home']);
  }

  reiniciarJuego(): void {
    this.gifActual = 'assets/jugando.gif';
    this.vidas = 3;
    this.contadorAciertos = 0;
    this.personajesUsados = [];
    this.juegoTerminado = false;
    this.cargarPregunta();
    this.tiempoTranscurrido = 0;
    this.iniciarTimer();
  }



  actualizarGif() 
  {
    const vidasBajaron = this.vidas < this.vidasPrevias;
    const aciertosSubieron = this.contadorAciertos > this.aciertosPrevios;

    if (vidasBajaron) 
      {
      if (this.vidas < 1) 
        {
        this.gifActual = 'assets/vidas1.gif';

        console.log('Bajaron vidas a menos de 1, gif error vidas1.gif');

      } 
      else if (this.vidas < 2) 
        {
        this.gifActual = 'assets/vidas2.gif';

        console.log('Bajaron vidas a menos de 2, gif error vidas2.gif');
      } 
      else 
      {
        this.gifActual = 'assets/vidas3.gif';

        console.log('Bajaron vidas a menos de 3, gif error vidas3.gif');
      }
    } 
    else if (aciertosSubieron) // Sólo entra acá si NO bajaron vidas, pero sí subieron aciertos
    {
      if (this.contadorAciertos < 10) {
        this.gifActual = `assets/acierto${this.contadorAciertos}.gif`;

        console.log(`Aciertos subieron y <10, gif acierto${this.contadorAciertos}.gif`);
      } else {
        this.gifActual = 'assets/aciertosmasdediez.gif';

        console.log('Aciertos subieron y >=10, gif aciertosmasdediez.gif');
      }
    } else {
      this.gifActual = 'assets/jugando.gif';

      console.log('Default gif jugando.gif');
    }

    this.vidasPrevias = this.vidas;
    this.aciertosPrevios = this.contadorAciertos;

  }

}