import { useAuth } from '../hooks/useAuth';

/** Página protegida de ejemplo: solo se ve con sesión iniciada */
export default function PerfilPage() {
  const { usuario } = useAuth();
  if (!usuario) return null; // RutaProtegida ya garantiza que hay usuario

  return (
    <section className="mx-auto max-w-md rounded-lg bg-white p-6 shadow">
      <h1 className="mb-4 text-2xl font-bold text-primario">Mi perfil</h1>
      <dl className="space-y-2">
        <div><dt className="text-sm text-gray-500">Nombre</dt><dd>{usuario.nombre}</dd></div>
        <div><dt className="text-sm text-gray-500">Correo</dt><dd>{usuario.correo}</dd></div>
        <div><dt className="text-sm text-gray-500">Rol</dt><dd className="capitalize">{usuario.rol}</dd></div>
        {usuario.plan && <div><dt className="text-sm text-gray-500">Plan</dt><dd>{usuario.plan}</dd></div>}
      </dl>
    </section>
  );
}
