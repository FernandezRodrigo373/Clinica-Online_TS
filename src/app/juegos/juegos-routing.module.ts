import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PreguntadosComponent } from '../componentes/preguntados/preguntados.component';

const routes: Routes = [
  {
    path: 'preguntados',
    loadComponent:() => import('../componentes/preguntados/preguntados.component').then(c => c.PreguntadosComponent)
  },
   {
    path: 'ahorcado',
    loadComponent:() => import('../componentes/ahorcado/ahorcado.component').then(c => c.AhorcadoComponent)
  },
   {
    path: 'mayor-menor',
    loadComponent:() => import('../componentes/mayor-menor/mayor-menor.component').then(c => c.MayorMenorComponent)
  },
  {
    path: 'juego-propio',
    loadComponent:() => import('../componentes/mijuego/mijuego.component').then(c => c.MijuegoComponent)
  },


  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JuegosRoutingModule { }
