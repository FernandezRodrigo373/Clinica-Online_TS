import { Component, OnInit, Pipe, PipeTransform, Directive, ElementRef, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';  
import { SupabaseService } from '../../services/supabase.service'; 
import { SupabaseClient } from '@supabase/supabase-js';
import { NgIf } from '@angular/common';

@Pipe({ name: 'hacerMayus', standalone: true })
export class hacerMayusPipe implements PipeTransform {
  
  transform(valor: string): string {
    return valor
      .toLowerCase()
      .split(' ')
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
  }
}

@Directive({
  selector: '[resaltarBoton]',
  standalone: true 
})
export class ResaltarBotonDirective {
  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.el.nativeElement.style.backgroundColor = '#ffeb3b'; 
    this.el.nativeElement.style.color = '#000'; 
    this.el.nativeElement.style.transform = 'scale(1.03)';
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.el.nativeElement.style.backgroundColor = '#0f1842'; 
    this.el.nativeElement.style.color = '#00d3be';
    this.el.nativeElement.style.transform = 'scale(1)';
  }
}



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [RouterLink, NgIf, hacerMayusPipe, ResaltarBotonDirective],
})
export class HomeComponent implements OnInit {
  emailUsuario?: string = '';
  userMap: { [key: number]: string } = {};
  usuarioId: number | null = null;
  tipoUsuario: string | null = null;
  mostrarBotonSeccion: boolean = false;
  mostrarBotonTurnos: boolean = false;
  mostrarBotonSeccionEspecialista: boolean = false;
  mostrarBotonSeccionPaciente: boolean = false;
  nombre: string = '';

  constructor(private router: Router, private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadUsers();

    const usuario = await this.obtenerUsuarioActual();
    if (usuario) 
    {
      this.emailUsuario = usuario.email;
    }

    if (usuario) 
    {
      this.emailUsuario = usuario.email;

      for (const [id, email] of Object.entries(this.userMap)) {
        if (email === this.emailUsuario) {
          this.usuarioId = parseInt(id);
          break;
        }
      }
    }

    this.tipoUsuario = await this.supabaseService.obtenerTipoUsuarioActual();
    console.log("tipo: ", this.tipoUsuario);

    if (this.tipoUsuario == 'administrador') 
    {
      this.mostrarBotonSeccion = true;
      this.mostrarBotonSeccionPaciente = false;
      this.mostrarBotonSeccionEspecialista = false;
    } 
    else if (this.tipoUsuario == 'especialista') 
    {
      this.mostrarBotonSeccionEspecialista = true;
      this.mostrarBotonSeccionPaciente = false;
      this.mostrarBotonSeccion = false;
    } 
    else 
    {
      this.mostrarBotonSeccion = false;
      this.mostrarBotonSeccionEspecialista = false;
      this.mostrarBotonSeccionPaciente = true;
    }
  }

  irASeccionUsuarios() {
    this.router.navigate(['/seccion-usuarios']);
  }

  irASeccionPacientes() {
    this.router.navigate(['/seccion-pacientes']);
  }

  registrarUsuarios() {
    this.router.navigate(['/registro-admin']);
  }

  registrarTurnos() {
    this.router.navigate(['/mis-turnos']);
  }

  administrarTurnos() {
    this.router.navigate(['/turnos-admin']);
  }

  irAMiPerfil() {
    this.router.navigate(['/perfil']);
  }

  irAMiPerfilPaciente() {
    this.router.navigate(['/perfil-paciente']);
  }

  irASacarTurnos() {
    this.router.navigate(['/solicitar-turno']);
  }

  irAInformes() {
    this.router.navigate(['/informes']);
  }

  async obtenerUsuarioActual() 
  {
    const supabase = this.supabaseService.getSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
    return data.user;
  }

  async loadUsers()
  {
    const supabase = this.supabaseService.getSupabaseClient();
    const { data, error } = await supabase.from('usuarios').select('id, email');
    if (error) {
      console.error('Error cargando usuarios:', error.message);
      return;
    }
    for (const user of data) {
      this.userMap[user.id] = user.email;
    }
  }

  async cerrarSesion() 
  {
    try {
      const supabase = this.supabaseService.getSupabaseClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error al cerrar sesión:', error.message);
        return;
      }
      console.log('Sesión cerrada exitosamente.');
      this.router.navigate(['/login']).then(() => {
        window.location.reload();
      });
    } catch (error) {
      console.error('Error inesperado:', error);
    }
  }
}
