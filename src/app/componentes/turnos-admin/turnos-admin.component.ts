import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-turnos-admin',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './turnos-admin.component.html',
  styleUrl: './turnos-admin.component.css'
})
export class TurnosAdminComponent implements OnInit {

  turnos: any[] = [];
  turnosFiltrados: any[] = [];
  
  motivoCancelacionVisible: boolean = false;
  motivoCancelacionTexto: string = '';
  turnoSeleccionadoParaCancelacion: any = null;

  usuarioId: number = 0;
  usuarioTipo: string = ''; // 'paciente'/ 'especialista'

  filtroEspecialidad: string = '';
  filtroNombre: string = ''; 


  
  constructor(private supabaseService: SupabaseService, private router:Router) {}
  
  async ngOnInit() 
  {
    await this.cargarTurnos();
    
  }

  
  puedeCancelarPaciente(turno: any): boolean {
    return turno.estado !== 'realizado' && turno.estado !== 'cancelado' && turno.estado !== 'rechazado';
  }

  aplicarFiltro() 
  {
    const especialidad = this.filtroEspecialidad.toLowerCase().trim();
    const nombre = this.filtroNombre.toLowerCase().trim();

    this.turnosFiltrados = this.turnos.filter(turno => {
      const matchEspecialidad = especialidad === '' || turno.especialidad?.toLowerCase().includes(especialidad);

      let matchNombre = true;

      const nombreCompleto = `${turno.especialista?.nombre || ''} ${turno.especialista?.apellido || ''}`.toLowerCase();
      matchNombre = nombre === '' || nombreCompleto.includes(nombre);
   

      return matchEspecialidad && matchNombre;
    });
  }

  async cargarTurnos() 
  {
    const usuario = await this.supabaseService.obtenerUsuarioYId();
    if (!usuario) return;

    this.usuarioId = usuario.id;
    this.usuarioTipo = usuario.tipo;

    const supabase = this.supabaseService.getSupabaseClient();

    let query = supabase.from('turnos').select('*').order('fecha', { ascending: true });

  
    query = supabase
    .from('turnos')
    .select(`
      *,
      especialista:usuarios!fk_especialista_id (nombre, apellido),
      paciente:usuarios!fk_paciente_id (nombre, apellido)
    `)
    .order('fecha', { ascending: true });
  

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener turnos:', error);
      return;
    }

    this.turnos = data || [];
    this.turnosFiltrados = [...this.turnos];
  }
  

  //cancelar turno
  mostrarCancelacionPaciente(turno: any) {
    this.turnoSeleccionadoParaCancelacion = turno;
    this.motivoCancelacionTexto = '';
    this.motivoCancelacionVisible = true;
  }

  cancelarCancelacionPaciente() {
    this.motivoCancelacionVisible = false;
    this.turnoSeleccionadoParaCancelacion = null;
  }

  async confirmarCancelacionPaciente() {
    if (!this.motivoCancelacionTexto.trim()) return;

    await this.supabaseService.getSupabaseClient()
      .from('turnos')
      .update({
        estado: 'cancelado',
        comentario_cancelacion: this.motivoCancelacionTexto
      })
      .eq('id', this.turnoSeleccionadoParaCancelacion.id);

    this.motivoCancelacionVisible = false;
    this.turnoSeleccionadoParaCancelacion = null;

    await this.cargarTurnos();
  }

  irAlMenu() 
  {
    this.router.navigate(['/home']);
  }






}
