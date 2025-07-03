import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas'; 

import {
  Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController, DoughnutController, ArcElement, PieController
} from 'chart.js';
import { Router } from '@angular/router';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, BarController, DoughnutController, ArcElement);
Chart.register(PieController, ArcElement, Tooltip, Legend);
@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './informes.component.html',
  styleUrls: ['./informes.component.css']
})
export class InformesComponent implements OnInit, AfterViewInit, OnDestroy {
  mensaje: { tipo: string, texto: string } | null = null;


  logIngresos: any[] = [];
  turnosPorEspecialidad: any[] = [];
  turnosPorDia: any[] = [];

  medicos: any[] = [];
  medicoSeleccionado: number | null = null;

  fechaDesde: string = '';
  fechaHasta: string = '';

  turnosSolicitadosPorMedico: any[] = [];
  turnosFinalizadosPorMedico: any[] = [];

  mostrarGraficoTurnosUno: boolean = false;
  mostrarGraficoTurnosDos: boolean = false;



  @ViewChild('graficoTurnosEspecialidad') graficoTurnosEspecialidad!: ElementRef<HTMLCanvasElement>;
  @ViewChild('graficoTurnosDia') graficoTurnosDia!: ElementRef<HTMLCanvasElement>;
  @ViewChild('graficoTurnosSolicitados') graficoTurnosSolicitados!: ElementRef<HTMLCanvasElement>;
  @ViewChild('graficoTurnosFinalizados') graficoTurnosFinalizados!: ElementRef<HTMLCanvasElement>;

  private chartTurnosEspecialidad: Chart | null = null;
  private chartTurnosDia: Chart | null = null;
  private chartTurnosSolicitados: Chart | null = null;
  private chartTurnosFinalizados: Chart | null = null;

  constructor(private supabaseService: SupabaseService, private router:Router) {}

  async ngOnInit() {
    this.cargarMedicos();
   await this.cargarTurnosPorDia();
    await this.cargarTurnosPorEspecialidad();
  }

  ngAfterViewInit() 
  {
    this.inicializarGraficosVacios();
  }

  ngOnDestroy() 
  {
    this.chartTurnosEspecialidad?.destroy();
    this.chartTurnosDia?.destroy();
    this.chartTurnosSolicitados?.destroy();
    this.chartTurnosFinalizados?.destroy();
  }

  async cargarLogIngresos() 
  {
    const supabase = this.supabaseService.getSupabaseClient();
    const { data, error } = await supabase
      .from('log_ingresos')
      .select('*')
      .order('fecha_hora', { ascending: false });

    if (error) {
      console.error(error);
      return;
    }
    this.logIngresos = data || [];
  }

  async cargarTurnosPorEspecialidad() 
  {
    const supabase = this.supabaseService.getSupabaseClient();

    const { data, error } = await supabase.rpc('cantidad_turnos_por_especialidad');

    if (error) {
      console.error(error);
      return;
    }

    this.turnosPorEspecialidad = data || [];
    this.actualizarGraficoTurnosEspecialidad();

    this.mostrarGraficoTurnosUno = true;
    this.mostrarGraficoTurnosDos = false;

  }

  async cargarTurnosPorDia()
   {
    const supabase = this.supabaseService.getSupabaseClient();
    const { data, error } = await supabase.rpc('cantidad_turnos_por_dia');

    if (error) {
      console.error(error);
      return;
    }
    this.turnosPorDia = data || [];
    this.actualizarGraficoTurnosDia();

    this.mostrarGraficoTurnosUno = false;
    this.mostrarGraficoTurnosDos = true;
  }

  async cargarMedicos() 
  {
    const supabase = this.supabaseService.getSupabaseClient();

    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, apellido')
      .eq('tipo', 'especialista')
      .order('nombre', { ascending: true });
    if (error) {
      console.error(error);
      return;
    }
    this.medicos = data || [];
  }

