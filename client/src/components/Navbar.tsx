import { Link } from 'react-router';

/**
 * Barra de navegación PROVISIONAL.
 * La Persona C la reemplaza con el logo y el diseño final;
 * la Persona A agrega los enlaces según el rol en la tarea de login.
 */
export default function Navbar() {
  return (
    <header className="bg-primario text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold">GlobalNews</Link>
        <div className="flex gap-4">
          <Link to="/" className="hover:text-secundario">Inicio</Link>
        </div>
      </nav>
    </header>
  );
}
