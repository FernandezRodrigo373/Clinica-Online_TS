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

![pantalla bienvenida](https://github.com/user-attachments/assets/57e947af-f5c0-446f-9200-74816123b250)


### ✅ Pantalla de registro
- Permite elegir entre registrarse como `Paciente` o `Especialista`.
- Cada tipo despliega un **formulario distinto con validaciones**.
- El paciente debe confirmar su cuenta mediante **verificación por email**.
- El especialista también debe verificar su email y además será **aprobado por un administrador**.
- Incluye validación **CAPTCHA** para completar el registro.

![pantalla preregistro](https://github.com/user-attachments/assets/f864d8e3-39f2-4981-a846-1919c9875f50)
![pantalla registro](https://github.com/user-attachments/assets/727445e0-1cb0-4857-a426-811cd78e03c2)


### ✅ Pantalla de inicio de sesión
- Permite ingresar con un usuario registrado.
- Incluye **botones de acceso rápido** para probar con usuarios precargados:
  - 3 pacientes
  - 2 especialistas
  - 1 administrador

![pantalla inicio de sesion](https://github.com/user-attachments/assets/605de833-17c1-4b27-93d2-0b30290dd94b)


---
##  Navegación por el tipo de usuarios

###  Pantalla de inicio
- Muestra un menú personalizado **según el tipo de usuario**.
- Acceso a las funcionalidades correspondientes.
- Botón para **cerrar sesión**.
- Información visible del usuario actual.

![pantalla inicio](https://github.com/user-attachments/assets/c1fa5988-d723-4bc9-bbda-02ef120cf714)


###  Sección de registro admin (solo administrador)
- El administrador puede **registrar nuevos usuarios**, incluidos otros administradores.
- Los usuarios creados desde esta sección están **verificados automáticamente**.

![pantalla gestion de usuaris](https://github.com/user-attachments/assets/ccf82bf5-9a97-4008-9c16-d61b2e0b99a7)

###  Sección de usuarios (solo administrador)
- El administrador puede cambiar alternar la condicion del especialista entre aprobado y desaprobado.
- El administrador puede ver la historia clinica de los pacientes buscandols por dni.

![seccion usuarios nueva](https://github.com/user-attachments/assets/277d74ce-f91c-4031-a702-408bd357b5b1)

![seccion usuarios paciente nueva](https://github.com/user-attachments/assets/0cd04daa-826c-4430-a140-b57ef3d58052)


###  Sección mis pacientes (solo especialistas)
- El especialista puede ver la historia clinica de los pacientes que atendio buscandols por dni.

![seccion pacietnes](https://github.com/user-attachments/assets/cb6b4126-3ab2-4151-9c33-64411b220875)


###  Mis turnos (pacientes y especialistas)
- **Pacientes**:
    - Pueden ver su historial de turnos.
  - Pueden cancelar turnos.
  - Deben dejar un **comentario del motivo** de cancelación.
- **Especialistas**:
  - Pueden aceptar, cancelar, rechazar o finalizar un turno.
  - Se solicita un comentario o una reseña médica según el caso.
 
![pantalla mis turnos](https://github.com/user-attachments/assets/9f8f8305-8c1a-44cf-b926-d2b58d3ee40b)


###  Turnos (solo administrador)
- El administrador puede ver **todos los turnos del sistema**.
- Tiene la opción de **cancelar turnos** según necesidad.
- 
![pantalla mis turnos](https://github.com/user-attachments/assets/ac95695a-8e2d-4574-b4a9-45229862d162)

###  Solicitar turnos (pacientes y administradores)
- Se puede filtrar por:
  - **Especialidades**
  - **Especialistas**
- Los turnos se asignan según los **días y horarios disponibles** del especialista.
- En esta pantalla:
  - Se ve información del paciente.
  - El administrador debe **ingresar el DNI del paciente** para asignar un turno.
  - La eleccion de especialista, especialdiades (del especialista) y fecha/horarios ahora se hace a traves de botones.
  
![solicitar turno nueva](https://github.com/user-attachments/assets/e1eca52e-42c4-46c3-8f26-85dfdcf62d0e)



###  Mi perfil (especialista)
- Muestra la información personal del especialista.
- Permite **agregar nuevos horarios de trabajo**.
- Los pacientes y administradores podrán ver y seleccionar esos horarios para asignar turnos.
- Se visualizan los horarios cargados a la derecha.
  
![pantalla perfil](https://github.com/user-attachments/assets/096ff3fe-2a0f-4ae9-b22f-e47545fbd1c3)



###  Mi perfil (paciente)
- Muestra la información personal del paciente.
- Permite **ver la historia clinica del paciente**.
- Se podra descargar un PDF con la historia clinica.
  
![mi perfil pacientes](https://github.com/user-attachments/assets/60e42af4-c26c-47cd-9035-eef0d1d85aca)

---

##  Tecnologías utilizadas

- Angular
- Firebase
- HTML / CSS / TypeScript

---

¡Labotaratorio IV - UTNFRA! 
