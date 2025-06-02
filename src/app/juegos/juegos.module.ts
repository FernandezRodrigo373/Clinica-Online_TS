import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JuegosRoutingModule } from './juegos-routing.module';
import { PreguntadosComponent } from '../componentes/preguntados/preguntados.component';
import { AhorcadoComponent } from '../componentes/ahorcado/ahorcado.component';
import { MayorMenorComponent } from '../componentes/mayor-menor/mayor-menor.component';
import { MijuegoComponent } from '../componentes/mijuego/mijuego.component';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    JuegosRoutingModule,
    HttpClientModule
  ],

})
export class JuegosModule { }
