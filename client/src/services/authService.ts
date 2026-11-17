import { peticion } from './api';
import type { NombreRol, Plan, Usuario } from '../types/usuario';

/** Funciones que llaman a las rutas de autenticación del servidor */

interface RespuestaAuth {
  ok: true;
  token: string;
  usuario: Usuario;
}

export interface DatosRegistro {
  nombre: string;
  correo: string;
  contrasena: string;
  confirmarContrasena: string;
  planId: number;
  rol: Exclude<NombreRol, 'administrador'>;
}

export function login(correo: string, contrasena: string): Promise<RespuestaAuth> {
  return peticion<RespuestaAuth>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ correo, contrasena }),
  });
}

export function registro(datos: DatosRegistro): Promise<RespuestaAuth> {
  return peticion<RespuestaAuth>('/auth/registro', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export async function obtenerPerfil(): Promise<Usuario> {
  const datos = await peticion<{ ok: true; usuario: Usuario }>('/auth/perfil');
  return datos.usuario;
}

export async function listarPlanes(): Promise<Plan[]> {
  const datos = await peticion<{ ok: true; planes: Plan[] }>('/planes');
  return datos.planes;
}
