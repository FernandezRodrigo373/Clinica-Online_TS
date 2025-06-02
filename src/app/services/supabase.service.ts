

import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';


const SUPABASE_URL = 'https://jnjiqdpddhjrroqpmbfi.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuamlxZHBkZGhqcnJvcXBtYmZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMDExMjAsImV4cCI6MjA2MDU3NzEyMH0.1R79yrQTXPJtT2F0eLPCEQXY4PwwbGyzp4lF8xM9bBU'; // Tu clave de API

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


  async obtenerUsuarioYId(): Promise<{ id: number, email: string } | null> 
  {
    const { data: userData, error: userError } = await this.supabase.auth.getUser();
    if (userError || !userData.user?.email) {
      console.error('Error al obtener usuario:', userError);
      return null;
    }

    const email = userData.user.email;

    const { data: usuarioData, error: idError } = await this.supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (idError || !usuarioData) {
      console.error('Error al obtener ID del usuario:', idError);
      return null;
    }

    return {
      id: usuarioData.id,
      email
    };
  }



  
  async obtenerRecordMayorMenor(usuarioId: number) {
  const { data, error } = await this.supabase
    .from('mayor_menor_records')
    .select('record')
    .eq('usuario_id', usuarioId)
    .single();

    if (data) {
      return data.record;
    } 
    else if (error && error.code === 'PGRST116')
    {
      await this.supabase
        .from('mayor_menor_records')
        .insert({ usuario_id: usuarioId, record: 0 });

      return 0;
    } else {
      throw error;
    }
  }

  async actualizarRecordMayorMenor(usuarioId: number, nuevoRecord: number) 
  {
    return this.supabase
      .from('mayor_menor_records')
      .update({
        record: nuevoRecord,
        actualizado_en: new Date()
      })
      .eq('usuario_id', usuarioId);
  }


}
