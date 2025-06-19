import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  usuario: any = null;
  disponibilidadForm!: FormGroup;
  horarios: any[] = [];

  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  mensaje: { tipo: string, texto: string } | null = null;


  horariosMaximos: Record<string, [string, string]> = {
    Lunes: ['08:00', '19:00'],
    Martes: ['08:00', '19:00'],
    Miércoles: ['08:00', '19:00'],
    Jueves: ['08:00', '19:00'],
    Viernes: ['08:00', '19:00'],
    Sábado: ['08:00', '14:00']
  };

  constructor(
    private supabaseService: SupabaseService,
    private fb: FormBuilder, private router:Router
  ) {}

  async ngOnInit() {
    const usuarioData = await this.supabaseService.obtenerUsuarioYId();
    if (!usuarioData) return;

    const { id } = usuarioData;

    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return;

    this.usuario = data;

    if (this.esEspecialista()) {
      await this.cargarDisponibilidad();

      this.disponibilidadForm = this.fb.group({
        dia: ['', Validators.required],
        hora_inicio: ['', Validators.required],
        hora_fin: ['', Validators.required],
        especialidad: ['', Validators.required],
        duracion_turno: [30, [Validators.required, Validators.min(5)]],
      });
    }
  }

  esEspecialista(): boolean {
    return this.usuario?.tipo === 'especialista';
  }

  async cargarDisponibilidad() {
    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('disponibilidad')
      .select('*')
      .eq('especialista_id', this.usuario.id);

    if (!error) this.horarios = data || [];
  }

  async agregarHorario() {
    if (this.disponibilidadForm.invalid) return;

    const { dia, hora_inicio, hora_fin, especialidad, duracion_turno } = this.disponibilidadForm.value;

    if (!this.horariosMaximos[dia]) {
      this.mostrarMensaje("error", "El día seleccionado no está habilitado por la clínica.");
      return;
    }

    if (hora_inicio >= hora_fin) {
      this.mostrarMensaje("error", "La hora de inicio debe ser anterior a la de fin.");

      return;
    }

    const [limiteInicio, limiteFin] = this.horariosMaximos[dia];
    if (hora_inicio < limiteInicio || hora_fin > limiteFin) {
      this.mostrarMensaje("error", `El horario debe estar entre ${limiteInicio} y ${limiteFin} para el día ${dia}.`);
      
      return;
    }

    const solapado = this.horarios.some((h: any) =>
      h.dia === dia &&
      hora_inicio < h.hora_fin &&
      h.hora_inicio < hora_fin
    );

    if (solapado) {
      this.mostrarMensaje("error", "Ya tenés un horario cargado que se superpone con el seleccionado.");

      return;
    }

    const { error } = await this.supabaseService
      .getSupabaseClient()
      .from('disponibilidad')
      .insert({
        especialista_id: this.usuario.id,
        dia,
        hora_inicio,
        hora_fin,
        especialidad,
        duracion_turno
      });

    if (!error) {
      this.disponibilidadForm.reset();
      await this.cargarDisponibilidad();
    }
  }

  mostrarMensaje(tipo: string, texto: string) 
  {
    this.mensaje = { tipo, texto };

    setTimeout(() => {
      this.mensaje = null;
    }, 3000);
  }

    irAlMenu() 
  {
    this.router.navigate(['/home']);
  }




}
