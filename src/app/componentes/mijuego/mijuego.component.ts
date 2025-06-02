import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';  

interface PersonajeArgentino {
  nombre: string;
  categoria: 'Político' | 'Famoso' | 'Jugador' | 'Actor' | 'Presentador' | 'Cantante' | 'Personaje';
  genero: 'Hombre' | 'Mujer';
  edad: number;
  tipo: 'Persona real' | 'Personaje no animado' | 'Dibujito';
  estado: 'Vivo' | 'Fallecido';
  imagen: string;
}

interface ResultadoComparacion {
  categoria: 'ok' | 'mal';
  genero: 'ok' | 'mal';
  tipo: 'ok' | 'mal';
  estado: 'ok' | 'mal';
  edad: 'ok' | 'mal' | 'parcial';
  nombre: 'ok' | 'mal';
}

interface Intento extends PersonajeArgentino {
  resultado: ResultadoComparacion;
}

@Component({
  selector: 'app-mijuego',
  standalone: true,
  templateUrl: './mijuego.component.html',
  styleUrls: ['./mijuego.component.css'],
  imports: [CommonModule, FormsModule],
})
export class MijuegoComponent {
    nombreAdivinado: string = '';

    personas: PersonajeArgentino[] = [
    { nombre: 'Lionel Messi', categoria: 'Jugador', genero: 'Hombre', edad: 37, tipo: 'Persona real', estado: 'Vivo', imagen: '/assets/messi1.png' },
    { nombre: 'Guillermo Francella', categoria: 'Actor', genero: 'Hombre', edad: 70, tipo: 'Persona real', estado: 'Vivo',imagen: '/assets/francella.png' },
    { nombre: 'Mirtha Legrand', categoria: 'Famoso', genero: 'Mujer', edad: 98, tipo: 'Persona real', estado: 'Vivo',imagen: '/assets/mirtha.png' },
    { nombre: 'Javier Milei', categoria: 'Político', genero: 'Hombre', edad: 54, tipo: 'Persona real', estado: 'Vivo',imagen: '/assets/milei.png' },
    { nombre: 'Luis Alberto Spinetta', categoria: 'Cantante', genero: 'Hombre', edad: 62, tipo: 'Persona real', estado: 'Fallecido',imagen: '/assets/spinetta.png' },
    { nombre: 'Mercedes Sosa', categoria: 'Cantante', genero: 'Mujer', edad: 74, tipo: 'Persona real', estado: 'Fallecido',imagen: '/assets/sosa.png' },
    { nombre: 'Diego Maradona', categoria: 'Jugador', genero: 'Hombre', edad: 60, tipo: 'Persona real', estado: 'Fallecido',imagen: '/assets/maradona.png' },
    { nombre: 'Susana Gimenez', categoria: 'Famoso', genero: 'Mujer', edad: 81, tipo: 'Persona real', estado: 'Vivo',imagen: '/assets/susana.png' },
    { nombre: 'Carlos Gardel', categoria: 'Cantante', genero: 'Hombre', edad: 44, tipo: 'Persona real', estado: 'Fallecido',imagen: '/assets/gardel.png' },
    { nombre: 'Ricardo Fort', categoria: 'Famoso', genero: 'Hombre', edad: 45, tipo: 'Persona real', estado: 'Fallecido',imagen: '/assets/fort.png' },
    { nombre: 'Hijitus', categoria: 'Personaje', genero: 'Hombre', edad: 9, tipo: 'Dibujito', estado: 'Vivo',imagen: '/assets/hijitus.png' },
    { nombre: 'María Becerra', categoria: 'Cantante', genero: 'Mujer', edad: 25, tipo: 'Persona real', estado: 'Vivo',imagen: '/assets/becerra.png' },
    { nombre: 'Tini Stoessel', categoria: 'Cantante', genero: 'Mujer', edad: 28, tipo: 'Persona real', estado: 'Vivo',imagen: '/assets/tini.png' },
    { nombre: 'Angel Di María', categoria: 'Jugador', genero: 'Hombre', edad: 36, tipo: 'Persona real', estado: 'Vivo',imagen: '/assets/dimaria.png' },
    { nombre: 'Ciro Martinez', categoria: 'Cantante', genero: 'Hombre', edad: 57, tipo: 'Persona real', estado: 'Vivo',imagen: '/assets/ciro.png' },
    { nombre: 'Cristina Fernández de Kirchner', categoria: 'Político', genero: 'Mujer', edad: 72, tipo: 'Persona real', estado: 'Vivo',imagen: '/assets/cfk.png' },
    { nombre: 'Juan Domingo Perón', categoria: 'Político', genero: 'Hombre', edad: 78, tipo: 'Persona real', estado: 'Fallecido',imagen: '/assets/peron.png' },
    { nombre: 'Eva Perón', categoria: 'Político', genero: 'Mujer', edad: 33, tipo: 'Persona real', estado: 'Fallecido',imagen: '/assets/evita.png' },
    { nombre: 'Gustavo Cerati', categoria: 'Cantante', genero: 'Hombre', edad: 55, tipo: 'Persona real', estado: 'Fallecido',imagen: '/assets/ceratti.png' },
    { nombre: 'Ricardo Darin', categoria: 'Actor', genero: 'Hombre', edad: 68, tipo: 'Persona real', estado: 'Vivo',imagen: '/assets/darin.png' },
    { nombre: 'Luciana Aimar', categoria: 'Jugador', genero: 'Mujer', edad: 47, tipo: 'Persona real', estado: 'Vivo',imagen: '/assets/aimar.png' },
    { nombre: 'Mafalda', categoria: 'Personaje', genero: 'Mujer', edad: 6, tipo: 'Dibujito', estado: 'Vivo',imagen: '/assets/mafalda.png' },
    { nombre: 'Charly Garcia', categoria: 'Cantante', genero: 'Hombre', edad: 73, tipo: 'Persona real', estado: 'Vivo',imagen: '/assets/charly.png' },
    { nombre: 'Moni Argento', categoria: 'Personaje', genero: 'Mujer', edad: 40, tipo: 'Personaje no animado', estado: 'Vivo',imagen: '/assets/moni.png' },
    { nombre: 'Pepe Argento', categoria: 'Personaje', genero: 'Hombre', edad: 45, tipo: 'Personaje no animado', estado: 'Vivo',imagen: '/assets/pepe.png' },
    { nombre: 'Marcelo Tinelli', categoria: 'Famoso', genero: 'Hombre', edad: 65, tipo: 'Persona real', estado: 'Vivo',imagen: '/assets/tinelli.png' },
    { nombre: 'Patoruzú', categoria: 'Personaje', genero: 'Hombre', edad: 35, tipo: 'Dibujito', estado: 'Vivo',imagen: '/assets/patoruzu.png' },

  ];


