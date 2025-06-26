import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Turno } from '../../interfaces/interfaces';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [ FormsModule, CommonModule],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.css'
})
export class MisTurnosComponent {
  turnos: any[] = [];
  turnosFiltrados: any[] = [];

  filtroEspecialidad: string = '';
  filtroNombre: string = ''; 

  usuarioId: number = 0;
  usuarioTipo: string = ''; // 'paciente/especialista'

  motivoRechazoVisible: boolean = false;
  motivoRechazoTexto: string = '';
  turnoSeleccionadoParaRechazo: any = null;

  motivoCancelacionVisible: boolean = false;
  motivoCancelacionTexto: string = '';
  turnoSeleccionadoParaCancelacion: any = null;

  // ACEPTAR TURNO
  aceptarVisible: boolean = false;
  turnoSeleccionadoParaAceptar: any = null;

  // FINALIZAR TURNO
  finalizarVisible: boolean = false;
  turnoSeleccionadoParaFinalizar: any = null;
  reseniaFinalizacion: string = '';

  // ENCUESTA
  encuestaVisible: boolean = false;
  turnoSeleccionadoParaEncuesta: any = null;
  comentarioEncuesta: string = '';

  // CALIFICAR
  calificarVisible: boolean = false;
  turnoSeleccionadoParaCalificar: any = null;
  calificacionValor: number = 5;

  mensaje: { tipo: string, texto: string } | null = null;

// HISTORIA CLINICA
  altura: number = 0;
  peso: number = 0;
  temperatura: number = 0;
  presion: string = '';

