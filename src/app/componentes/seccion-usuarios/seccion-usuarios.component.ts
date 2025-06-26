import { Component, NgModule, OnInit } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-seccion-usuarios',
  standalone: true,
  imports: [NgFor, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './seccion-usuarios.component.html',
  styleUrl: './seccion-usuarios.component.css'
})
export class SeccionUsuariosComponent implements OnInit {

  especialistas: any[] = [];
  seccionPaciente: boolean = false;
  seccionEspecialistas: boolean = true;

  pacienteBuscado: string = '';
  pacienteSeleccionado: any = null;
  historias: any[] = [];
  mensajeError: string | null = null;
  pacientesFiltrados: any[] = [];

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async ngOnInit() {
    this.especialistas = await this.supabaseService.obtenerEspecialistas();
  }

  cambiarAPaciente()
  {
    this.seccionPaciente = true;
    this.seccionEspecialistas = false;
  }

  cambiarAEspecialista()
  {
    this.seccionPaciente = false;
    this.seccionEspecialistas = true;
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

  async buscarPacientePorDni() 
  {
    if (!this.pacienteBuscado.trim()) return;

    const supabase = this.supabaseService.getSupabaseClient();

    const { data: pacientes, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('dni', this.pacienteBuscado)
      .eq('tipo', 'paciente');

    if (error || !pacientes || pacientes.length === 0) {
      this.pacienteSeleccionado = null;
      this.historias = [];
      this.mensajeError = 'Paciente no encontrado.';
      return;
    }

    this.pacienteSeleccionado = pacientes[0];
    this.mensajeError = null;
    await this.obtenerHistoriasDelPaciente(this.pacienteSeleccionado.id);
  }

  async obtenerHistoriasDelPaciente(pacienteId: number) 
  {
    const supabase = this.supabaseService.getSupabaseClient();

    const { data, error } = await supabase
      .from('turnos')
      .select(`
        id,
        fecha,
        especialista:usuarios!fk_especialista_id(nombre, apellido),
        historia_clinica(
          altura,
          peso,
          temperatura,
          presion,
          datos_dinamicos
        )
      `)
      .eq('paciente_id', pacienteId)
      .eq('estado', 'realizado')
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error al obtener historias clínicas:', error);
      this.historias = [];
      return;
    }

    this.historias = data || [];
  }


  async obtenerInputPaciente(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  this.pacienteBuscado = value;
  await this.buscarPacientes(value);
}

async buscarPacientes(dni: string) 
{
  if (!dni || dni.trim().length < 3) {
    this.pacientesFiltrados = [];
    return;
  }

  const { data, error } = await this.supabaseService.getSupabaseClient()
    .from('usuarios')
    .select('id, nombre, apellido, dni, email, edad, imagen1, especialidades')
    .ilike('dni', `%${dni}%`)
    .eq('tipo', 'paciente')
    .limit(10);

  if (error) {
    console.error('Error buscando pacientes por DNI:', error);
    this.pacientesFiltrados = [];
    return;
  }

  this.pacientesFiltrados = data || [];
}

  seleccionarPaciente(paciente: any) {
    this.pacienteSeleccionado = paciente;
    this.pacienteBuscado = paciente.dni;
    this.pacientesFiltrados = [];
    this.obtenerHistoriasDelPaciente(paciente.id);
  }

  irAlMenu() 
  {
    this.router.navigate(['/home']);
  }

}
