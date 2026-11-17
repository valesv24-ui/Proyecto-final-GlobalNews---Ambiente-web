// Tipos que reflejan lo que devuelve la API (ver server/src/types/usuario.ts)

export type NombreRol = 'cliente' | 'publicitario' | 'administrador';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: NombreRol;
  plan_id: number | null;
  plan: string | null;
  activo: boolean;
  creado_en: string;
}

export interface Plan {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio_mensual: string;
}
