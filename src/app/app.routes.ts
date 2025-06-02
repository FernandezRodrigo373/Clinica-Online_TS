import { Routes } from '@angular/router';
import { LoginComponent } from './componentes/login/login.component';
import { HomeComponent } from './componentes/home/home.component';
import { QuienSoyComponent } from './componentes/quien-soy/quien-soy.component';
import { RegistroComponent } from './componentes/registro/registro.component';
import { PreguntadosComponent } from './componentes/preguntados/preguntados.component';
import { MayorMenorComponent } from './componentes/mayor-menor/mayor-menor.component';
import { AhorcadoComponent } from './componentes/ahorcado/ahorcado.component';



export const routes: Routes = [

    {path: '',pathMatch:'full', redirectTo:"login"},
    {path: 'login', loadComponent:() => import('./componentes/login/login.component').then(c => c.LoginComponent)},
    {path: 'home', loadComponent:() => import('./componentes/home/home.component').then(c => c.HomeComponent)},
    {path: 'quien-soy',loadComponent:() => import('./componentes/quien-soy/quien-soy.component').then(c => c.QuienSoyComponent)},
    {path: 'registro', loadComponent:() => import('./componentes/registro/registro.component').then(c => c.RegistroComponent)},
    {path: 'juegos', loadChildren:() => import('./juegos/juegos.module').then(m => m.JuegosModule)},



    






    
];

