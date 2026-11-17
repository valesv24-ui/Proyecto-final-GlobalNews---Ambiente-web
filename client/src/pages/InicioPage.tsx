import { useEffect, useState } from 'react';
import { ErrorApi, peticion } from '../services/api';

/**
 * Página de inicio PROVISIONAL.
 * La Persona B la reemplaza con el listado de noticias y la Persona C agrega los widgets.
 * Por ahora solo comprueba que el frontend se comunica con la API.
 */
export default function InicioPage() {
  const [estadoApi, setEstadoApi] = useState<'cargando' | 'ok' | 'error'>('cargando');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    peticion<{ estado: string; mensaje: string }>('/salud')
      .then((datos) => { setEstadoApi('ok'); setMensaje(datos.mensaje); })
      .catch((error: unknown) => {
        setEstadoApi('error');
        setMensaje(error instanceof ErrorApi ? error.message : 'Error desconocido');
      });
  }, []);

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold text-primario">Bienvenido a GlobalNews</h1>
      <p className={estadoApi === 'error' ? 'text-error' : estadoApi === 'ok' ? 'text-exito' : ''}>
        {estadoApi === 'cargando' ? 'Conectando con la API...' : mensaje}
      </p>
    </section>
  );
}
