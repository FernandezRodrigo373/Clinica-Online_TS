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

  async ngOnInit() 
  {
    const supabase = this.supabaseService.getSupabaseClient();
  }

   mostrarMensaje(tipo: string, texto: string) 
   {
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
      this.mostrarMensaje('error', 'Por favor, completa ambos campos.');
      return;
    }

    try {
      const supabase = this.supabaseService.getSupabaseClient();

      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: correo,
        password: contrasena
      });

      if (loginError || !loginData?.user) {
        throw new Error(loginError?.message || 'Credenciales inválidas.');
      }

      const user = loginData.user;
      console.log('Inicio de sesión exitoso:', user);

      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select('tipo, verificado, aprobado, nombre, id, apellido, email')
        .eq('auth_uid', user.id)
        .single();

      if (usuarioError || !usuarioData) {
        throw new Error('No se pudieron obtener los datos del usuario.');
      }

        await this.supabaseService.registrarIngreso({
          id: usuarioData.id,
          nombre: usuarioData.nombre,
          apellido: usuarioData.apellido,
          email: usuarioData.email
        });

      if (!usuarioData.verificado && user.email_confirmed_at) {
        const { error: updateError } = await supabase
          .from('usuarios')
          .update({ verificado: true })
          .eq('auth_uid', user.id);

        if (!updateError) {
          usuarioData.verificado = true; 
        } else {
          console.warn('No se pudo actualizar el campo "verificado".', updateError);
        }
      }


      if (usuarioData.tipo === 'administrador') {

        this.router.navigate(['/home']);
        return;
      }

      if (usuarioData.tipo === 'paciente') 
      {
        if (usuarioData.verificado) 
        {
          this.router.navigate(['/home']);
        } 
        else 
        {
          this.mostrarMensaje('error', 'Debe verificar su email para ingresar.');
        }
      } 
      else if (usuarioData.tipo === 'especialista')
      {
        if (usuarioData.verificado && usuarioData.aprobado) 
        {
          this.router.navigate(['/home']);
        } 
        else 
        {
          this.mostrarMensaje('error', 'Debe verificar su email y ser aprobado por el admin.');
        }
      } 
      else 
      {
        this.mostrarMensaje('error', 'Tipo de usuario no reconocido.');
      }

    } catch (error: any) {
      console.error('Error en el inicio de sesión:', error);

      const msg = typeof error === 'string' ? error : error.message || 'Error desconocido';
      if (msg.toLowerCase().includes('email not confirmed')) {
        this.mostrarMensaje('error', 'Debe confirmar su cuenta. Revise su correo electrónico.');
      } else {
        this.mostrarMensaje('error', 'Error en el inicio de sesión. Revise sus datos.');
      }
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
