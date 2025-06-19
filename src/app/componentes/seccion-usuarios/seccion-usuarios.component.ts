import { Component, NgModule, OnInit } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-seccion-usuarios',
  standalone: true,
  imports: [NgFor, CommonModule],
  templateUrl: './seccion-usuarios.component.html',
  styleUrl: './seccion-usuarios.component.css'
})
export class SeccionUsuariosComponent implements OnInit {

  especialistas: any[] = [];

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async ngOnInit() {
    this.especialistas = await this.supabaseService.obtenerEspecialistas();
  }

  async actualizarBotonAprobacion(especialista: any) 
  {
    const nuevoEstado = !especialista.aprobado;

    const exito = await this.supabaseService.actualizarAprobacionEspecialista(
      especialista.id,
      nuevoEstado
    );

    if (exito) {
      especialista.aprobado = nuevoEstado;
    }
  }

  irAlMenu() 
  {
    this.router.navigate(['/home']);
  }

}