  async cargarTurnosSolicitadosPorMedico() 
  {
    if (!this.medicoSeleccionado || !this.fechaDesde || !this.fechaHasta) {
      this.mostrarMensaje('error', 'Por favor selecciona médico y rango de fechas');
      return;
    }

    const supabase = this.supabaseService.getSupabaseClient();

    const { data, error } = await supabase
      .from('turnos')
      .select('id, paciente_id, especialista_id, especialidad, fecha, estado')
      .eq('especialista_id', this.medicoSeleccionado)
      .gte('fecha', this.fechaDesde)
      .lte('fecha', this.fechaHasta + ' 23:59:59')
      .order('fecha', { ascending: true });

    if (error) 
    {
      console.error(error);
      return;
    }

    this.turnosSolicitadosPorMedico = data || [];
    this.actualizarGraficoTurnosSolicitados();

  }

  async cargarTurnosFinalizadosPorMedico()
  {
    if (!this.medicoSeleccionado || !this.fechaDesde || !this.fechaHasta) 
    {
      this.mostrarMensaje('error', 'Por favor selecciona médico y rango de fechas');
      return;
    }
    const supabase = this.supabaseService.getSupabaseClient();

    const { data, error } = await supabase
      .from('turnos')
      .select('id, paciente_id, especialista_id, especialidad, fecha, estado')
      .eq('especialista_id', this.medicoSeleccionado)
      .eq('estado', 'realizado')
      .gte('fecha', this.fechaDesde)
      .lte('fecha', this.fechaHasta + ' 23:59:59')
      .order('fecha', { ascending: true });

    if (error) 
    {
      console.error(error);
      return;
    }

    this.turnosFinalizadosPorMedico = data || [];
    this.actualizarGraficoTurnosFinalizados();
  }

