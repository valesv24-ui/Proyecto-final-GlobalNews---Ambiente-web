import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthContext, type ValorAuth } from './authContext';
import * as authService from '../services/authService';
import { tokenStorage } from '../services/api';
import type { Usuario } from '../types/usuario';

/**
 * Guarda la sesión del usuario y la comparte con toda la app (Context API).
 * - El token se guarda en localStorage para no perder la sesión al recargar.
 * - Al abrir la página, si hay token, pide el perfil al servidor para validarlo.
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  // Solo hay algo que revisar si quedó un token guardado de una visita anterior
  const [cargando, setCargando] = useState<boolean>(() => tokenStorage.obtener() !== null);

  useEffect(() => {
    if (!tokenStorage.obtener()) return;
    authService.obtenerPerfil()
      .then(setUsuario)
      .catch(() => tokenStorage.borrar()) // token vencido o inválido: se descarta
      .finally(() => setCargando(false));
  }, []);

  const iniciarSesion = useCallback(async (correo: string, contrasena: string) => {
    const { token, usuario: datos } = await authService.login(correo, contrasena);
    tokenStorage.guardar(token);
    setUsuario(datos);
    return datos;
  }, []);

  const registrarse = useCallback(async (datosRegistro: authService.DatosRegistro) => {
    const { token, usuario: datos } = await authService.registro(datosRegistro);
    tokenStorage.guardar(token);
    setUsuario(datos);
    return datos;
  }, []);

  const cerrarSesion = useCallback(() => {
    tokenStorage.borrar();
    setUsuario(null);
  }, []);

  const valor = useMemo<ValorAuth>(
    () => ({ usuario, cargando, iniciarSesion, registrarse, cerrarSesion }),
    [usuario, cargando, iniciarSesion, registrarse, cerrarSesion],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
