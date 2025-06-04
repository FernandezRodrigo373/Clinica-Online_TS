import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService, Encuesta  } from '../../services/supabase.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-encuestas',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './encuestas.component.html',
  styleUrl: './encuestas.component.css'
})
export class EncuestasComponent {

   encuestaForm!: FormGroup;
  usuarioId: number | null = null;
  emailUsuario: string | null = null;
  dispositivosSeleccionados: string[] = [];
  mensaje: { tipo: 'error' | 'exito', texto: string } | null = null;

  constructor(private router: Router,private fb: FormBuilder, private supabase: SupabaseService) {}

  async ngOnInit() 
  {
    this.encuestaForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(18), Validators.max(99)]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{1,10}$')]],
      juego: ['', Validators.required],
      sugerencia: ['', Validators.required],
      dispositivos: this.fb.group({
      pc: [false],
      celular: [false],
      tablet: [false]
    })
    });

    //console.log("dispositivos limpiados");
      //this.dispositivosSeleccionados = [];

      const usuario = await this.supabase.obtenerUsuarioYId();
      if (usuario) {
        this.usuarioId = usuario.id;
        this.emailUsuario = usuario.email;
      }
    
  }

  reiniciarEncuesta()
  {
    this.encuestaForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(18), Validators.max(99)]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{1,10}$')]],
      juego: ['', Validators.required],
      sugerencia: ['', Validators.required],
      dispositivos: this.fb.group({
        pc: [false],
        celular: [false],
        tablet: [false]
      })
    });
  }


  mostrarMensaje(tipo: 'error' | 'exito', texto: string) 
  {
    this.mensaje = null;
    setTimeout(() => 
    {
      this.mensaje = { tipo, texto };
    }, 100);
  }

  public async enviarEncuesta() 
  {

    const nombre = this.encuestaForm.get('nombre')?.value;
    const apellido = this.encuestaForm.get('apellido')?.value;
    const edad = this.encuestaForm.get('edad')?.value;
    const telefono = this.encuestaForm.get('telefono')?.value;
    const juego = this.encuestaForm.get('juego')?.value;
    const sugerencia = this.encuestaForm.get('sugerencia')?.value;
    const dispositivosForm = this.encuestaForm.get('dispositivos')?.value;
    const dispositivosSeleccionados = Object.keys(dispositivosForm).filter(k => dispositivosForm[k]);


    if (!nombre || !apellido || !edad || !telefono || !juego || !sugerencia || dispositivosSeleccionados.length === 0) {
      this.mostrarMensaje('error', 'Por favor, completa todos los campos obligatorios.');
      return;
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(nombre)) {
      this.mostrarMensaje('error', 'El nombre debe contener solo letras.');
      return;
    }
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(apellido)) 
    {
      this.mostrarMensaje('error', 'El apellido debe contener solo letras.');
        return;
    }
    else if (typeof edad !== 'number' || isNaN(edad) || edad < 18 || edad > 99) 
      {
      this.mostrarMensaje('error', 'La edad debe ser un número entre 18 y 99.');
        return;
    }
    else if (!/^[0-9]{1,10}$/.test(telefono)) 
    {
      this.mostrarMensaje('error', 'El teléfono debe contener hasta 10 dígitos numéricos.');
      return;
    }
    else if (dispositivosSeleccionados.length === 0) 
    {
     this.mostrarMensaje('error', 'Por favor, selecciona al menos un dispositivo.');
      return;
    }

    if (this.encuestaForm.invalid) {
      this.mostrarMensaje('error', 'Por favor revisa los datos ingresados.');
      return;
    }

    const formValue = this.encuestaForm.value;

    if (!this.usuarioId) {
      this.mostrarMensaje('error',' no se pudo obtener el usuario.');
      return;
    }

    const datosEncuesta: Encuesta = {
    usuario_id: this.usuarioId,
    nombre: formValue.nombre,
    apellido: formValue.apellido,
    edad: formValue.edad,
    telefono: formValue.telefono,
    pregunta1: 'Mejor juego',
    respuesta1: formValue.juego,
    pregunta2: 'Dispositivos utilizados',
    respuesta2: dispositivosSeleccionados.join(', '),
    pregunta3: 'Sugerencias',
    respuesta3: formValue.sugerencia,
    fecha_creacion: new Date()
  };


    try
    {
      await this.supabase.insertarEncuesta(datosEncuesta);

      this.mostrarMensaje('exito', 'Encuesta enviada con éxito.');

      this.reiniciarEncuesta()


    } catch (error) 
    {
      this.mostrarMensaje('error', 'Error al enviar la encuesta.');
    }
  }


    irAlMenu() 
  {
    this.router.navigate(['/home']);
  }
}
