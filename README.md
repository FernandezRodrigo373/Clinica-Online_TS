# 🏥 Parcial - Clínica Online

**Alumno:** Rodrigo Fernández Barbero  
**Materia:** Segundo Parcial - Laboratorio 4

Este proyecto consiste en una **plataforma web para una clínica online**, en la que se puede interactuar con **tres tipos de usuarios**:

-  **Administrador**: gestiona los usuarios y turnos del sistema.
-  **Especialista**: profesionales de la salud que reciben y atienden turnos.
-  **Paciente**: usuarios que pueden solicitar turnos médicos.

---

##  Navegación general


### ✅ Pantalla de bienvenida
- Muestra el **logo de la clínica**.
- Incluye dos botones: `Iniciar sesión` y `Registrarse`.

### ✅ Pantalla de registro
- Permite elegir entre registrarse como `Paciente` o `Especialista`.
- Cada tipo despliega un **formulario distinto con validaciones**.
- El paciente debe confirmar su cuenta mediante **verificación por email**.
- El especialista también debe verificar su email y además será **aprobado por un administrador**.
- Incluye validación **CAPTCHA** para completar el registro.

### ✅ Pantalla de inicio de sesión
- Permite ingresar con un usuario registrado.
- Incluye **botones de acceso rápido** para probar con usuarios precargados:
  - 3 pacientes
  - 2 especialistas
  - 1 administrador

---
##  Navegación por el tipo de usuarios

###  Pantalla de inicio
- Muestra un menú personalizado **según el tipo de usuario**.
- Acceso a las funcionalidades correspondientes.
- Botón para **cerrar sesión**.
- Información visible del usuario actual.

###  Sección de usuarios (solo administrador)
- El administrador puede **registrar nuevos usuarios**, incluidos otros administradores.
- Los usuarios creados desde esta sección están **verificados automáticamente**.

###  Mis turnos (pacientes y especialistas)
- **Pacientes**:
    - Pueden ver su historial de turnos.
  - Pueden cancelar turnos.
  - Deben dejar un **comentario del motivo** de cancelación.
- **Especialistas**:
  - Pueden aceptar, cancelar, rechazar o finalizar un turno.
  - Se solicita un comentario o una reseña médica según el caso.

###  Turnos (solo administrador)
- El administrador puede ver **todos los turnos del sistema**.
- Tiene la opción de **cancelar turnos** según necesidad.

###  Solicitar turnos (pacientes y administradores)
- Se puede filtrar por:
  - **Especialidades**
  - **Especialistas**
- Los turnos se asignan según los **días y horarios disponibles** del especialista.
- En esta pantalla:
  - Se ve información del paciente.
  - El administrador debe **ingresar el DNI del paciente** para asignar un turno.

###  Mi perfil (solo especialista)
- Muestra la información personal del especialista.
- Permite **agregar nuevos horarios de trabajo**.
- Los pacientes y administradores podrán ver y seleccionar esos horarios para asignar turnos.
- Se visualizan los horarios cargados a la derecha.

---

##  Tecnologías utilizadas

- Angular
- Firebase / Supabase (según autenticación)
- HTML / CSS / TypeScript

---

¡Labotaratorio IV - UTNFRA! 
