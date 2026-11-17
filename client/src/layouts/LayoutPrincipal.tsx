import { Outlet } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/**
 * Estructura común de todas las páginas: Navbar arriba, Footer abajo
 * y en el medio (<Outlet />) se dibuja la página de la ruta actual.
 */
export default function LayoutPrincipal() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
