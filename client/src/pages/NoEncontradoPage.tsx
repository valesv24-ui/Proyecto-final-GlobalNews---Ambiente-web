import { Link } from 'react-router';

/** Se muestra cuando la URL no coincide con ninguna ruta */
export default function NoEncontradoPage() {
  return (
    <section className="py-16 text-center">
      <h1 className="text-5xl font-bold text-primario">404</h1>
      <p className="mt-2">La página que busca no existe.</p>
      <Link to="/" className="mt-4 inline-block text-primario-claro underline">Volver al inicio</Link>
    </section>
  );
}
