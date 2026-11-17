import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import type { NombreRol } from '../types/usuario';

interface Props {
  /** Roles que pueden entrar. Si no se indica, basta con haber iniciado sesión. */
  roles?: NombreRol[];
}

/**
 * Protege un grupo de rutas en el router:
 * - Sin sesión: redirige a /login y recuerda a dónde quería ir.
 * - Con sesión pero sin el rol: redirige a /sin-permiso.
 * El servidor también valida el token y el rol; esto solo mejora la navegación.
 */
export default function RutaProtegida({ roles }: Props) {
  const { usuario, cargando } = useAuth();
  const ubicacion = useLocation();

  if (cargando) return <p className="py-10 text-center">Verificando sesión...</p>;
  if (!usuario) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/sin-permiso" replace />;
  return <Outlet />;
}
