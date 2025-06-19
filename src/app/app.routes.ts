import { Routes } from '@angular/router';
import { LoginComponent } from './componentes/login/login.component';
import { HomeComponent } from './componentes/home/home.component';

import { RegistroComponent } from './componentes/registro/registro.component';




export const routes: Routes = [

    {path: '',pathMatch:'full', redirectTo:"bienvenida"},
    {path: 'login', loadComponent:() => import('./componentes/login/login.component').then(c => c.LoginComponent)},
    {path: 'home', loadComponent:() => import('./componentes/home/home.component').then(c => c.HomeComponent)},
    {path: 'bienvenida', loadComponent:() => import('./componentes/bienvenida/bienvenida.component').then(c => c.BienvenidaComponent)},
    {path: 'registro', loadComponent:() => import('./componentes/registro/registro.component').then(c => c.RegistroComponent)},
    {path: 'seccion-usuarios', loadComponent:() => import('./componentes/seccion-usuarios/seccion-usuarios.component').then(c => c.SeccionUsuariosComponent)},
    {path: 'registro-admin', loadComponent:() => import('./componentes/registro-admin/registro-admin.component').then(c => c.RegistroAdminComponent)},
    {path: 'mis-turnos', loadComponent:() => import('./componentes/mis-turnos/mis-turnos.component').then(c => c.MisTurnosComponent)},
    {path: 'turnos-admin', loadComponent:() => import('./componentes/turnos-admin/turnos-admin.component').then(c => c.TurnosAdminComponent)},
    {path: 'perfil', loadComponent:() => import('./componentes/perfil/perfil.component').then(c => c.PerfilComponent)},
    {path: 'solicitar-turno', loadComponent:() => import('./componentes/solicitar-turno/solicitar-turno.component').then(c => c.SolicitarTurnoComponent)},




    






    
];

