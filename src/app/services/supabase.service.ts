

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


  async obtenerRecordPreguntados(usuarioId: number) 
  {
    const { data, error } = await this.supabase
      .from('records_preguntados')
      .select('record')
      .eq('usuario_id', usuarioId)
      .single();

      if (data) {
        return data.record;
      } 
      else if (error && error.code === 'PGRST116')
      {
        await this.supabase
          .from('records_preguntados')
          .insert({ usuario_id: usuarioId, record: 0 });

        return 0;
      } else {
        throw error;
      }
  }

  async actualizarPreguntados(usuarioId: number, nuevoRecord: number) 
  {
    return this.supabase
      .from('records_preguntados')
      .update({
        record: nuevoRecord,
        actualizado_en: new Date()
      })
      .eq('usuario_id', usuarioId);
  }

  async obtenerRecordMijuego(usuarioId: number) 
  {
    const { data, error } = await this.supabase
      .from('record_mijuego')
      .select('mejor_tiempo, mejor_intentos')
      .eq('usuario_id', usuarioId)
      .single();

    if (data) {
      return data;
    } 
    else if (error && error.code === 'PGRST116') 
    {
      await this.supabase
        .from('record_mijuego')
        .insert({ usuario_id: usuarioId, mejor_tiempo: 0, mejor_intentos: 0 });

      return { mejor_tiempo: 0, mejor_intentos: 0 };
    } else {
      throw error;
    }
}

  async actualizarRecordMijuego(usuarioId: number, mejorTiempo: number, mejorIntentos: number) 
  {
    return this.supabase
      .from('record_mijuego')
      .update({
        mejor_tiempo: mejorTiempo,
        mejor_intentos: mejorIntentos,
        fecha: new Date()
      })
      .eq('usuario_id', usuarioId);
  }

  async obtenerRecordAhorcado(usuarioId: number) 
  {
    const { data, error } = await this.supabase
      .from('record_ahorcado')
      .select('menor_tiempo, menos_intentos')
      .eq('usuario_id', usuarioId)
      .single();

    if (data) 
    {
      return data;
    } 
    else if (error && error.code === 'PGRST116') 
    {
      await this.supabase
        .from('record_ahorcado')
        .insert({ usuario_id: usuarioId, menor_tiempo: 0, menos_intentos: 0 });

      return { menor_tiempo: 0, menos_intentos: 0 };
    } 
    else 
    {
      throw error;
    }
  }

  async actualizarRecordAhorcado(usuarioId: number, menorTiempo: number, menosIntentos: number) 
  {
    return this.supabase
      .from('record_ahorcado')
      .update({
        menor_tiempo: menorTiempo,
        menos_intentos: menosIntentos,
        fecha: new Date()
      })
      .eq('usuario_id', usuarioId);
  }



  async obtenerUsuarios(): Promise<{ id: number; email: string }[]> {
  const { data, error } = await this.supabase
    .from('usuarios')
    .select('id, email');

  if (error || !data) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }

    return data;
  }

  async obtenerTopAhorcado() 
  {
    const { data: records, error: errorRecords } = await this.supabase
      .from('record_ahorcado')
      .select('id, usuario_id, menos_intentos, menor_tiempo, fecha')
      .order('menos_intentos', { ascending: true })
      .order('menor_tiempo', { ascending: true })
      .limit(3);

    if (errorRecords || !records) 
    {
      console.error('Error al obtener records:', errorRecords);
      return [];
    }

    const usuarios = await this.obtenerUsuarios();

    const resultadosConEmail = [];

    for (let i = 0; i < records.length; i++) 
    {
      let email = '';

      for (let j = 0; j < usuarios.length; j++) 
      {
        if (usuarios[j].id === records[i].usuario_id) {
          email = usuarios[j].email;
          break;
        }
      }

      resultadosConEmail[i] = {
        id: records[i].id,
        usuario_id: records[i].usuario_id,
        menos_intentos: records[i].menos_intentos,
        menor_tiempo: records[i].menor_tiempo,
        fecha: records[i].fecha,
        usuario_email: email
      };
    }

    return resultadosConEmail;
  }

  async obtenerTopPreguntados() 
  {
    const { data: records, error } = await this.supabase
      .from('records_preguntados')
      .select('id, usuario_id, record, actualizado_en')
      .order('record', { ascending: false })
      .limit(3);

    if (error || !records) 
    {
      console.error('Error fetching Preguntados records:', error);
      return [];
    }

    const usuarios = await this.obtenerUsuarios();

    const resultadosConEmail = [];
    for (let i = 0; i < records.length; i++) 
    {
      let email = '';

      for (let j = 0; j < usuarios.length; j++) {
        if (usuarios[j].id === records[i].usuario_id) {
          email = usuarios[j].email;
          break;
        }
      }
      resultadosConEmail[i] = {
        id: records[i].id,
        usuario_id: records[i].usuario_id,
        record: records[i].record,
        actualizado_en: records[i].actualizado_en,
        usuario_email: email
      };
    }

  return resultadosConEmail;
}

async obtenerTopMiJuego() 
{
  const { data: records, error } = await this.supabase
    .from('record_mijuego')
    .select('id, usuario_id, mejor_tiempo, mejor_intentos, fecha')
    .order('mejor_intentos', { ascending: true })
    .order('mejor_tiempo', { ascending: true })
    .limit(3);

    if (error || !records) 
    {
      console.error('Error mi Juego records:', error);
      return [];
    }

    const usuarios = await this.obtenerUsuarios();

    const resultadosConEmail = [];

    for (let i = 0; i < records.length; i++) 
    {
      let email = '';

      for (let j = 0; j < usuarios.length; j++) 
      {
        if (usuarios[j].id === records[i].usuario_id) 
        {
          email = usuarios[j].email;
          break;
        }
      }
      resultadosConEmail[i] = {
        id: records[i].id,
        usuario_id: records[i].usuario_id,
        mejor_tiempo: records[i].mejor_tiempo,
        mejor_intentos: records[i].mejor_intentos,
        fecha: records[i].fecha,
        usuario_email: email
      };
    }

  return resultadosConEmail;
}

async obtenerTopMayorMenor() 
{
  const { data: records, error } = await this.supabase
    .from('mayor_menor_records')
    .select('id, usuario_id, record, actualizado_en')
    .order('record', { ascending: false })
    .limit(3);

    if (error || !records) {
      console.error('Error mayor y menor records:', error);
      return [];
    }

    const usuarios = await this.obtenerUsuarios();

    const resultadosConEmail = [];

    for (let i = 0; i < records.length; i++) 
    {
      let email = '';

      for (let j = 0; j < usuarios.length; j++) 
      {
        if (usuarios[j].id === records[i].usuario_id) 
        {
          email = usuarios[j].email;
          break;
        }
      }
      resultadosConEmail[i] = {
        id: records[i].id,
        usuario_id: records[i].usuario_id,
        record: records[i].record,
        actualizado_en: records[i].actualizado_en,
        usuario_email: email
      };
    }

    return resultadosConEmail;
  }





}
