import { useContext } from 'react';
import { AuthContext, type ValorAuth } from '../context/authContext';

/**
 * Hook para usar la sesión en cualquier componente:
 *   const { usuario, iniciarSesion, cerrarSesion } = useAuth();
 */
export function useAuth(): ValorAuth {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return contexto;
}
