import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { Route, Router } from '@angular/router';

interface RecordAhorcado {
  id: number;
  usuario_id: number;
  menos_intentos: number;
  menor_tiempo: number;
  fecha: string;
  usuario_email?: string;
}

interface RecordMayorMenor {
  id: number;
  usuario_id: number;
  record: number;
  actualizado_en: string;
  usuario_email?: string;
}

interface RecordPreguntados {
  id: number;
  usuario_id: number;
  record: number;
  actualizado_en: string;
  usuario_email?: string;
}

interface RecordMiJuego {
  id: number;
  usuario_id: number;
  mejor_tiempo: number;
  mejor_intentos: number;
  fecha: string;
  usuario_email?: string;
}
@Component({
  selector: 'app-rankings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rankings.component.html',
  styleUrl: './rankings.component.css'
})
export class RankingsComponent {

  ahorcadoRecords: RecordAhorcado[] = [];
  mayorMenorRecords: RecordMayorMenor[] = [];
  preguntadosRecords: RecordPreguntados[] = [];
  mijuegoRecords: RecordMiJuego[] = [];

  constructor(private router: Router,private supabaseService: SupabaseService) { }

  async ngOnInit() {
    await this.cargarRankings();
  }

  async cargarRankings() 
  {
    this.ahorcadoRecords = await this.supabaseService.obtenerTopAhorcado();
    this.mayorMenorRecords = await this.supabaseService.obtenerTopMayorMenor();
    this.preguntadosRecords = await this.supabaseService.obtenerTopPreguntados();
    this.mijuegoRecords = await this.supabaseService.obtenerTopMiJuego();
  }

    irAlMenu() 
  {
    this.router.navigate(['/home']);
  }

}