  personajeOculto!: PersonajeArgentino;
  intentos: Intento[] = [];
  maxIntentos = 8;
  juegoFinalizado = false;
  mensajeFinal = '';
  filtro: string = '';

  opcionesFiltradas: PersonajeArgentino[] = [];

  mostrarLista: boolean = false;

  constructor(private router: Router,)
  {

  }

  ngOnInit(): void {
    this.reiniciarJuego();
  }

  reiniciarJuego(): void 
  {
    this.intentos = [];
    this.juegoFinalizado = false;
    this.mensajeFinal = '';
    this.personajeOculto = this.obtenerPersonajeOculto();
    this.nombreAdivinado = '';
    this.opcionesFiltradas = [];
  }

  obtenerPersonajeOculto(): PersonajeArgentino 
  {
    const index = Math.floor(Math.random() * this.personas.length);
    return this.personas[index];
  }

  filtrarOpciones(): void 
  {
    const texto = this.nombreAdivinado.trim().toLowerCase();
    if (texto.length === 0) {
      this.opcionesFiltradas = [];
      return;
    }
    this.opcionesFiltradas = this.personas.filter(p =>
      p.nombre.toLowerCase().startsWith(texto)
    );
  }

  adivinar(nombre: string): void 
  {
    if (this.juegoFinalizado || this.intentos.length >= this.maxIntentos)
    {
      return;
    }
        
    const intento = this.personas.find(p => p.nombre === nombre);

    if (!intento) 
    {
      return;
    }

    // con esto evito repetir intentos con el mismo nombre
    if (this.intentos.some(i => i.nombre === nombre))
    {
      return;

    }

    const resultado = this.compararConOculto(intento);

    this.intentos.push({ ...intento, resultado });

    if (intento.nombre === this.personajeOculto.nombre) 
    {
      this.juegoFinalizado = true;
      this.mensajeFinal = '¡Adivinaste el personaje!';
    } else if (this.intentos.length >= this.maxIntentos) {
      this.juegoFinalizado = true;
      this.mensajeFinal = `Perdiste. El personaje era: ${this.personajeOculto.nombre}`;
    }

    this.nombreAdivinado = '';
    this.opcionesFiltradas = [];
  }

  compararConOculto(intento: PersonajeArgentino): ResultadoComparacion 
  {

    const diffEdad = Math.abs(intento.edad - this.personajeOculto.edad);

    let resultadoEdad: 'ok' | 'parcial' | 'mal';

    console.log ("edad del intento", intento.edad);
    console.log ("edad del personaje a adivinar", this.personajeOculto.edad);

    if (diffEdad === 0) {
      resultadoEdad = 'ok';
    } else if (diffEdad <= 10) {
      resultadoEdad = 'parcial';


    } else {

      resultadoEdad = 'mal';
    }

    return {
      categoria: intento.categoria === this.personajeOculto.categoria ? 'ok' : 'mal',
      genero: intento.genero === this.personajeOculto.genero ? 'ok' : 'mal',
      edad: resultadoEdad,
      tipo: intento.tipo === this.personajeOculto.tipo ? 'ok' : 'mal',
      estado: intento.estado === this.personajeOculto.estado ? 'ok' : 'mal',
      nombre: intento.nombre === this.personajeOculto.nombre ? 'ok' : 'mal',
    };
  }

  getClaseResultado(valor: 'ok' | 'parcial' | 'mal'): string 
  {
    switch (valor) {
      case 'ok': return 'verde';
      case 'parcial': return 'amarillo';
      case 'mal': return 'rojo';
      default: return '';
    }
  }

  personasFiltrados(): PersonajeArgentino[] {

  const texto = this.filtro.toLowerCase().trim();


  if (texto.length === 0) 
  {
    return [];
  }


  const personasFiltrados: PersonajeArgentino[] = [];


  for (let i = 0; i < this.personas.length; i++) {
    const personaje = this.personas[i];

    if (personaje.nombre.toLowerCase().startsWith(texto)) {

      let yaIntentado = false;

      for (let j = 0; j < this.intentos.length; j++) {
        if (this.intentos[j].nombre === personaje.nombre) {
          yaIntentado = true;
          break; 
        }
      }

      //si NO fue intentado antes, lo agrego a personas filtradas
      if (!yaIntentado) {
        personasFiltrados.push(personaje);
      }
    }
   }
    return personasFiltrados;
  }
  irAlMenu() {
    this.router.navigate(['/home']);
  }

  mostrarPersonas()
  {
    return !this.mostrarLista;
  }




}