  datosDinamicos: { clave: string; valor: string }[] = [
    { clave: '', valor: '' },
  ];


  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async ngOnInit() {
    await this.cargarTurnos();
  }

  
  aplicarFiltro() 
  {
    const especialidad = this.filtroEspecialidad.toLowerCase().trim();
    const nombre = this.filtroNombre.toLowerCase().trim();

    this.turnosFiltrados = this.turnos.filter(turno => {
      const matchEspecialidad = especialidad === '' || turno.especialidad?.toLowerCase().includes(especialidad);

      let matchNombre = true;

      if (this.usuarioTipo === 'paciente') {
        const nombreCompleto = `${turno.especialista?.nombre || ''} ${turno.especialista?.apellido || ''}`.toLowerCase();
        matchNombre = nombre === '' || nombreCompleto.includes(nombre);
      } else if (this.usuarioTipo === 'especialista') {
        const nombreCompleto = `${turno.paciente?.nombre || ''} ${turno.paciente?.apellido || ''}`.toLowerCase();
        matchNombre = nombre === '' || nombreCompleto.includes(nombre);
      }

      return matchEspecialidad && matchNombre;
    });
  }
  async cargarTurnos() {
    const usuario = await this.supabaseService.obtenerUsuarioYId();
    if (!usuario) return;

    this.usuarioId = usuario.id;
    this.usuarioTipo = usuario.tipo;

    const supabase = this.supabaseService.getSupabaseClient();

    let query = supabase.from('turnos').select('*').order('fecha', { ascending: true });

    if (this.usuarioTipo === 'paciente') {
      query = supabase
        .from('turnos')
        .select(`
          *,
          especialista:usuarios!fk_especialista_id (nombre, apellido)
        `)
        .eq('paciente_id', this.usuarioId);
    } else if (this.usuarioTipo === 'especialista') {
      query = supabase
        .from('turnos')
        .select(`
          *,
          paciente:usuarios!fk_paciente_id (nombre, apellido)
        `)
        .eq('especialista_id', this.usuarioId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener turnos:', error);
      return;
    }

    this.turnos = data || [];
    this.turnosFiltrados = [...this.turnos];
  }
  

  // PACIENTE

  puedeCancelarPaciente(turno: any): boolean {
    return turno.estado !== 'realizado' && turno.estado !== 'cancelado' && turno.estado !== 'rechazado';
  }

  puedeVerResenia(turno: any): boolean {
    return !!turno.resenia_especialista;
  }

  puedeCompletarEncuesta(turno: any): boolean {
    return turno.estado === 'realizado' && turno.resenia_especialista && !turno.resenia_paciente;
  }

  puedeCalificar(turno: any): boolean {
    return turno.estado === 'realizado' && (turno.calificacion == null);
  }

  // ESPECIALISTA

  puedeCancelarEspecialista(turno: any): boolean {
    return !['aceptado', 'realizado', 'rechazado'].includes(turno.estado);
  }

  puedeRechazar(turno: any): boolean {
    return !['aceptado', 'realizado', 'cancelado'].includes(turno.estado);
  }

  puedeAceptar(turno: any): boolean {
    return !['realizado', 'cancelado', 'rechazado', 'aceptado'].includes(turno.estado);
  }

  puedeFinalizar(turno: any): boolean {
    return turno.estado === 'aceptado';
  }

  // --- ACCIONES ---

  //rechazar turno

  mostrarRechazo(turno: any) {
    this.turnoSeleccionadoParaRechazo = turno;
    this.motivoRechazoTexto = '';
    this.motivoRechazoVisible = true;
  }

  async confirmarRechazo() {
    if (!this.motivoRechazoTexto.trim()) return;

    await this.supabaseService.getSupabaseClient()
      .from('turnos')
      .update({
        estado: 'rechazado',
        comentario_rechazo: this.motivoRechazoTexto
      })
      .eq('id', this.turnoSeleccionadoParaRechazo.id);

    this.motivoRechazoVisible = false;
    this.turnoSeleccionadoParaRechazo = null;


    await this.cargarTurnos();
  }

  cancelarRechazo() {
    this.motivoRechazoVisible = false;
    this.turnoSeleccionadoParaRechazo = null;
  }


  async rechazarTurno(turno: any) {
    const motivo = prompt('Ingrese el motivo de rechazo:');
    if (!motivo) return;

    await this.supabaseService.getSupabaseClient()
      .from('turnos')
      .update({
        estado: 'rechazado',
        comentario_rechazo: motivo
      })
      .eq('id', turno.id);

    await this.cargarTurnos();
  }

  //acpetar turno

  mostrarAceptar(turno: any) {
    this.turnoSeleccionadoParaAceptar = turno;
    this.aceptarVisible = true;
  }

  async confirmarAceptar() {
    await this.supabaseService.getSupabaseClient()
      .from('turnos')
      .update({ estado: 'aceptado' })
      .eq('id', this.turnoSeleccionadoParaAceptar.id);

    this.aceptarVisible = false;
    this.turnoSeleccionadoParaAceptar = null;
    await this.cargarTurnos();
  }

  cancelarAceptar() {
    this.aceptarVisible = false;
    this.turnoSeleccionadoParaAceptar = null;
  }


  //finalizar
  mostrarFinalizar(turno: any) {
    this.turnoSeleccionadoParaFinalizar = turno;
    this.reseniaFinalizacion = '';
    this.finalizarVisible = true;
  }


  cancelarFinalizar() {
    this.finalizarVisible = false;
    this.turnoSeleccionadoParaFinalizar = null;
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



  //encuestas
  mostrarEncuesta(turno: any) {
    this.turnoSeleccionadoParaEncuesta = turno;
    this.comentarioEncuesta = '';
    this.encuestaVisible = true;
  }

  async confirmarEncuesta() {
    if (!this.comentarioEncuesta.trim()) return;

    await this.supabaseService.getSupabaseClient()
      .from('turnos')
      .update({
        resenia_paciente: this.comentarioEncuesta
      })
      .eq('id', this.turnoSeleccionadoParaEncuesta.id);

    this.encuestaVisible = false;
    this.turnoSeleccionadoParaEncuesta = null;
    await this.cargarTurnos();
  }

  cancelarEncuesta() {
    this.encuestaVisible = false;
    this.turnoSeleccionadoParaEncuesta = null;
  }


  //califacion 
  mostrarCalificacion(turno: any) {
    this.turnoSeleccionadoParaCalificar = turno;
    this.calificacionValor = 5;
    this.calificarVisible = true;
  }

  async confirmarCalificacion() {

    
    if (
      this.calificacionValor < 1 ||
      this.calificacionValor > 5 ||
      isNaN(this.calificacionValor)
    ) {
      this.mostrarMensaje("error" ," La calificacion tiene que ser de 1 - 5.");
      return;
    }


    await this.supabaseService.getSupabaseClient()
      .from('turnos')
      .update({
        calificacion: this.calificacionValor
      })
      .eq('id', this.turnoSeleccionadoParaCalificar.id);

    this.calificarVisible = false;
    this.turnoSeleccionadoParaCalificar = null;
    await this.cargarTurnos();
  }

  cancelarCalificacion() {
    this.calificarVisible = false;
    this.turnoSeleccionadoParaCalificar = null;
  }

  mostrarMensaje(tipo: string, texto: string) 
  {
    this.mensaje = { tipo, texto };

  }
  irAlMenu() 
  {
    this.router.navigate(['/home']);
  }

  agregarDatoDinamico() {
  if (this.datosDinamicos.length < 3) {
    this.datosDinamicos.push({ clave: '', valor: '' });
  }
}

  async confirmarFinalizar() {
    if (!this.reseniaFinalizacion.trim()) return;

    const supabase = this.supabaseService.getSupabaseClient();

    const turnoId = this.turnoSeleccionadoParaFinalizar.id;

    // turno realizado y guardar la reseña
    await supabase
      .from('turnos')
      .update({
        estado: 'realizado',
        resenia_especialista: this.reseniaFinalizacion
      })
      .eq('id', turnoId);

    // historia clínica
    const datosDinamicosObj: { [key: string]: string } = {};
    for (let dato of this.datosDinamicos) {
      if (dato.clave && dato.valor) {
        datosDinamicosObj[dato.clave] = dato.valor;
      }
    }

    await supabase
      .from('historia_clinica')
      .insert({
        turno_id: turnoId,
        altura: this.altura,
        peso: this.peso,
        temperatura: this.temperatura,
        presion: this.presion,
        datos_dinamicos: datosDinamicosObj
      });

    this.reseniaFinalizacion = '';
    this.datosDinamicos = [{ clave: '', valor: '' }];
    this.altura = 0;
    this.peso = 0;
    this.temperatura = 0;
    this.presion = '';
    this.finalizarVisible = false;
    this.turnoSeleccionadoParaFinalizar = null;

    await this.cargarTurnos();
  }







  
}
