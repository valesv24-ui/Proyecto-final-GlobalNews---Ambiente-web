import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import CampoFormulario from '../components/CampoFormulario';
import { useAuth } from '../hooks/useAuth';
import { ErrorApi } from '../services/api';

export default function LoginPage() {
  const { usuario, iniciarSesion } = useAuth();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  // Página a la que quería entrar antes de que RutaProtegida lo enviara aquí
  const destino = (ubicacion.state as { desde?: string } | null)?.desde ?? '/';

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<ErrorApi | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (usuario) return <Navigate to={destino} replace />;

  async function manejarEnvio(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await iniciarSesion(correo, contrasena);
      navegar(destino, { replace: true });
    } catch (err) {
      setError(err instanceof ErrorApi ? err : new ErrorApi(500, 'Error inesperado'));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-lg bg-white p-6 shadow">
      <h1 className="mb-4 text-2xl font-bold text-primario">Iniciar sesión</h1>
      {/* noValidate: los mensajes de validación los da el servidor (Zod) */}
      <form onSubmit={manejarEnvio} noValidate className="space-y-4">
        {error && !error.errorDeCampo('correo') && !error.errorDeCampo('contrasena') && (
          <p className="rounded bg-red-50 p-3 text-sm text-error">{error.message}</p>
        )}
        <CampoFormulario id="correo" etiqueta="Correo electrónico" type="email" autoComplete="email"
          value={correo} onChange={(e) => setCorreo(e.target.value)} error={error?.errorDeCampo('correo')} />
        <CampoFormulario id="contrasena" etiqueta="Contraseña" type="password" autoComplete="current-password"
          value={contrasena} onChange={(e) => setContrasena(e.target.value)} error={error?.errorDeCampo('contrasena')} />
        <button type="submit" disabled={enviando}
          className="w-full rounded bg-primario py-2 font-semibold text-white hover:bg-primario-claro disabled:opacity-60">
          {enviando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        ¿No tiene cuenta? <Link to="/registro" className="text-primario-claro underline">Regístrese</Link>
      </p>
    </section>
  );
}
