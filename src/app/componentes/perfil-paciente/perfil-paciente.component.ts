import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import {jsPDF} from 'jspdf';
import {autoTable} from 'jspdf-autotable';
import { Router } from '@angular/router';
import { Directive,ElementRef, HostListener, Renderer2 } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as XLSX from 'xlsx';


@Pipe({
  name: 'filtroHistoriasPorEspecialista',
  pure: false,
  standalone: true
})
export class FiltroHistoriasPorEspecialistaPipe implements PipeTransform {
  transform(historias: any[], filtro: string): any[] {

    if (!filtro || filtro.trim() === '')
    {
      return historias;
    } 

    filtro = filtro.toLowerCase();

    return historias.filter(h => {
      const nombre = h.especialista?.nombre?.toLowerCase() || '';
      const apellido = h.especialista?.apellido?.toLowerCase() || '';
      return nombre.includes(filtro) || apellido.includes(filtro);
    });
  }
}


@Pipe({
  name: 'resaltarEdad',
  standalone: true,
  pure: true
})
export class ResaltarEdadPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(valor: number): SafeHtml {
    let color = 'black';

    if (valor < 18) 
    {
      color = 'green';
    
    } 
    else if (valor >= 18 && valor < 60) 
    {
      color = 'red';
    } 
    else
    {
      color = '#a728a1';
    }

    const html = `<span style="color: ${color}; font-weight: bold; font-size: 1.2rem">${valor}</span>`;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}

@Directive({
  selector: '[infoBoton]',
  standalone: true
})
export class InfoBotonDirective {
  infoBoton: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter() 
  {
    this.infoBoton = this.renderer.createElement('span');
    const infoBotonText = this.el.nativeElement.getAttribute('infoBoton');
  const text = this.renderer.createText(infoBotonText);
    this.renderer.appendChild(this.infoBoton, text);

    this.renderer.setStyle(this.infoBoton, 'position', 'absolute');
    this.renderer.setStyle(this.infoBoton, 'backgroundColor', 'green');
    this.renderer.setStyle(this.infoBoton, 'color', '#ffffff');
    this.renderer.setStyle(this.infoBoton, 'padding', ' 8px');
    this.renderer.setStyle(this.infoBoton, 'fontSize', '11px');
    this.renderer.setStyle(this.infoBoton, 'margin-left', '22px');

    this.renderer.appendChild(this.el.nativeElement, this.infoBoton);
  }

  @HostListener('mouseleave') onMouseLeave() 
  {
    if (this.infoBoton) {
      this.renderer.removeChild(this.el.nativeElement, this.infoBoton);
      this.infoBoton = null;
    }
  }
}

@Directive({
  selector: '[rotar]',
  standalone: true
})
export class RotarDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'transform 0.4s ease');
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'rotate(360deg)');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'rotate(0deg)');
  }
}


@Component({
  selector: 'app-perfil-paciente',
  standalone: true,
  imports: [CommonModule, InfoBotonDirective, FiltroHistoriasPorEspecialistaPipe, FormsModule, RotarDirective, ResaltarEdadPipe],
  templateUrl: './perfil-paciente.component.html',
  styleUrls: ['./perfil-paciente.component.css']
})
export class PerfilPacienteComponent implements OnInit {
  historias: any[] = [];
  usuario: any = null;

  especialistas: any[] = [];
  filtroEspecialista: string = '';

  especialidadSeleccionada: string = '';


  constructor(private supabaseService: SupabaseService, private router:Router) {}

  async ngOnInit() {
    this.usuario = await this.supabaseService.obtenerDatosUsuarioCompleto();
    if (!this.usuario) return;

    const supabase = this.supabaseService.getSupabaseClient();

    const { data, error } = await supabase
      .from('turnos')
      .select(`
        id,
        fecha,
        especialista:usuarios!fk_especialista_id(nombre, apellido, especialidades),
        historia_clinica(altura, peso, temperatura, presion, datos_dinamicos)
      `)
      .eq('paciente_id', this.usuario.id)
      .eq('estado', 'realizado')
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error al cargar historias clínicas:', error);
      return;
    }

