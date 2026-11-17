import { createContext } from 'react';
import type { Usuario } from '../types/usuario';
import type { DatosRegistro } from '../services/authService';

/** Lo que cualquier componente puede leer o hacer con la sesión */
export interface ValorAuth {
  usuario: Usuario | null;
  /** true mientras se revisa si había una sesión guardada al abrir la página */
  cargando: boolean;
  iniciarSesion: (correo: string, contrasena: string) => Promise<Usuario>;
  registrarse: (datos: DatosRegistro) => Promise<Usuario>;
  cerrarSesion: () => void;
}

export const AuthContext = createContext<ValorAuth | null>(null);
