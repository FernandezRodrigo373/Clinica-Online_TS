import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-seccion-usuarios',
  standalone: true,
  imports: [NgFor, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './seccion-usuarios.component.html',
  styleUrl: './seccion-usuarios.component.css',
})
export class SeccionUsuariosComponent implements OnInit {
  especialistas: any[] = [];
  pacientes: any[] = [];
  usuariosTotales: any[] = [];

  seccionPaciente: boolean = false;
  seccionEspecialistas: boolean = true;

  pacienteBuscado: string = '';
  pacientesFiltrados: any[] = [];
  pacienteSeleccionado: any = null;
  historias: any[] = [];
  mensajeError: string | null = null;

  pacienteSeleccionadoId: number | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.especialistas = await this.supabaseService.obtenerEspecialistas();
    await this.cargarPacientes();
    await this.obtenerTodosLosUsuarios();
  }

  async cambiarAPaciente() 
  {
    this.seccionPaciente = true;
    this.seccionEspecialistas = false;
    await this.cargarPacientes();
  }

  cambiarAEspecialista() 
  {
    this.seccionPaciente = false;
    this.seccionEspecialistas = true;
  }

  async cargarPacientes() 
  {
    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('usuarios')
      .select('*')
      .eq('tipo', 'paciente');

    if (error) {
      console.error('Error al obtener pacientes:', error);
      return;
    }

    this.pacientes = data || [];
  }

  async obtenerTodosLosUsuarios() 
  {
    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('usuarios')
      .select('*');

    if (!error) this.usuariosTotales = data || [];
  }

  descargarExcelUsuarios() 
  {
    const datos = this.usuariosTotales.map((u) => ({
      Nombre: u.nombre,
      Apellido: u.apellido,
      DNI: u.dni,
      Email: u.email,
      Edad: u.edad,
      Tipo: u.tipo,
      Especialidades:
        u.tipo === 'especialista' && u.especialidades?.length > 0
          ? u.especialidades.join(', ')
          : '',
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datos);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
    XLSX.writeFile(wb, 'usuarios_totales.xlsx');
  }

  async descargarExcelTurnosPaciente(paciente: any) 
  {
    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('turnos')
      .select(`
        fecha,
        estado,
        especialista:usuarios!fk_especialista_id(nombre, apellido)
      `)
      .eq('paciente_id', paciente.id)
      .order('fecha', { ascending: false });

    if (error || !data) {
      console.error('Error al obtener turnos del paciente:', error);
      return;
    }

    const datos = data.map((t) => {
      const esp = Array.isArray(t.especialista) ? t.especialista[0] : t.especialista;
      return {
        Fecha: new Date(t.fecha).toLocaleString('es-AR'),
        Estado: t.estado,
        Nombre_Especialista: esp?.nombre || '',
        Apellido_Especialista: esp?.apellido || '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TurnosPaciente');
    XLSX.writeFile(workbook, `turnos_${paciente.nombre}_${paciente.apellido}.xlsx`);
  }


  async buscarPacientes(dni: string) 
  {
    if (!dni || dni.trim().length < 3) {
      this.pacientesFiltrados = [];
      return;
    }

    const { data, error } = await this.supabaseService
      .getSupabaseClient()
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

  async obtenerInputPaciente(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.pacienteBuscado = value;
    await this.buscarPacientes(value);
  }

  seleccionarPaciente(paciente: any) 
  {
    this.pacienteSeleccionado = paciente;
    this.pacienteBuscado = paciente.dni;
    this.pacientesFiltrados = [];
    this.obtenerHistoriasDelPaciente(paciente.id);
  }

  async obtenerHistoriasDelPaciente(paciente: any) 
  {
    const pacienteId = paciente.id;
    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('turnos')
      .select(`
        id,
        fecha,
        especialista:usuarios!fk_especialista_id(nombre, apellido),
        historia_clinica(altura, peso, temperatura, presion, datos_dinamicos)
      `)
      .eq('paciente_id', pacienteId)
      .eq('estado', 'realizado')
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error al obtener historias clínicas:', error);
      this.historias = [];
      return;
    }

    this.pacienteSeleccionadoId = pacienteId;
    this.historias = data || [];
  }

  async actualizarBotonAprobacion(especialista: any) 
  {
    const nuevoEstado = !especialista.aprobado;

    const exito = await this.supabaseService.actualizarAprobacionEspecialista(
      especialista.id,
      nuevoEstado
    );

    if (exito) especialista.aprobado = nuevoEstado;
  }

  async mostrarHistoria(paciente: any, event: MouseEvent) 
  {
    event.stopPropagation();

    if (this.pacienteSeleccionadoId === paciente.id) {
      this.pacienteSeleccionadoId = null;
      this.historias = [];
      return;
    }

    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('turnos')
      .select(`
        id,
        fecha,
        especialista:usuarios!fk_especialista_id(nombre, apellido),
        historia_clinica(altura, peso, temperatura, presion, datos_dinamicos)
      `)
      .eq('paciente_id', paciente.id)
      .eq('estado', 'realizado')
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error al obtener historia clínica:', error);
      this.historias = [];
      return;
    }

    this.pacienteSeleccionadoId = paciente.id;
    this.historias = data || [];
  }

  irAlMenu() {
    this.router.navigate(['/home']);
  }
}