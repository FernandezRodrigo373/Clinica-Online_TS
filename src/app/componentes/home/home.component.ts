import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';  
import { SupabaseService } from '../../services/supabase.service'; 

import { SupabaseClient } from '@supabase/supabase-js';
import { ChatComponent } from '../chat/chat.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone:true,
  imports: [ RouterLink, ChatComponent],
})
export class HomeComponent implements OnInit{

  emailUsuario?: string = '';
  userMap: { [key: number]: string } = {};
  usuarioId: number | null = null;
  chatAbierto = false;

  mostrarChat() {
    this.chatAbierto = !this.chatAbierto;
  }




  constructor(private router: Router, private supabaseService: SupabaseService) {}


  irAQuienSoy() {
    this.router.navigate(['/quien-soy']);
  }

  async ngOnInit() {
    await this.loadUsers();

    const usuario = await this.obtenerUsuarioActual();
    if (usuario) {
      this.emailUsuario = usuario.email;
    }

    if (usuario) 
    {

        this.emailUsuario = usuario.email;

        for (const [id, email] of Object.entries(this.userMap)) {

        if (email === this.emailUsuario)
        {
          this.usuarioId = parseInt(id);
          break;
        }
      }
    }

  }

  async obtenerUsuarioActual() 
  {
    const supabase = this.supabaseService.getSupabaseClient(); 

    const { data, error } = await supabase.auth.getUser();
    if (error) 
    {
      console.error('Error al obtener usuario:', error);
      return null;
    }
    return data.user;
  }

  async loadUsers() 
  {
    const supabase = this.supabaseService.getSupabaseClient(); 
    
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, email');

    if (error) {
      console.error('Error cargando usuarios:', error.message);
      return;
    }

    for (const user of data) {
      this.userMap[user.id] = user.email;
    }
  }

    
  irASecuencia() {
    this.router.navigate(['/juegos/juego-propio']);
  }


  irAAhorcado() {
    this.router.navigate(['/juegos/ahorcado']);
  }

  irARanking() {
    this.router.navigate(['/rankings']);
  }

  irAEncuestas() {
    this.router.navigate(['/encuestas']);
  }


  async cerrarSesion() {
     try {
      const supabase = this.supabaseService.getSupabaseClient(); 
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error al cerrar sesión:', error.message);
        return;
      }

      console.log('Sesión cerrada exitosamente.');
      this.router.navigate(['/login']).then(() => {
        window.location.reload();
      });

    } catch (error) {
      console.error('Error inesperado:', error);
    }
  }


  
}




