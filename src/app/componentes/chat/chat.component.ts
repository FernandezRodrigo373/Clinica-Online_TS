
import { Component, Input, OnInit } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../services/supabase.service'; 
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgZone } from '@angular/core';
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit{

  @Input() usuarioId: number | null = null;
  @Input() userMap: { [key: number]: string } = {};


  chatForm: FormGroup;
  mensajes: any[] = [];
  private canalRealtime: any = null;
  chatAbierto: boolean = false;

  mostrarChat() 
  {
    this.chatAbierto = !this.chatAbierto;
  }


  constructor( private supabaseService: SupabaseService, private fb: FormBuilder, private ngZone: NgZone) 
  {
    this.chatForm = this.fb.group({
      mensaje: ['']
    });
  }

  async ngOnInit() {
    await this.cargarMensajes();
    this.suscribirseANuevosMensajes();
  
  }
  

  async cargarMensajes() 
  {
    const supabase = this.supabaseService.getSupabaseClient();
    const { data, error } = await supabase
      .from('chat')
      .select('*')
      .order('fecha', { ascending: true });

    if (error) 
    {
      console.error('Error al cargar mensajes:', error.message);
      return;
    }

    this.mensajes = data || [];

    setTimeout(() => {
      this.hacerScrollAbajo();
    }, 0);
  }

  async enviarMensaje() 
  {
    const texto = this.chatForm.get('mensaje')?.value.trim();

    if (!texto || !this.usuarioId) {
      console.warn('Mensaje no enviado: texto vacío o usuarioId no válido');
      return;
    }

    const supabase = this.supabaseService.getSupabaseClient();

    const nuevoMensaje = {
      mensaje: texto,
      usuario_id: this.usuarioId,
      fecha: new Date().toISOString()
    };

    const { error } = await supabase.from('chat').insert(nuevoMensaje);

    if (error) {
      console.error('Error al enviar mensaje:', error.message);
      return;
    }



    this.chatForm.reset();

    setTimeout(() => {
      this.hacerScrollAbajo();
    }, 0);
  }

 suscribirseANuevosMensajes() 
 {
  const supabase = this.supabaseService.getSupabaseClient();

    this.canalRealtime = supabase
      .channel('sala-de-chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat' },
        (payload) => {
          this.ngZone.run(() => {
            console.log(' mensaje recibido:', payload.new);
            this.mensajes.push(payload.new);
            setTimeout(() => {
            this.hacerScrollAbajo();
            }, 0);
          });
        }
      )
      .subscribe((status) => {
        //console.log(' estado de suscripción:', status);
        if (status === 'SUBSCRIBED') {
          //console.log('suscripción activa');
        }
      });


  }

  hacerScrollAbajo()
  {
    const contenedor = document.getElementById('chat-mensajes');
    
    if (contenedor)
    {
      console.log("entre al contenedor")
      contenedor.scrollTop = contenedor.scrollHeight;
    }
  }
}