    this.historias = data || [];

  }
  

  async generarPdf() {
    const doc = new jsPDF();
    const fechaArgentinaStr = new Date().toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let logoBase64 = '';
    try {
      logoBase64 = await this.convertirImagenABase64('/assets/clinica2.png');
      doc.addImage(logoBase64, 'PNG', 10, 10, 30, 30);
    } catch (e) {
      console.warn('No se pudo cargar el logo:', e);
    }

    // Título
    doc.setFontSize(18);
    doc.text('Informe de Historia Clínica', 105, 20, { align: 'center' });

    // Fecha
    doc.setFontSize(12);
    doc.text(`Fecha de emisión: ${fechaArgentinaStr}`, 105, 30, { align: 'center' });

    // Datos del paciente
    const usuario = this.usuario;
    doc.setFontSize(14);
    doc.text('Datos del Paciente:', 14, 50);
    doc.setFontSize(12);
    doc.text(`Nombre: ${usuario.nombre} ${usuario.apellido}`, 14, 58);
    doc.text(`DNI: ${usuario.dni}`, 14, 66);
    doc.text(`Email: ${usuario.email}`, 14, 74);
    doc.text(`Edad: ${usuario.edad}`, 14, 82);

    // Historias clínicas
    let y = 92;
    this.historias.forEach((h, index) => {
      doc.setFontSize(13);
      doc.text(`Historia Clínica #${index + 1}`, 14, y);
      y += 8;
      doc.setFontSize(11);
      doc.text(`Fecha: ${new Date(h.fecha).toLocaleDateString('es-AR')}`, 14, y); y += 6;
      doc.text(`Especialista: ${h.especialista?.nombre} ${h.especialista?.apellido}`, 14, y); y += 6;
      doc.text(`Altura: ${h.historia_clinica?.altura || '-'} cm`, 14, y); y += 6;
      doc.text(`Peso: ${h.historia_clinica?.peso || '-'} kg`, 14, y); y += 6;
      doc.text(`Temperatura: ${h.historia_clinica?.temperatura || '-'} °C`, 14, y); y += 6;
      doc.text(`Presión: ${h.historia_clinica?.presion || '-'}`, 14, y); y += 6;

      const dinamicos = h.historia_clinica?.datos_dinamicos;
      if (dinamicos && Object.keys(dinamicos).length > 0) {
        doc.text('Datos adicionales:', 14, y); y += 6;
        Object.entries(dinamicos).forEach(([key, value]) => {
          doc.text(`• ${key}: ${value}`, 16, y);
          y += 6;
        });
      }

      y += 6;

      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save('historia-clinica.pdf');
  }


  convertirImagenABase64(url: string): Promise<string> 
  {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject('No se pudo obtener el contexto del canvas');
          return;
        }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    });
  }

  irAlMenu() 
  {
    this.router.navigate(['/home']);
  }

  obtenerEspecialidadesUnicas(): string[] 
  {
    const especialidadesSet = new Set<string>();
    this.historias.forEach(h => {
      if (h.especialista && h.especialista.especialidades) {
        h.especialista.especialidades.forEach((e: string) => especialidadesSet.add(e));
      }
    });
    return Array.from(especialidadesSet);
  }

  descargarAtencionesPorEspecialidad()
  {
    if (!this.especialidadSeleccionada) 
    {
      return;
    }

    const filtradas = this.historias.filter(h => 
      h.especialista?.especialidades?.includes(this.especialidadSeleccionada)
    );

    if (filtradas.length === 0) {
      return;
    }

    //excel
    const datos = filtradas.map(h => ({
      Fecha: new Date(h.fecha).toLocaleString('es-AR'),
      Especialista: `${h.especialista?.nombre || ''} ${h.especialista?.apellido || ''}`,
      Altura: h.historia_clinica?.altura || '',
      Peso: h.historia_clinica?.peso || '',
      Temperatura: h.historia_clinica?.temperatura || '',
      Presion: h.historia_clinica?.presion || '',
      Datos_adicionales: h.historia_clinica?.datos_dinamicos
        ? JSON.stringify(h.historia_clinica.datos_dinamicos)
        : ''
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Atenciones');

    const nombreArchivo = `atenciones_${this.usuario.nombre}_${this.usuario.apellido}_${this.especialidadSeleccionada}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
  }

}
