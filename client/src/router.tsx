import { createBrowserRouter } from 'react-router';
import LayoutPrincipal from './layouts/LayoutPrincipal';
import InicioPage from './pages/InicioPage';
import NoEncontradoPage from './pages/NoEncontradoPage';

/**
 * Rutas de la aplicación. Cada integrante agrega aquí las páginas de su módulo:
 *  - Persona A: /login, /registro y rutas protegidas
 *  - Persona B: /noticias/:id y /admin/noticias, /admin/categorias
 *  - Persona C: /publicidad/... y /admin/publicaciones
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutPrincipal />,
    children: [
      { index: true, element: <InicioPage /> },
      { path: '*', element: <NoEncontradoPage /> },
    ],
  },
]);
