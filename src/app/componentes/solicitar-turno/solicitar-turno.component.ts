import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { addDays, format as formatDateFns, parse, addMinutes, parseISO } from 'date-fns';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.css'
})
export class SolicitarTurnoComponent implements OnInit {
  turnoForm!: FormGroup;
  especialidades: string[] = [];
  especialistas: any[] = [];
  horariosDisponibles: string[] = [];
  diasDisponibles: string[] = [];
  usuario: any = null;
  pacientes: any[] = [];
  pacienteSeleccionado: any = null;
  pacienteBuscado: string = '';
  pacientesFiltrados: any[] = [];
  especialidadesFiltradas: string[] = [];

  mensaje: { tipo: string, texto: string } | null = null;


  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService, private router:Router
  ) {}

  async ngOnInit()
   {
    this.turnoForm = this.fb.group({
      especialidad: ['', Validators.required],
      especialista_id: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      paciente_id: ['']
    });

    const usuarioActual = await this.supabaseService.obtenerUsuarioYId();
    if (!usuarioActual) return;

    if (usuarioActual.tipo === 'paciente') {

      this.usuario = await this.supabaseService.obtenerDatosUsuarioCompleto();
    } else {

      this.usuario = usuarioActual;
    }

    const { data: especialistas } = await this.supabaseService.getSupabaseClient()
      .from('usuarios')
      .select('id, nombre, apellido, especialidades, imagen1')
      .eq('tipo', 'especialista')
      .eq('aprobado', true);

    if (especialistas) {
      this.especialistas = especialistas;
      const allEspecialidades = new Set();
      especialistas.forEach((esp: any) => {
        esp.especialidades?.forEach((e: string) => allEspecialidades.add(e));
      });
      this.especialidades = Array.from(allEspecialidades) as string[];
    }


    if (usuarioActual.tipo === 'administrador') {
      const { data: pacientes } = await this.supabaseService.getSupabaseClient()
        .from('usuarios')
        .select('id, nombre, apellido, dni, email, edad, imagen1, especialidades')
        .eq('tipo', 'paciente');
      this.pacientes = pacientes || [];
    }

    
  }


  obtenerNombreDiaEnEspañol(fecha: Date): string 
  {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[fecha.getDay()];
  }

  async seleccionarEspecialista() {
    const especialistaId = this.turnoForm.value.especialista_id;
    const especialidad = this.turnoForm.value.especialidad;
    if (!especialistaId || !especialidad) return;

    const { data: disponibilidad } = await this.supabaseService.getSupabaseClient()
      .from('disponibilidad')
      .select('*')
      .eq('especialista_id', especialistaId)
      .eq('especialidad', especialidad);

    this.diasDisponibles = [];
    const hoy = new Date();

    for (let i = 0; i < 15; i++) {
      const dia = addDays(hoy, i);
      const auxDia = this.obtenerNombreDiaEnEspañol(dia);

      if (disponibilidad?.some((d: any) => d.dia === auxDia)) {
        this.diasDisponibles.push(formatDateFns(dia, 'yyyy-MM-dd'));
      }
    }

    this.turnoForm.patchValue({ fecha: '', hora: '' });
    this.horariosDisponibles = [];
  }

  async seleccionarFechaConfiguracion() {
    const especialistaId = this.turnoForm.value.especialista_id;
    const especialidad = this.turnoForm.value.especialidad;
    const fecha = this.turnoForm.value.fecha;

    if (!especialistaId || !especialidad || !fecha) return;

    // use parseISO para que la fecha se convierta bien a Date
    const fechaObj = parseISO(fecha);
    const diaSemana = this.obtenerNombreDiaEnEspañol(fechaObj);
    console.log('Día Semana:', diaSemana);
    console.log('Fecha seleccionada:', fecha);
    console.log('Especialista ID:', especialistaId, 'Especialidad:', especialidad);

    const { data: disponibilidad, error: errorDisp } = await this.supabaseService.getSupabaseClient()
      .from('disponibilidad')
      .select('*')
      .eq('especialista_id', especialistaId)
      .eq('especialidad', especialidad)
      .eq('dia', diaSemana); 

    if (errorDisp) {
      console.error('Error al obtener disponibilidad:', errorDisp);
    }
    console.log('Disponibilidad:', disponibilidad);

    const { data: turnosExistentes, error: errorTurnos } = await this.supabaseService.getSupabaseClient()
      .from('turnos')
      .select('fecha')
      .eq('especialista_id', especialistaId);

    if (errorTurnos) {
      console.error('Error al obtener turnos existentes:', errorTurnos);
    }
    console.log('Turnos existentes:', turnosExistentes);

    this.horariosDisponibles = [];

    disponibilidad?.forEach((bloque: any) => {
      const duracion = bloque.duracion_turno || 30;

      const fechaInicio = parse(bloque.hora_inicio, 'HH:mm:ss', new Date(`${fecha}T00:00:00`));
      const fechaFin = parse(bloque.hora_fin, 'HH:mm:ss', new Date(`${fecha}T00:00:00`));

      console.log('Bloque de horario:', bloque);
      console.log('Fecha inicio bloque:', fechaInicio);
      console.log('Fecha fin bloque:', fechaFin);

      let actual = fechaInicio;
      const bloques: string[] = [];

      while (actual < fechaFin) 
      {
        const horaStr = formatDateFns(actual, 'HH:mm');

        const ocupado = turnosExistentes?.some((t: any) => {
          const turnoFecha = new Date(t.fecha);
          const mismaFecha = formatDateFns(turnoFecha, 'yyyy-MM-dd') === fecha;
          const horaTurno = formatDateFns(turnoFecha, 'HH:mm');
          return mismaFecha && horaTurno === horaStr;
        });

        if (!ocupado) bloques.push(horaStr);
        {
          actual = addMinutes(actual, duracion);

        }
      }

      this.horariosDisponibles.push(...bloques);
    });

    console.log('Horarios disponibles:', this.horariosDisponibles);

    this.turnoForm.patchValue({ hora: '' });
  }

  async solicitarTurno() 
  {
    if (this.turnoForm.invalid) return;

    const { especialidad, especialista_id, fecha, hora, paciente_id } = this.turnoForm.value;
    const paciente = this.usuario.tipo === 'administrador' ? paciente_id : this.usuario.id;
    const fechaFinal = new Date(`${fecha}T${hora}:00`);

    const { error } = await this.supabaseService.getSupabaseClient()
      .from('turnos')
      .insert({
        especialista_id,
        especialidad,
        fecha: fechaFinal.toISOString(),
        horario: hora,
        paciente_id: paciente,
        estado: 'pendiente'
      });

    if (!error) 
    {
      this.mostrarMensaje("error" ," Turno solicitado correctamente.");
      this.turnoForm.reset();
      this.horariosDisponibles = [];
      this.diasDisponibles = [];
    }
  }


  async obtenerInputPaciente(event: Event) 
  {
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
      .select('id, nombre, apellido, dni, email, edad, imagen1')

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
    this.turnoForm.patchValue({ paciente_id: paciente.id });
  }

  mostrarMensaje(tipo: string, texto: string) 
  {
    this.mensaje = { tipo, texto };

    setTimeout(() => {
      this.mensaje = null;
    }, 3000);
  }

  filtrarEspecialidades(especialista: any) 
  {
    this.especialidadesFiltradas = especialista.especialidades || [];
    this.turnoForm.patchValue({ especialidad: '' }); 
  }

  getImagenEspecialidad(especialidad: string): string 
  {
    switch (especialidad.toLowerCase()) {
      case 'cardiologia': return '/assets/cardiologia.png';
      case 'dermatologia': return '/assets/dermatologia.png';
      case 'pediatria': return '/assets/pediatria.png';
      case 'urologia': return '/assets/urologia.png';
      case 'urologo': return '/assets/urologo.png';
      case 'traumatologia': return '/assets/traumatologia.png';
      case 'neurologa': return '/assets/neurologia.png';
      default: return '/assets/especialidad.png';
    }
  }

  formatearHoraAMPM(hora24: string): string 
  {
    const [horas, minutos] = hora24.split(':').map(Number);
    const date = new Date();
    date.setHours(horas);
    date.setMinutes(minutos);

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }



  irAlMenu() 
  {
    this.router.navigate(['/home']);
  }




}
