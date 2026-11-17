import { Link, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';

/**
 * Barra de navegación.
 * El diseño y el logo son PROVISIONALES (los define la Persona C);
 * la parte de sesión (login, registro, perfil, salir) es de la Persona A.
 */
export default function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const navegar = useNavigate();

  function salir() {
    cerrarSesion();
    navegar('/');
  }

  return (
    <header className="bg-primario text-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="text-xl font-bold">GlobalNews</Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-secundario">Inicio</Link>
          {/* Aquí B y C agregan los enlaces de su módulo según usuario.rol */}
          {usuario ? (
            <>
              <Link to="/perfil" className="hover:text-secundario">Hola, {usuario.nombre.split(' ')[0]}</Link>
              <button type="button" onClick={salir} className="rounded bg-white/15 px-3 py-1 hover:bg-white/25">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-secundario">Iniciar sesión</Link>
              <Link to="/registro" className="rounded bg-secundario px-3 py-1 font-semibold text-texto hover:opacity-90">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
