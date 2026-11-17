import type { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string;
  error?: string;
}

/** Input con su etiqueta y el mensaje de error debajo (reutilizable en todos los formularios) */
export default function CampoFormulario({ etiqueta, error, id, ...props }: Props) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium">{etiqueta}</label>
      <input
        id={id}
        {...props}
        className={`w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-primario-claro ${error ? 'border-error' : 'border-gray-300'}`}
        aria-invalid={error ? true : undefined}
      />
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
