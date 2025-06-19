import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';

@Component({
  selector: 'app-registro-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './registro-admin.component.html',
  styleUrl: './registro-admin.component.css'
})
export class RegistroAdminComponent {

  formularioRegistro: FormGroup;
  mensaje: { tipo: string, texto: string } | null = null;
  imagen1: File | null = null;
  imagen2: File | null = null;
  usuariosExistentes: any[] = [];
  especialidadesDisponibles: string[] = ['Cardiologia', 'Pediatria', 'Traumatologia', 'Dermatologia', 'Neurologia'];
  obrasSocialesDisponibles: string[] = ['OSDE', 'Swiss Medical', 'Medicus', 'Accord Salud', 'Sancor Salud', 'Otra'];

  // Variables para manejo de especialidades
  especialidadesAgregadas: string[] = [];
  nuevaEspecialidad: string = '';
  otraEspecialidadTemporal: string = '';
  mostrarOtraEspecialidadInput: boolean = false;
  mostrarOtraObraSocial: boolean = false;




  

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private supabaseService: SupabaseService,
    private snackBar: MatSnackBar
  ) {
    this.formularioRegistro = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(0)]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{6,10}$')]],
      tipo: ['', Validators.required],
      obraSocial: [''],
      otraObraSocial: [''],
      // Nota: especialidades ahora se maneja con especialidadesAgregadas
    });
  }

  async ngOnInit() 
  {
    try {
      const supabase = this.supabaseService.getSupabaseClient();
      const { data, error } = await supabase.from('usuarios').select('email');
      if (error) {
        this.mostrarMensaje('error', 'Error al conectar con Supabase');
      } else {
        this.usuariosExistentes = data || [];
      }
    } catch (error) {
      this.mostrarMensaje('error', 'Error inesperado');
    }

    this.formularioRegistro.get('obraSocial')?.valueChanges.subscribe(valor => {
      this.mostrarOtraObraSocial = valor === 'Otra';
    });
  }

  mostrarMensaje(tipo: string, texto: string) 
  {
    this.mensaje = { tipo, texto };
  }

  cambioDeImagen(event: any, imagen: number) 
  {
    const file = event.target.files[0];
    if (imagen === 1) {
      this.imagen1 = file;
    } else if (imagen === 2) {
      this.imagen2 = file;
    }
  }

  // Métodos para manejar especialidades
  agregarEspecialidad() 
  {
    if (this.nuevaEspecialidad === 'Otra') {
      this.mostrarOtraEspecialidadInput = true;
      return;
    }

    if (this.nuevaEspecialidad && !this.especialidadesAgregadas.includes(this.nuevaEspecialidad)) {
      this.especialidadesAgregadas.push(this.nuevaEspecialidad);
      this.nuevaEspecialidad = '';
    }
  }

  agregarEspecialidadManual() 
  {
    if (this.otraEspecialidadTemporal && !this.especialidadesAgregadas.includes(this.otraEspecialidadTemporal)) 
    {
      this.especialidadesAgregadas.push(this.otraEspecialidadTemporal);
      this.otraEspecialidadTemporal = '';
      this.mostrarOtraEspecialidadInput = false;
      this.nuevaEspecialidad = '';
    }
  }

  eliminarEspecialidad(especialidad: string) 
  {
    this.especialidadesAgregadas = this.especialidadesAgregadas.filter(esp => esp !== especialidad);
  }

  async registrar() 
  {

    const form = this.formularioRegistro.value;

    // Validaciones básicas
    if (!form.email || !form.contrasena || !form.nombre || !form.apellido || !form.edad || !form.dni || !form.tipo) {
      this.mostrarMensaje('error', 'Por favor, completá todos los campos obligatorios.');
      return;
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(form.nombre)) {
      this.mostrarMensaje('error', 'El nombre debe contener solo letras.');
      return;
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(form.apellido)) {
      this.mostrarMensaje('error', 'El apellido debe contener solo letras.');
      return;
    }

    const edadNum = Number(form.edad);
    if (isNaN(edadNum) || edadNum < 0 || edadNum > 120) {
      this.mostrarMensaje('error', 'La edad debe ser un número válido entre 0 y 120.');
      return;
    }

    if (!/^[0-9]{5,10}$/.test(form.dni)) {
      this.mostrarMensaje('error', 'El DNI debe tener entre 5 y 10 dígitos numéricos.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      this.mostrarMensaje('error', 'El email no tiene un formato válido.');
      return;
    }

    if (form.contrasena.length < 6) {
      this.mostrarMensaje('error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // Validaciones específicas por tipo de usuario
    if (form.tipo === 'paciente') {
      if (!form.obraSocial) {
        this.mostrarMensaje('error', 'Paciente: la obra social es obligatoria.');
        return;
      }
      if (form.obraSocial === 'Otra' && !form.otraObraSocial) {
        this.mostrarMensaje('error', 'Paciente: completá la otra obra social.');
        return;
      }
      if (!this.imagen1 || !this.imagen2) {
        this.mostrarMensaje('error', 'Paciente: ambas imágenes son obligatorias.');
        return;
      }
    } else if (form.tipo === 'especialista') {
      if (form.edad > 17) {
        if (this.especialidadesAgregadas.length === 0) {
          this.mostrarMensaje('error', 'Especialista: debes agregar al menos una especialidad.');
          return;
        }
        if (!this.imagen1) {
          this.mostrarMensaje('error', 'Especialista: la imagen de perfil es obligatoria.');
          return;
        }
      } else {
        this.mostrarMensaje('error', 'Especialista: el especialista debe ser mayor a 18 años.');
        return;
      }
      } 
      else if(form.tipo === 'administrador')
      {
        if (!this.imagen1) {
          this.mostrarMensaje('error', 'Administrador: la imagen de perfil es obligatoria.');
          return;
        }
      }

    else
    {
      this.mostrarMensaje('error', 'Tipo de usuario inválido.');
      return;
    }

    // Verificar si el email ya existe
    const emailExiste = this.usuariosExistentes.some(u => u.email === form.email);
    if (emailExiste) {
      this.mostrarMensaje('error', 'Este email ya está registrado.');
      return;
    }

    const supabase = this.supabaseService.getSupabaseClient();
    let urlImg1 = '', urlImg2 = '';

    try {
      // Subir imágenes según el tipo de usuario
      if (form.tipo === 'paciente') {
        urlImg1 = await this.subirImagen(this.imagen1, form.dni, '1');
        urlImg2 = await this.subirImagen(this.imagen2, form.dni, '2');

        if (!urlImg1 || !urlImg2) {
          throw new Error('Falló la subida de imágenes del paciente');
        }
      } else if (form.tipo === 'especialista' || form.tipo === 'administrador') {
        urlImg1 = await this.subirImagen(this.imagen1, form.dni, 'perfil');
        if (!urlImg1) {
          throw new Error('Falló la subida de imagen del perfil');
        }
      }

    } catch (e) {
      this.mostrarMensaje('error', (e as Error).message);
      return;
    }

    // Preparar datos finales
    const obraSocialFinal = form.obraSocial === 'Otra' ? form.otraObraSocial : form.obraSocial;
    let newUserId = '';

    try {
      // Insertar usuario en la base de datos
      const { data, error } = await supabase.from('usuarios').insert({
        email: form.email,
        nombre: form.nombre,
        apellido: form.apellido,
        edad: form.edad,
        dni: form.dni,
        tipo: form.tipo,
        obra_social: form.tipo === 'paciente' ? obraSocialFinal : null,
        especialidades: form.tipo === 'especialista' ? this.especialidadesAgregadas : null,
        imagen1: urlImg1,
        imagen2: form.tipo === 'paciente' ? urlImg2 : null,
        //aprobado: form.tipo === 'especialista' ? false : form.tipo === 'administrador' ? true : null,
        //verificado: form.tipo === 'administrador' ? true : false,
        aprobado: true,
        verificado: true

      }).select('id').single();

      if (error || !data) throw new Error('Error al guardar datos del usuario');
      newUserId = data.id;
    } catch (err) {
      this.mostrarMensaje('error', (err as Error).message);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: form.email,
        password: form.contrasena,
        email_confirm: true  // <-- Esto marca el email como confirmado
      });
      if (authError || !authData.user) {
        await supabase.from('usuarios').delete().eq('id', newUserId);
        throw new Error(authError?.message || 'Error en registro Auth');
      }

      // Actualizar usuario con auth_uid
      const auth_uid = authData.user.id;
      await supabase.from('usuarios').update({ auth_uid }).eq('id', newUserId);

      this.mostrarMensaje('ok', 'Registro exitoso');
      this.router.navigate(['/login']);
    } catch (e) {
      this.mostrarMensaje('error', 'Error al crear cuenta: ' + (e as Error).message);
    }
  }

  async subirImagen(file: File | null, uid: string, nombre: string): Promise<string> {
    if (!file) {
      return '';
    }

    const supabase = this.supabaseService.getSupabaseClient();
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const filePath = `usuarios/${uid}_${nombre}_${timestamp}.${extension}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('imagenes-perfiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw new Error('No se pudo subir la imagen');

      const { data: publicUrlData } = supabase.storage
        .from('imagenes-perfiles')
        .getPublicUrl(filePath);

      return publicUrlData?.publicUrl || '';
    } catch (err) {
      console.error('Error inesperado al subir imagen:', err);
      return '';
    }
  }




  irALogin() {
    this.router.navigate(['/login']);
  }

    irAlMenu() 
  {
    this.router.navigate(['/home']);
  }




}
