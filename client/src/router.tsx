import { createBrowserRouter } from 'react-router';
import LayoutPrincipal from './layouts/LayoutPrincipal';
import RutaProtegida from './components/RutaProtegida';
import InicioPage from './pages/InicioPage';
import LoginPage from './pages/LoginPage';
import RegistroPage from './pages/RegistroPage';
import PerfilPage from './pages/PerfilPage';
import SinPermisoPage from './pages/SinPermisoPage';
import NoEncontradoPage from './pages/NoEncontradoPage';

/**
 * Rutas de la aplicación. Cada integrante agrega aquí las páginas de su módulo:
 *  - Persona B: /noticias/:id (pública) y /admin/noticias, /admin/categorias (administrador)
 *  - Persona C: /publicidad/... (publicitario) y /admin/publicaciones (administrador)
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutPrincipal />,
    children: [
      // Rutas públicas
      { index: true, element: <InicioPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'registro', element: <RegistroPage /> },
      { path: 'sin-permiso', element: <SinPermisoPage /> },

      // Cualquier usuario con sesión iniciada
      {
        element: <RutaProtegida />,
        children: [
          { path: 'perfil', element: <PerfilPage /> },
        ],
      },

      // Solo administrador (Persona B y C agregan aquí sus páginas de administración)
      {
        path: 'admin',
        element: <RutaProtegida roles={['administrador']} />,
        children: [],
      },

      // Solo publicitario (Persona C agrega aquí sus páginas)
      {
        path: 'publicidad',
        element: <RutaProtegida roles={['publicitario']} />,
        children: [],
      },

      { path: '*', element: <NoEncontradoPage /> },
    ],
  },
]);
