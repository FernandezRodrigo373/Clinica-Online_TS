import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';





@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule ,MatSnackBarModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent implements OnInit {

  formularioRegistro: FormGroup;
    mensaje: { tipo: string, texto: string } | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private supabaseService: SupabaseService,
    private snackBar: MatSnackBar

  ) {
    this.formularioRegistro = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async ngOnInit() {
    try {
      const supabase = this.supabaseService.getSupabaseClient(); 
      const { data, error } = await supabase.from('usuarios').select('*').limit(1);
      if (error) {
        console.error('Error al conectar con Supabase:', error.message);
        this.mostrarMensaje('error', 'Error al conectar con Supabase');


      } else {

        console.log('Conexión exitosa con Supabase:', data);
        
      }
    } catch (error) {
      console.error('Error inesperado al conectar con Supabase:', error);
      this.mostrarMensaje('error', 'Error inesperado al conectar con Supabase');

     
    }
  }

  mostrarMensaje(tipo: string, texto: string)
  {
      this.mensaje = { tipo, texto };

      setTimeout(() => {
        this.mensaje = null;
      }, 3000); 
    }

  async registrar() 
  {
    const correo = this.formularioRegistro.get('correo')?.value;
    const contrasena = this.formularioRegistro.get('contrasena')?.value;

    if (!correo || !contrasena) {
      this.mostrarMensaje('error', 'Faltan datos del formulario');
      //this.snackBar.open('Faltan datos del formulario', 'Cerrar', { duration: 3000 });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      this.mostrarMensaje('error', 'El correo no tiene un formato válido');
      return;
    }

    if (contrasena.length < 6) {
      this.mostrarMensaje('error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const supabase = this.supabaseService.getSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email: correo,
        password: contrasena
      });

      if (error) {
        let mensaje = 'Error al registrar usuario';
        if (error.message.includes('User already registered')) {
          mensaje = 'Ese correo ya está registrado';
        } else if (error.message.includes('invalid email')) {
          mensaje = 'Correo inválido';
        } else if (error.message.toLowerCase().includes('password')) {
          mensaje = 'Contraseña inválida';
        }

        this.mostrarMensaje('error', mensaje);
        return;
      }

      console.log('Registro exitoso:', data);
      this.router.navigate(['/home']);

    } catch (error) {
      console.error('Error al registrar usuario:', error);
      this.mostrarMensaje('error', 'Error al registrar usuario');
    }
  }



  

 

  irALogin() {
    this.router.navigate(['/login']);
  }
}
