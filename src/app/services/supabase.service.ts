

import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';


const SUPABASE_URL = 'https://oigtgtfagxssdwsiojcj.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pZ3RndGZhZ3hzc2R3c2lvamNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU4ODM1MCwiZXhwIjoyMDY1MTY0MzUwfQ.ELdjRgKMpdycFNm2K0Qno5ELj9HBRUjJ6sJJgBxw6QE';



@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {

    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }


async obtenerUsuarioYId(): Promise<{ id: number, email: string, tipo: string } | null> 
{
  const { data: userData, error: userError } = await this.supabase.auth.getUser();
  if (userError || !userData.user?.email) {
    console.error('Error al obtener usuario:', userError);
    return null;
  }

  const email = userData.user.email;

  const { data: usuarioData, error: idError } = await this.supabase
    .from('usuarios')
    .select('id, tipo') 
    .eq('email', email)
    .single();

  if (idError || !usuarioData) {
    console.error('Error al obtener ID y tipo del usuario:', idError);
    return null;
  }

  return {
    id: usuarioData.id,
    tipo: usuarioData.tipo,
    email,
  };
}


  async obtenerEmailPorUsuarioId(usuarioId: number): Promise<string> 
  {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('email')
      .eq('id', usuarioId)
      .single(); // esperamos solo un resultado

    if (error || !data) {
      console.error(`Error al obtener email para usuario_id ${usuarioId}:`, error);
      return 'Desconocido';
    }

    return data.email;
  }

  async obtenerTipoUsuarioActual(): Promise<string | null> {
    
    const { data: userData, error } = await this.supabase.auth.getUser();
    if (error || !userData.user?.email) 
    {
      console.log("error aca");
      return null;
    }

    const { data, error: tipoError } = await this.supabase
      .from('usuarios')
      .select('tipo')
      .eq('email', userData.user.email)
      .single();

    if (tipoError || !data) 
    {
      console.log("error aca ahora");
      return null;
    }

    return data.tipo;
  }

  async obtenerEspecialistas(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('id, nombre, apellido, email, aprobado, especialidades, edad, dni, verificado')
      .eq('tipo', 'especialista');

    if (error) {
      console.error('Error al obtener especialistas:', error);
      return [];
    }

    console.log("info usuario ",data);
    return data;
  }

  async actualizarAprobacionEspecialista(id: number, aprobado: boolean): Promise<boolean> {
      const { error } = await this.supabase
        .from('usuarios')
        .update({ aprobado })
        .eq('id', id);

      if (error) {
        console.error('Error al actualizar aprobado:', error);
        return false;
      }

      return true;
    }

    async obtenerTurnosDelPaciente(): Promise<any[]> {
    const { data: userData, error: userError } = await this.supabase.auth.getUser();
    if (userError || !userData.user) return [];

    const { data: usuarioData, error: usuarioError } = await this.supabase
      .from('usuarios')
      .select('auth_uid')
      .eq('email', userData.user.email)
      .single();

    if (usuarioError || !usuarioData?.auth_uid) return [];

    const { data: turnos, error: turnosError } = await this.supabase
      .from('turnos')
      .select('*')
      .eq('paciente_uid', usuarioData.auth_uid)
      .order('fecha', { ascending: true });

    if (turnosError) {
      console.error('Error al obtener turnos:', turnosError);
      return [];
    }

    return turnos;
  }

  async obtenerDatosUsuarioCompleto(): Promise<any | null> {
      const { data: userData, error: userError } = await this.supabase.auth.getUser();
      if (userError || !userData.user?.email) {
        console.error('Error al obtener usuario:', userError);
        return null;
      }

      const email = userData.user.email;

      const { data: usuarioData, error: idError } = await this.supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .single();

      if (idError || !usuarioData) {
        console.error('Error al obtener datos completos del usuario:', idError);
        return null;
      }

      return usuarioData;
  }

  async obtenerHistoriasClinicasPaciente(): Promise<any[]> {
    const { data: userData, error: userError } = await this.supabase.auth.getUser();
    if (userError || !userData.user?.email) return [];

    const { data: usuarioData, error: usuarioError } = await this.supabase
      .from('usuarios')
      .select('id')
      .eq('email', userData.user.email)
      .single();

    if (usuarioError || !usuarioData?.id) return [];

    const { data, error } = await this.supabase
      .from('turnos')
      .select(`
        id,
        fecha,
        especialista:usuarios!fk_especialista_id(nombre, apellido),
        historia_clinica (
          altura,
          peso,
          temperatura,
          presion,
          datos_dinamicos,
          created_at
        )
      `)
      .eq('paciente_id', usuarioData.id)
      .eq('estado', 'realizado')
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error al obtener historias clínicas:', error);
      return [];
    }

    return data;
  }




  
}





