import { Link } from 'react-router';

/** Se muestra cuando el usuario inició sesión pero su rol no tiene acceso (403) */
export default function SinPermisoPage() {
  return (
    <section className="py-16 text-center">
      <h1 className="text-5xl font-bold text-primario">403</h1>
      <p className="mt-2">No tiene permisos para ver esta página.</p>
      <Link to="/" className="mt-4 inline-block text-primario-claro underline">Volver al inicio</Link>
    </section>
  );
}
