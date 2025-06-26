import { Routes } from '@angular/router';
import { LoginComponent } from './componentes/login/login.component';
import { HomeComponent } from './componentes/home/home.component';

import { RegistroComponent } from './componentes/registro/registro.component';




export const routes: Routes = [

    {path: '',pathMatch:'full', redirectTo:"bienvenida"},
    { path: 'login', loadComponent: () => import('./componentes/login/login.component').then(c => c.LoginComponent), data: { animation: 'animacion2' } },
    { path: 'home', loadComponent: () => import('./componentes/home/home.component').then(c => c.HomeComponent), data: { animation: 'animacion1' } },
    {path: 'bienvenida', loadComponent:() => import('./componentes/bienvenida/bienvenida.component').then(c => c.BienvenidaComponent), data: { animation: 'animacion1' }},
    {path: 'registro', loadComponent:() => import('./componentes/registro/registro.component').then(c => c.RegistroComponent),data: { animation: 'animacion1' }},
    {path: 'seccion-usuarios', loadComponent:() => import('./componentes/seccion-usuarios/seccion-usuarios.component').then(c => c.SeccionUsuariosComponent),data: { animation: 'animacion2' }},
    {path: 'seccion-pacientes', loadComponent:() => import('./componentes/seccion-pacientes/seccion-pacientes.component').then(c => c.SeccionPacientesComponent),data: { animation: 'animacion2' }},
    {path: 'registro-admin', loadComponent:() => import('./componentes/registro-admin/registro-admin.component').then(c => c.RegistroAdminComponent),data: { animation: 'animacion2' }},
    {path: 'mis-turnos', loadComponent:() => import('./componentes/mis-turnos/mis-turnos.component').then(c => c.MisTurnosComponent), data: { animation: 'animacion2' }},
    {path: 'turnos-admin', loadComponent:() => import('./componentes/turnos-admin/turnos-admin.component').then(c => c.TurnosAdminComponent),data: { animation: 'animacion2' }},
    {path: 'perfil', loadComponent:() => import('./componentes/perfil/perfil.component').then(c => c.PerfilComponent),data: { animation: 'animacion2' }},
    {path: 'perfil-paciente', loadComponent:() => import('./componentes/perfil-paciente/perfil-paciente.component').then(c => c.PerfilPacienteComponent),data: { animation: 'animacion2' }},
    {path: 'solicitar-turno', loadComponent:() => import('./componentes/solicitar-turno/solicitar-turno.component').then(c => c.SolicitarTurnoComponent),data: { animation: 'animacion2' }},

    
];

