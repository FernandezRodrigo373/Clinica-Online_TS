import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { ReactiveFormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,  
  imports: [
    ReactiveFormsModule,  CommonModule
  ],
})
export class LoginComponent implements OnInit {
  formularioLogin: FormGroup;
  mensaje: { tipo: string, texto: string } | null = null;

  constructor( private fb: FormBuilder,private router: Router,private supabaseService: SupabaseService)
  {
    this.formularioLogin = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required],
    });
  }

  async ngOnInit() {
    const supabase = this.supabaseService.getSupabaseClient();
  }

   mostrarMensaje(tipo: string, texto: string) {
    this.mensaje = { tipo, texto };

    setTimeout(() => {
      this.mensaje = null;
    }, 3000); 
  }
  

  async ingresar() 
  {
    const correo = this.formularioLogin.get('correo')?.value;
    const contrasena = this.formularioLogin.get('contrasena')?.value;

    if (!correo || !contrasena) {
      console.log('Por favor, completa ambos campos.');
      this.mostrarMensaje('error', 'Por favor, completa ambos campos.');
      return;
    }

    try {
      const { data, error } = await this.supabaseService
        .getSupabaseClient()
        .auth.signInWithPassword({ email: correo, password: contrasena });
      if (error) {
        throw new Error(error.message);
      }
      console.log('Inicio de sesión exitoso:', data);
      this.router.navigate(['/home']);
    } catch (error) {
      this.mostrarMensaje('error', 'Error en el inicio de sesión. Revise sus datos');

      console.error('Error en el inicio de sesión:', error);
    }
  }

  autocompletar(usuario: string)
  {
    this.formularioLogin.patchValue({
      correo: `${usuario}`,
      contrasena: '123456',
    });
    console.log(`Autocompletado con ${usuario}`);
  }

  irARegistro()
  {
    this.router.navigate(['/registro']);
  }


  
}
