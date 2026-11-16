/** Plan de suscripción que el usuario elige al registrarse */
export interface Plan {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio_mensual: string; // NUMERIC llega como texto desde pg para no perder precisión
}
