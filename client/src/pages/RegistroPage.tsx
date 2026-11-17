import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import CampoFormulario from '../components/CampoFormulario';
import { useAuth } from '../hooks/useAuth';
import { ErrorApi } from '../services/api';
import { listarPlanes, type DatosRegistro } from '../services/authService';
import type { Plan } from '../types/usuario';

const FORMULARIO_VACIO: DatosRegistro = {
  nombre: '', correo: '', contrasena: '', confirmarContrasena: '', planId: 0, rol: 'cliente',
};

export default function RegistroPage() {
  const { usuario, registrarse } = useAuth();
  const navegar = useNavigate();

  const [datos, setDatos] = useState<DatosRegistro>(FORMULARIO_VACIO);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [error, setError] = useState<ErrorApi | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Carga los 3 planes de suscripción desde la API
  useEffect(() => {
    listarPlanes()
      .then(setPlanes)
      .catch((err: unknown) => setError(err instanceof ErrorApi ? err : null));
  }, []);

  if (usuario) return <Navigate to="/" replace />;

  // Actualiza un solo campo del formulario manteniendo los demás
  function cambiar<K extends keyof DatosRegistro>(campo: K, valor: DatosRegistro[K]) {
    setDatos((anterior) => ({ ...anterior, [campo]: valor }));
  }

  async function manejarEnvio(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await registrarse(datos);
      navegar('/', { replace: true });
    } catch (err) {
      setError(err instanceof ErrorApi ? err : new ErrorApi(500, 'Error inesperado'));
    } finally {
      setEnviando(false);
    }
  }

  const campos: (keyof DatosRegistro)[] = ['nombre', 'correo', 'contrasena', 'confirmarContrasena', 'planId', 'rol'];
  const errorGeneral = error && !campos.some((c) => error.errorDeCampo(c)) ? error.message : null;

  return (
    <section className="mx-auto max-w-lg rounded-lg bg-white p-6 shadow">
      <h1 className="mb-4 text-2xl font-bold text-primario">Crear cuenta</h1>
      <form onSubmit={manejarEnvio} noValidate className="space-y-4">
        {errorGeneral && <p className="rounded bg-red-50 p-3 text-sm text-error">{errorGeneral}</p>}

        <CampoFormulario id="nombre" etiqueta="Nombre completo" autoComplete="name"
          value={datos.nombre} onChange={(e) => cambiar('nombre', e.target.value)} error={error?.errorDeCampo('nombre')} />
        <CampoFormulario id="correo" etiqueta="Correo electrónico" type="email" autoComplete="email"
          value={datos.correo} onChange={(e) => cambiar('correo', e.target.value)} error={error?.errorDeCampo('correo')} />
        <CampoFormulario id="contrasena" etiqueta="Contraseña" type="password" autoComplete="new-password"
          value={datos.contrasena} onChange={(e) => cambiar('contrasena', e.target.value)} error={error?.errorDeCampo('contrasena')} />
        <CampoFormulario id="confirmarContrasena" etiqueta="Confirmar contraseña" type="password" autoComplete="new-password"
          value={datos.confirmarContrasena} onChange={(e) => cambiar('confirmarContrasena', e.target.value)}
          error={error?.errorDeCampo('confirmarContrasena')} />

        {/* Tipo de cuenta: el rol administrador no se puede elegir */}
        <fieldset className="space-y-1">
          <legend className="text-sm font-medium">Tipo de cuenta</legend>
          <div className="flex gap-6">
            {(['cliente', 'publicitario'] as const).map((rol) => (
              <label key={rol} className="flex items-center gap-2">
                <input type="radio" name="rol" checked={datos.rol === rol} onChange={() => cambiar('rol', rol)} />
                {rol === 'cliente' ? 'Lector' : 'Anunciante (publicitario)'}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Los 3 planes de suscripción */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Plan de suscripción</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {planes.map((plan) => (
              <label key={plan.id}
                className={`cursor-pointer rounded border p-3 text-sm ${datos.planId === plan.id ? 'border-primario bg-blue-50' : 'border-gray-300'}`}>
                <input type="radio" name="plan" className="sr-only"
                  checked={datos.planId === plan.id} onChange={() => cambiar('planId', plan.id)} />
                <span className="block font-semibold">{plan.nombre}</span>
                <span className="block text-primario">
                  {Number(plan.precio_mensual) === 0 ? 'Gratis' : `$${plan.precio_mensual}/mes`}
                </span>
                <span className="mt-1 block text-gray-600">{plan.descripcion}</span>
              </label>
            ))}
          </div>
          {error?.errorDeCampo('planId') && <p className="text-sm text-error">{error.errorDeCampo('planId')}</p>}
        </fieldset>

        <button type="submit" disabled={enviando}
          className="w-full rounded bg-primario py-2 font-semibold text-white hover:bg-primario-claro disabled:opacity-60">
          {enviando ? 'Creando cuenta...' : 'Registrarse'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        ¿Ya tiene cuenta? <Link to="/login" className="text-primario-claro underline">Inicie sesión</Link>
      </p>
    </section>
  );
}
