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
  pacientesConTurnos: any[] = [];
  pacienteConHistoriaId: number | null = null;
  historias: any[] = [];

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async ngOnInit() {
    this.usuario = await this.supabaseService.obtenerDatosUsuarioCompleto();
    if (!this.usuario || this.usuario.tipo !== 'especialista') return;

    const supabase = this.supabaseService.getSupabaseClient();

    const { data, error } = await supabase
      .from('turnos')
      .select(`
        paciente_id,
        fecha,
        paciente:usuarios!fk_paciente_id(id, nombre, apellido, dni, email, edad, imagen1),
        historia_clinica(altura, peso, temperatura, presion, datos_dinamicos)
      `)
      .eq('estado', 'realizado')
      .eq('especialista_id', this.usuario.id)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error cargando turnos:', error);
      return;
    }

    const agrupados = new Map<number, any>();

    for (const turno of data || []) {
      const id = turno.paciente_id;
      if (!agrupados.has(id)) {
        agrupados.set(id, {
          paciente: turno.paciente,
          turnos: []
        });
      }

      if (agrupados.get(id).turnos.length < 3) {
        agrupados.get(id).turnos.push({
          fecha: turno.fecha,
          historia_clinica: turno.historia_clinica
        });
      }
    }

    this.pacientesConTurnos = Array.from(agrupados.values());
  }

  async verHistoria(pacienteId: number) {
    this.pacienteConHistoriaId = pacienteId;

    const supabase = this.supabaseService.getSupabaseClient();

    const { data, error } = await supabase
      .from('turnos')
      .select(`
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