  private inicializarGraficosVacios() 
  {
    this.chartTurnosEspecialidad = new Chart(this.graficoTurnosEspecialidad.nativeElement, {
      type: 'bar', 
      data: {
        labels: [],
        datasets: [{
          label: 'Cantidad de turnos por especialidad',
          data: [],
          backgroundColor: 'rgba(255, 159, 64, 0.7)'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    this.chartTurnosDia = new Chart(this.graficoTurnosDia.nativeElement, {
      type: 'pie',  
      data: {
        labels: [],
        datasets: [{
          label: 'Cantidad de turnos por dia',
          data: [],
          backgroundColor: [
            '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
          ],
          hoverOffset: 30
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          },
          tooltip: {
            enabled: true
          }
        }
      }
    });


    this.chartTurnosSolicitados = new Chart(this.graficoTurnosSolicitados.nativeElement, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Turnos Solicitados',
          data: [],
          backgroundColor: 'rgba(75, 192, 192, 0.7)'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    this.chartTurnosFinalizados = new Chart(this.graficoTurnosFinalizados.nativeElement, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Turnos Finalizados',
          data: [],
          backgroundColor: 'rgba(255, 99, 132, 0.7)'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  private actualizarGraficoTurnosEspecialidad()
  {
    if (!this.chartTurnosEspecialidad) return;
    const labels = this.turnosPorEspecialidad.map(item => item.especialidad);
    const data = this.turnosPorEspecialidad.map(item => item.cantidad);

    this.chartTurnosEspecialidad.data.labels = labels;
    this.chartTurnosEspecialidad.data.datasets[0].data = data;
    this.chartTurnosEspecialidad.update();
  }

  private actualizarGraficoTurnosDia() 
  {
    if (!this.chartTurnosDia) return;

    const labels = this.turnosPorDia.map(item => {
      const fecha = new Date(item.dia);
      return fecha.toLocaleDateString();
    });
    const data = this.turnosPorDia.map(item => item.cantidad);

    this.chartTurnosDia.data.labels = labels;
    this.chartTurnosDia.data.datasets[0].data = data;
    this.chartTurnosDia.update();
  }

  private actualizarGraficoTurnosSolicitados() 
  {
    if (!this.chartTurnosSolicitados) return;
    const labels = this.turnosSolicitadosPorMedico.map(t => `Turno ${t.id}`);
    const data = this.turnosSolicitadosPorMedico.map(_ => 1); // un turno = 1

    this.chartTurnosSolicitados.data.labels = labels;
    this.chartTurnosSolicitados.data.datasets[0].data = data;
    this.chartTurnosSolicitados.update();
  }

  private actualizarGraficoTurnosFinalizados() 
  {
    if (!this.chartTurnosFinalizados) return;
    const labels = this.turnosFinalizadosPorMedico.map(t => `Turno ${t.id}`);
    const data = this.turnosFinalizadosPorMedico.map(_ => 1);

    this.chartTurnosFinalizados.data.labels = labels;
    this.chartTurnosFinalizados.data.datasets[0].data = data;
    this.chartTurnosFinalizados.update();
  }

  mostrarMensaje(tipo: string, texto: string) 
  {
    this.mensaje = { tipo, texto };
  }


  async exportarGraficosYTablas(): Promise<void> 
  {
    const doc = new jsPDF();

    const fechaStr = new Date().toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    doc.setFontSize(18);
    doc.text('Informe de Turnos', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Emitido el: ${fechaStr}`, 105, 30, { align: 'center' });

    const graficoBarras = this.graficoTurnosEspecialidad.nativeElement.toDataURL('image/png');
    const graficoTorta = this.graficoTurnosDia.nativeElement.toDataURL('image/png');

    doc.addImage(graficoBarras, 'PNG', 15, 40, 180, 60);
    doc.addPage();
    doc.addImage(graficoTorta, 'PNG', 15, 20, 180, 60);

    doc.save('graficos-turnos.pdf');
  }

  exportarTablasAExcel(): void 
  {
    const wb = XLSX.utils.book_new();

    // log ingresos
    if (this.logIngresos.length > 0) {
      const wsLog = XLSX.utils.json_to_sheet(this.logIngresos);
      XLSX.utils.book_append_sheet(wb, wsLog, 'LogIngresos');
    }

    // turnos solicitados
    if (this.turnosSolicitadosPorMedico.length > 0) {
      const wsSolicitados = XLSX.utils.json_to_sheet(this.turnosSolicitadosPorMedico);
      XLSX.utils.book_append_sheet(wb, wsSolicitados, 'TurnosSolicitados');
    }

    // turnos finalizados
    if (this.turnosFinalizadosPorMedico.length > 0) {
      const wsFinalizados = XLSX.utils.json_to_sheet(this.turnosFinalizadosPorMedico);
      XLSX.utils.book_append_sheet(wb, wsFinalizados, 'TurnosFinalizados');
    }

    XLSX.writeFile(wb, 'informes-turnos.xlsx');
  }

  async descargarGrafico(tipo: 'especialidad' | 'dia') 
  {
    const doc = new jsPDF();
    const canvasRef = tipo === 'especialidad' ? this.graficoTurnosEspecialidad : this.graficoTurnosDia;
    const canvas = canvasRef.nativeElement;

    const imgData = canvas.toDataURL('image/png');
    doc.setFontSize(16);
    doc.text(`Gráfico de turnos por ${tipo}`, 10, 20);
    doc.addImage(imgData, 'PNG', 10, 30, 180, 100);
    doc.save(`grafico-turnos-${tipo}.pdf`);
  }

  descargarTabla(tipo: 'ingresos' | 'solicitados' | 'finalizados') 
  {
    let data: any[] = [];
    let nombreHoja = '';
    let nombreArchivo = '';

    if (tipo === 'ingresos') 
    {
      data = this.logIngresos;
      nombreHoja = 'LogIngresos';
      nombreArchivo = 'log-ingresos.xlsx';
    } 
    else if (tipo === 'solicitados') 
    {
      data = this.turnosSolicitadosPorMedico;
      nombreHoja = 'TurnosSolicitados';
      nombreArchivo = 'turnos-solicitados.xlsx';
    } 
    else if (tipo === 'finalizados') 
    {
      data = this.turnosFinalizadosPorMedico;
      nombreHoja = 'TurnosFinalizados';
      nombreArchivo = 'turnos-finalizados.xlsx';
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, nombreHoja);
    XLSX.writeFile(workbook, nombreArchivo);
  }

  irAlMenu() 
  {
    this.router.navigate(['/home']);
  }


}
