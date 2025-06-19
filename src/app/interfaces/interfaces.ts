export interface Turno {
  id: number;
  paciente_uid: string;
  especialista_uid: string;
  especialidad: string;
  fecha: string;
  estado: 'pendiente' | 'aceptado' | 'realizado' | 'rechazado' | 'cancelado';
  comentario_cancelacion?: string;
  comentario_rechazo?: string;
  reseña_paciente?: string;
  calificacion?: number;
  reseña_especialista?: string;
}
