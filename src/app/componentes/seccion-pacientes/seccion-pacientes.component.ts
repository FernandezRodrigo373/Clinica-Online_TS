import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seccion-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './seccion-pacientes.component.html',
  styleUrls: ['./seccion-pacientes.component.css']
})
export class SeccionPacientesComponent implements OnInit {

  usuario: any = null;
  pacienteBuscado: string = '';
  pacientesFiltrados: any[] = [];
  pacienteSeleccionado: any = null;
  historias: any[] = [];
  mensajeError: string | null = null;
  pacientesDelEspecialista: Set<number> = new Set();

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async ngOnInit() {
    this.usuario = await this.supabaseService.obtenerDatosUsuarioCompleto();
    if (!this.usuario || this.usuario.tipo !== 'especialista') return;

    //pacientes que haya atendido al menos una vez
    const supabase = this.supabaseService.getSupabaseClient();
    const { data, error } = await supabase
      .from('turnos')
      .select('paciente_id')
      .eq('estado', 'realizado')
      .eq('especialista_id', this.usuario.id);

    if (!error && data) {
      data.forEach(t => this.pacientesDelEspecialista.add(t.paciente_id));
    }
  }

  async obtenerInputPaciente(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.pacienteBuscado = value;
    await this.buscarPacientes(value);
  }

  async buscarPacientes(dni: string) {
    if (!dni || dni.trim().length < 3) {
      this.pacientesFiltrados = [];
      return;
    }

    if (this.pacientesDelEspecialista.size === 0) {
      this.pacientesFiltrados = [];
      return;
    }

    const supabase = this.supabaseService.getSupabaseClient();
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, apellido, dni, email, edad, imagen1, especialidades')
      .ilike('dni', `%${dni}%`)
      .eq('tipo', 'paciente');

    if (error || !data) {
      console.error('Error buscando pacientes:', error);
      this.pacientesFiltrados = [];
      return;
    }

    // solo mostrar pacientes que fueron atendidos por este especialista
    this.pacientesFiltrados = data.filter(p => this.pacientesDelEspecialista.has(p.id));
  }

  seleccionarPaciente(paciente: any) {
    this.pacienteSeleccionado = paciente;
    this.pacienteBuscado = paciente.dni;
    this.pacientesFiltrados = [];
    this.obtenerHistoriasDelPaciente(paciente.id);
  }

  async obtenerHistoriasDelPaciente(pacienteId: number) {
    const supabase = this.supabaseService.getSupabaseClient();

    const { data, error } = await supabase
      .from('turnos')
      .select(`
        id,
        fecha,
        especialista:usuarios!fk_especialista_id(nombre, apellido),
        historia_clinica(altura, peso, temperatura, presion, datos_dinamicos)
      `)
      .eq('paciente_id', pacienteId)
      .eq('especialista_id', this.usuario.id)
      .eq('estado', 'realizado')
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error al obtener historias clínicas:', error);
      this.historias = [];
      return;
    }

    this.historias = data || [];
  }

  irAlMenu() {
    this.router.navigate(['/home']);
  }

}
